import { useNavigate } from "react-router-dom"
import { useGame } from "../lib/gameContext"

export default function Results() {
  const navigate = useNavigate()
  const { results, resetGame } = useGame()

  const winner = results.find((result) => result.passed)
  const formatElapsed = (timeToSolveMs?: number) => {
    if (typeof timeToSolveMs !== "number") return "N/A"
    const totalSeconds = Math.max(0, Math.floor(timeToSolveMs / 1000))
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  return (
    <div className="retro-screen scanlines">
      <div className="retro-shell">
        <div className="retro-panel center">
          <h1 className="retro-title">▓▒░ GAME OVER ░▒▓</h1>
          <p className="retro-subtitle">{winner ? `★ ${winner.username} WINS! ★` : "No winner yet"}</p>
        </div>
        <div className="retro-panel">
          <h2 className="retro-block-title">► Final Results</h2>
          <ul className="retro-list">
            {results.map((result) => (
              <li key={result.socketId} className="retro-result-item">
                <div className="retro-result-head">
                  <span>
                    {result.passed ? "▸" : "○"} {result.username}
                  </span>
                  <span className={`retro-tag ${result.passed ? "pass" : "fail"}`}>
                    {result.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
                <p>
                  Tests: {result.passedCount}/{result.totalCount}
                  {result.runtime ? ` • ${result.runtime}ms` : ""}
                </p>
                <p>Solve time: {result.passed ? formatElapsed(result.timeToSolveMs) : "N/A"}</p>
              </li>
            ))}
            {results.length === 0 ? <li className="retro-list-empty">Submit code to see results.</li> : null}
          </ul>
        </div>
        <div className="retro-row">
          <button
            className="retro-btn retro-btn-secondary"
            onClick={() => {
              resetGame()
              navigate("/")
            }}
          >
            [ Home ]
          </button>
          <button
            className="retro-btn retro-btn-primary"
            onClick={() => {
              resetGame()
              navigate("/")
            }}
          >
            [ Play Again ]
          </button>
        </div>
      </div>
    </div>
  )
}