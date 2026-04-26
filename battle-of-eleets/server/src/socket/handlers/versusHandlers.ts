import { problems } from '../../../../judge/src/problems';
import { runSubmission } from '../../../../judge/src/pipeline';
import { rooms } from '../../state/rooms';
import { ClientSocket, SocketServer } from '../types';

export function registerVersusHandlers(io: SocketServer, socket: ClientSocket): void {
  socket.on('submit-code', async ({ roomCode, code, language }) => {
    const room = rooms.get(roomCode);
    if (!room || room.mode !== 'VERSUS' || room.status !== 'IN_GAME') {
      return;
    }

    const player = room.players.find((entry) => entry.socketId === socket.id);
    if (!player) {
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
      runtime?: number;
      error?: string;
    };

    try {
      const baseResult = await runSubmission(code, language, problem.testCases);
      result = {
        ...baseResult,
        socketId: socket.id,
        username: player.username,
      };
    } catch (error) {
      result = {
        socketId: socket.id,
        username: player.username,
        passed: false,
        passedCount: 0,
        totalCount: problem.testCases.length,
        error: error instanceof Error ? error.message : 'Submission failed',
      };
    }

    room.submissions ??= {};
    room.submissions[socket.id] = result;

    io.to(roomCode).emit('submission-result', result);

    const results = Object.values(room.submissions);
    const winner = results.find((entry) => entry.passed);
    const bothPlayersSubmitted = results.length >= 2;
    if (winner || bothPlayersSubmitted) {
      room.status = 'FINISHED';
      io.to(roomCode).emit('game-ended', {
        winnerId: winner?.socketId,
        results,
      });
    }
  });
}
