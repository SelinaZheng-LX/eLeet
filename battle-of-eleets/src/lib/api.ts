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
