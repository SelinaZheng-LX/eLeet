import { MOCK_PROBLEMS } from "./mockData"
import type { Problem } from "./types"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001"
const useMockApi = String(import.meta.env.VITE_MOCK_API ?? "false") === "true"

export async function getProblems(): Promise<Problem[]> {
  if (useMockApi) {
    return MOCK_PROBLEMS
  }

  const response = await fetch(`${apiUrl}/problems`)
  if (!response.ok) {
    throw new Error("Failed to load problems")
  }

  return (await response.json()) as Problem[]
}

export async function getProblemById(problemId: string): Promise<Problem> {
  if (useMockApi) {
    const problem = MOCK_PROBLEMS.find((entry) => entry.id === problemId)
    if (!problem) {
      throw new Error("Problem not found")
    }
    return problem
  }

  const response = await fetch(`${apiUrl}/problems/${problemId}`)
  if (!response.ok) {
    throw new Error("Failed to load problem")
  }

  return (await response.json()) as Problem
}
