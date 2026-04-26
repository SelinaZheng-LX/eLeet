export type GameMode = "VERSUS" | "COLLAB"

export type Difficulty = "easy" | "medium" | "hard"

export interface Player {
  socketId: string
  username: string
}

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  prompt: string
  starterCode: Record<string, string>
  testCases: TestCase[]
}

export interface SubmissionResult {
  socketId: string
  username: string
  passed: boolean
  passedCount: number
  totalCount: number
  submittedAt?: number
  timeToSolveMs?: number
  runtime?: number
  error?: string
}

export interface Room {
  code: string
  hostSocketId: string
  mode: GameMode | null
  problemId: string | null
  startedAt?: number
}
