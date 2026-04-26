import { problems } from '../../../../judge/src/problems';
import { runSubmission } from '../../../../judge/src/pipeline';
import { TurnEntry } from '../../../../shared/types';
import { rooms } from '../../state/rooms';
import { clearRoomTurnTimer } from '../turnTimer';
import { ClientSocket, SocketServer } from '../types';

function getOtherPlayerSocketId(roomCode: string, socketId: string): string | null {
  const room = rooms.get(roomCode);
  if (!room) {
    return null;
  }
  const otherPlayer = room.players.find((player) => player.socketId !== socketId);
  return otherPlayer?.socketId ?? null;
}

function buildNextCollabState(
  baseCode: string,
  draftCode: string,
): { nextCodeState: string; lineForHistory: string } | null {
  const normalizedBase = baseCode.replace(/\r/g, '');
  const normalizedDraft = draftCode.replace(/\r/g, '');
  if (normalizedDraft === normalizedBase) {
    return null;
  }

  // Allow free deletions/edits, but cap each turn to one newly added non-empty line.
  const baseLines = normalizedBase.split('\n');
  const draftLines = normalizedDraft.split('\n');
  const baseFreq = new Map<string, number>();
  const draftFreq = new Map<string, number>();

  for (const line of baseLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    baseFreq.set(line, (baseFreq.get(line) ?? 0) + 1);
  }
  for (const line of draftLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    draftFreq.set(line, (draftFreq.get(line) ?? 0) + 1);
  }

  let addedNonEmptyLines = 0;
  for (const [line, count] of draftFreq.entries()) {
    const prev = baseFreq.get(line) ?? 0;
    if (count > prev) {
      addedNonEmptyLines += count - prev;
    }
  }
  if (addedNonEmptyLines > 1) {
    return null;
  }

  const nextCodeState = normalizedDraft.endsWith('\n')
    ? normalizedDraft
    : `${normalizedDraft}\n`;

  const changedLine =
    draftLines.find((line, index) => line !== (baseLines[index] ?? '')) ?? '';
  const lineForHistory = changedLine.trim().length > 0 ? changedLine : '[edited turn]';

  return {
    nextCodeState,
    lineForHistory,
  };
}

export function registerCollabHandlers(io: SocketServer, socket: ClientSocket): void {
  socket.on('add-line', ({ roomCode, draftCode }) => {
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

    const problem = problems.find((entry) => entry.id === room.problemId);
    const starterCode = problem?.starterCode.python ?? '';
    const baseCode = room.codeState && room.codeState.length > 0 ? room.codeState : starterCode;
    const nextState = buildNextCollabState(baseCode, String(draftCode ?? ''));
    if (!nextState) {
      return;
    }

    const turnNumber = room.turnNumber ?? 1;
    const turnEntry: TurnEntry = {
      socketId: socket.id,
      username: player.username,
      line: nextState.lineForHistory,
      turnNumber,
    };

    room.codeState = nextState.nextCodeState;
    room.turnHistory ??= [];
    room.turnHistory.push(turnEntry);

    const nextSocketId = getOtherPlayerSocketId(roomCode, socket.id);
    if (nextSocketId) {
      room.currentTurnSocketId = nextSocketId;
      room.turnNumber = turnNumber + 1;
    }

    io.to(roomCode).emit('code-updated', {
      codeState: nextState.nextCodeState,
      lastLine: turnEntry,
    });

    if (room.currentTurnSocketId) {
      io.to(roomCode).emit('turn-changed', {
        currentTurnSocketId: room.currentTurnSocketId,
        turnNumber: room.turnNumber ?? turnNumber,
      });
    }
  });

  socket.on('submit-collab', async ({ roomCode, language, draftCode }) => {
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

    const starterCode = problem.starterCode.python ?? '';
    const baseCode = room.codeState && room.codeState.length > 0 ? room.codeState : starterCode;
    const codeForEvaluation = typeof draftCode === 'string' && draftCode.length > 0
      ? (draftCode.replace(/\r/g, '').endsWith('\n')
          ? draftCode.replace(/\r/g, '')
          : `${draftCode.replace(/\r/g, '')}\n`)
      : baseCode;
    room.codeState = codeForEvaluation;
    io.to(roomCode).emit('code-updated', {
      codeState: codeForEvaluation,
      lastLine: {
        socketId: socket.id,
        username: submittedBy.username,
        line: '[submitted]',
        turnNumber: room.turnNumber ?? 1,
      },
    });

    let result: {
      socketId: string;
      username: string;
      passed: boolean;
      passedCount: number;
      totalCount: number;
      submittedAt?: number;
      timeToSolveMs?: number;
      runtime?: number;
      error?: string;
    };

    try {
      const baseResult = await runSubmission(codeForEvaluation, language, problem.testCases);
      const submittedAt = Date.now();
      const teamName = room.players.map((player) => player.username).join(' + ');
      result = {
        ...baseResult,
        socketId: room.code,
        username: teamName || submittedBy.username,
        submittedAt,
        timeToSolveMs: room.startedAt ? Math.max(0, submittedAt - room.startedAt) : undefined,
      };
    } catch (error) {
      const submittedAt = Date.now();
      result = {
        socketId: room.code,
        username: room.players.map((player) => player.username).join(' + ') || submittedBy.username,
        passed: false,
        passedCount: 0,
        totalCount: problem.testCases.length,
        submittedAt,
        timeToSolveMs: room.startedAt ? Math.max(0, submittedAt - room.startedAt) : undefined,
        error: error instanceof Error ? error.message : 'Submission failed',
      };
    }

    io.to(roomCode).emit('collab-result', result);

    if (result.passed) {
      room.status = 'FINISHED';
      clearRoomTurnTimer(roomCode);
      io.to(roomCode).emit('game-ended', {
        winnerId: undefined,
        results: [result],
      });
    }
  });
}
