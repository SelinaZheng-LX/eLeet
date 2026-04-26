import { problems } from '../../../../judge/src/problems';
import { runSubmission } from '../../../../judge/src/pipeline';
import { TurnEntry } from '../../../../shared/types';
import { rooms } from '../../state/rooms';
import { clearRoomTurnTimer, scheduleTurnTimer } from '../turnTimer';
import { ClientSocket, SocketServer } from '../types';

function getOtherPlayerSocketId(roomCode: string, socketId: string): string | null {
  const room = rooms.get(roomCode);
  if (!room) {
    return null;
  }
  const otherPlayer = room.players.find((player) => player.socketId !== socketId);
  return otherPlayer?.socketId ?? null;
}

export function registerCollabHandlers(io: SocketServer, socket: ClientSocket): void {
  socket.on('add-line', ({ roomCode, line }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'COLLAB' || room.status !== 'IN_GAME') {
      return;
    }

    if (room.currentTurnSocketId !== socket.id) {
      return;
    }

    const player = room.players.find((entry) => entry.socketId === socket.id);
    if (!player) {
      return;
    }

    const nextCodeState = room.codeState ? `${room.codeState}\n${line}` : line;
    const turnNumber = room.turnNumber ?? 1;
    const turnEntry: TurnEntry = {
      socketId: socket.id,
      username: player.username,
      line,
      turnNumber,
    };

    room.codeState = nextCodeState;
    room.turnHistory ??= [];
    room.turnHistory.push(turnEntry);

    const nextSocketId = getOtherPlayerSocketId(roomCode, socket.id);
    if (nextSocketId) {
      room.currentTurnSocketId = nextSocketId;
      room.turnNumber = turnNumber + 1;
    }

    io.to(roomCode).emit('code-updated', {
      codeState: nextCodeState,
      lastLine: turnEntry,
    });

    if (room.currentTurnSocketId) {
      io.to(roomCode).emit('turn-changed', {
        currentTurnSocketId: room.currentTurnSocketId,
        turnNumber: room.turnNumber ?? turnNumber,
      });
      scheduleTurnTimer(io, roomCode);
    }
  });

  socket.on('submit-collab', async ({ roomCode, language }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'COLLAB' || room.status !== 'IN_GAME') {
      return;
    }

    const submittedBy = room.players.find((entry) => entry.socketId === socket.id);
    if (!submittedBy) {
      return;
    }

    const problem = problems.find((entry) => entry.id === room.problemId);
    if (!problem) {
      return;
    }

    let result: {
      socketId: string;
      username: string;
      passed: boolean;
      passedCount: number;
      totalCount: number;
      submittedAt?: number;
      runtime?: number;
      error?: string;
    };

    try {
      const baseResult = await runSubmission(room.codeState ?? '', language, problem.testCases);
      result = {
        ...baseResult,
        socketId: socket.id,
        username: submittedBy.username,
        submittedAt: Date.now(),
      };
    } catch (error) {
      result = {
        socketId: socket.id,
        username: submittedBy.username,
        passed: false,
        passedCount: 0,
        totalCount: problem.testCases.length,
        submittedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Submission failed',
      };
    }

    room.status = 'FINISHED';
    clearRoomTurnTimer(roomCode);

    io.to(roomCode).emit('collab-result', result);
    io.to(roomCode).emit('game-ended', {
      winnerId: result.passed ? socket.id : undefined,
      results: [result],
    });
  });
}
