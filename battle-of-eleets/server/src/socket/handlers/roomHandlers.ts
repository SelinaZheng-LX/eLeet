import { problems } from '../../../../judge/src/problems';
import { Room } from '../../../../shared/types';
import { rooms } from '../../state/rooms';
import { getRoomBySocketId, generateUniqueRoomCode } from '../helpers';
import { clearRoomTurnTimer, scheduleTurnTimer } from '../turnTimer';
import { ClientSocket, SocketServer } from '../types';

export function registerRoomHandlers(io: SocketServer, socket: ClientSocket): void {
  socket.on('create-room', ({ username }) => {
    const roomCode = generateUniqueRoomCode();
    const room: Room = {
      code: roomCode,
      players: [{ socketId: socket.id, username }],
      hostSocketId: socket.id,
      mode: null,
      problemId: null,
      status: 'LOBBY',
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('room-created', { roomCode });
    io.to(roomCode).emit('player-joined', { players: room.players });
  });

  socket.on('join-room', ({ roomCode, username }) => {
    const normalizedCode = roomCode.toUpperCase();
    const room = rooms.get(normalizedCode);
    if (!room || room.players.length >= 2) {
      return;
    }

    const alreadyJoined = room.players.some((player) => player.socketId === socket.id);
    if (!alreadyJoined) {
      room.players.push({ socketId: socket.id, username });
    }

    socket.join(normalizedCode);
    io.to(normalizedCode).emit('player-joined', { players: room.players });
  });

  socket.on('select-mode', ({ roomCode, mode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) {
      return;
    }

    room.mode = mode;
    io.to(roomCode).emit('mode-selected', { mode });
  });

  socket.on('select-problem', ({ roomCode, problemId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) {
      return;
    }

    const problem = problems.find((entry) => entry.id === problemId);
    if (!problem) {
      return;
    }

    room.problemId = problemId;
    io.to(roomCode).emit('problem-selected', { problem });
  });

  socket.on('start-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id || !room.mode || !room.problemId) {
      return;
    }

    room.status = 'IN_GAME';
    const now = Date.now();
    room.startedAt = now;

    if (room.mode === 'VERSUS') {
      room.submissions = {};
    }

    if (room.mode === 'COLLAB') {
      const selectedProblem = problems.find((entry) => entry.id === room.problemId);
      room.codeState = selectedProblem?.starterCode.python ?? '';
      room.turnHistory = [];
      room.turnNumber = 1;
      room.currentTurnSocketId = room.players[0]?.socketId;
      scheduleTurnTimer(io, roomCode);
    }

    io.to(roomCode).emit('game-started', { room, serverNow: now });
  });

  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room) {
      return;
    }

    const roomCode = room.code;
    room.players = room.players.filter((player) => player.socketId !== socket.id);

    if (room.hostSocketId === socket.id) {
      room.hostSocketId = room.players[0]?.socketId ?? '';
    }

    if (room.mode === 'COLLAB' && room.currentTurnSocketId === socket.id) {
      room.currentTurnSocketId = room.players[0]?.socketId;
    }

    if (room.players.length === 0) {
      clearRoomTurnTimer(roomCode);
      rooms.delete(roomCode);
      return;
    }

    io.to(roomCode).emit('player-left', { players: room.players });

    if (room.status === 'IN_GAME') {
      room.status = 'FINISHED';
      clearRoomTurnTimer(roomCode);
      const results = room.submissions ? Object.values(room.submissions) : [];
      io.to(roomCode).emit('game-ended', { results });
    }
  });
}
