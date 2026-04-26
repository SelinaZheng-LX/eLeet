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
  if (!normalizedDraft.startsWith(normalizedBase)) {
    return null;
  }

  let suffix = normalizedDraft.slice(normalizedBase.length);
  let startedOnNewLine = false;
  if (suffix.startsWith('\n')) {
    suffix = suffix.slice(1);
    startedOnNewLine = true;
  }
  if (suffix.endsWith('\n')) {
    suffix = suffix.slice(0, -1);
  }

  if (!suffix || suffix.includes('\n') || suffix.trim().length === 0) {
    return null;
  }

  // Preserve exact indentation/content from editor draft. Only enforce
  // one submitted logical line and ensure shared state ends with newline.
  const appendedSegment = `${startedOnNewLine ? '\n' : ''}${suffix}`;
  const nextCodeStateRaw = `${normalizedBase}${appendedSegment}`;
  const nextCodeState = nextCodeStateRaw.endsWith('\n')
    ? nextCodeStateRaw
    : `${nextCodeStateRaw}\n`;

  return {
    nextCodeState,
    lineForHistory: suffix,
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
    const maybeNextState = typeof draftCode === 'string'
      ? buildNextCollabState(baseCode, draftCode)
      : null;
    const codeForEvaluation = maybeNextState?.nextCodeState ?? baseCode;

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
      room.codeState = codeForEvaluation;
      room.status = 'FINISHED';
      clearRoomTurnTimer(roomCode);
      io.to(roomCode).emit('game-ended', {
        winnerId: undefined,
        results: [result],
      });
    }
  });
}
