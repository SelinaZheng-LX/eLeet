export type GameMode = 'VERSUS' | 'COLLAB';
export type RoomStatus = 'LOBBY' | 'IN_GAME' | 'FINISHED';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  socketId: string;
  username: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
  starterCode: Record<string, string>;
  testCases: TestCase[];
}

export interface TurnEntry {
  socketId: string;
  username: string;
  line: string;
  turnNumber: number;
}

export interface SubmissionResult {
  socketId: string;
  username: string;
  passed: boolean;
  passedCount: number;
  totalCount: number;
  submittedAt?: number;
  timeToSolveMs?: number;
  runtime?: number;
  error?: string;
}

export interface Room {
  code: string;
  players: Player[];
  hostSocketId: string;
  mode: GameMode | null;
  problemId: string | null;
  status: RoomStatus;
  submissions?: Record<string, SubmissionResult>;
  codeState?: string;
  currentTurnSocketId?: string;
  turnNumber?: number;
  turnHistory?: TurnEntry[];
  startedAt?: number;
}

export interface SocketEvents {
  'create-room': { username: string };
  'join-room': { roomCode: string; username: string };
  'select-mode': { roomCode: string; mode: GameMode };
  'select-problem': { roomCode: string; problemId: string };
  'start-game': { roomCode: string };
  'submit-code': { roomCode: string; code: string; language: string };
  'add-line': { roomCode: string; line: string; baseCode?: string };
  'submit-collab': { roomCode: string; language: string };

  'room-created': { roomCode: string };
  'player-joined': { players: Player[] };
  'player-left': { players: Player[] };
  'mode-selected': { mode: GameMode };
  'problem-selected': { problem: Problem };
  'game-started': { room: Room; serverNow: number };
  'submission-result': SubmissionResult;
  'game-ended': { winnerId?: string; results: SubmissionResult[] };
  'turn-changed': { currentTurnSocketId: string; turnNumber: number };
  'code-updated': { codeState: string; lastLine: TurnEntry };
  'collab-result': SubmissionResult;
}
