import { Room } from '../../../shared/types';
import { rooms } from '../state/rooms';
import { SocketServer } from './types';

const TURN_DURATION_MS = 20_000;
const turnTimeouts = new Map<string, NodeJS.Timeout>();

function clearTurnTimer(roomCode: string): void {
  const timeout = turnTimeouts.get(roomCode);
  if (timeout) {
    clearTimeout(timeout);
    turnTimeouts.delete(roomCode);
  }
}

function getOtherPlayerSocketId(room: Room, socketId: string): string | null {
  const otherPlayer = room.players.find((player) => player.socketId !== socketId);
  return otherPlayer?.socketId ?? null;
}

export function scheduleTurnTimer(io: SocketServer, roomCode: string): void {
  clearTurnTimer(roomCode);

  const timeout = setTimeout(() => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'COLLAB' || room.status !== 'IN_GAME' || !room.currentTurnSocketId) {
      return;
    }

    const nextTurnSocketId = getOtherPlayerSocketId(room, room.currentTurnSocketId);
    if (!nextTurnSocketId) {
      return;
    }

    room.currentTurnSocketId = nextTurnSocketId;
    room.turnNumber = (room.turnNumber ?? 1) + 1;
    io.to(roomCode).emit('turn-changed', {
      currentTurnSocketId: nextTurnSocketId,
      turnNumber: room.turnNumber,
    });

    scheduleTurnTimer(io, roomCode);
  }, TURN_DURATION_MS);

  turnTimeouts.set(roomCode, timeout);
}

export function clearRoomTurnTimer(roomCode: string): void {
  clearTurnTimer(roomCode);
}
