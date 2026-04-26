import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useGame } from "../lib/gameContext"

export default function Lobby() {
  const navigate = useNavigate()
  const {
    roomCode,
    players,
    mode,
    selectedProblem,
    problems,
    gameStarted,
    currentUser,
    selectMode,
    selectProblem,
    startGame,
  } = useGame()
  const isHost = players[0]?.socketId === currentUser?.socketId

  useEffect(() => {
    if (!gameStarted || !mode) return
    navigate(mode === "VERSUS" ? "/versus" : "/collab")
  }, [gameStarted, mode, navigate])

  return (
    <div className="retro-screen scanlines">
      <div className="retro-shell lobby-shell">
        <div className="retro-panel">
          <h1 className="retro-section-title">▓▒░ GAME LOBBY ░▒▓</h1>
          <p className="retro-room-code">Room Code: {roomCode || "------"}</p>
        </div>

        <div className="retro-grid">
          <div className="retro-panel">
            <h2 className="retro-block-title">► Players ({players.length}/2)</h2>
            <ul className="retro-list">
              {players.map((player, index) => (
                <li key={player.socketId} className="retro-list-item">
                  <span>▸ {player.username}</span>
                  {index === 0 ? <span className="retro-tag">HOST</span> : null}
                </li>
              ))}
              {players.length < 2 ? (
                <li className="retro-list-empty">⟳ Waiting for player...</li>
              ) : null}
            </ul>
          </div>

          <div className="retro-panel">
            <h2 className="retro-block-title">► Game Mode</h2>
            <div className="retro-col">
              <button
                className={`retro-btn ${mode === "VERSUS" ? "retro-btn-primary" : "retro-btn-secondary"}`}
                onClick={() => selectMode("VERSUS")}
                disabled={!isHost}
              >
                [ ⚔ Versus ]
              </button>
              <button
                className={`retro-btn ${mode === "COLLAB" ? "retro-btn-primary" : "retro-btn-secondary"}`}
                onClick={() => selectMode("COLLAB")}
                disabled={!isHost}
              >
                [ 🤝 Collab ]
              </button>
            </div>
          </div>
        </div>

        <div className="retro-panel">
          <h2 className="retro-block-title">► Select Problem</h2>
          <select
            className="retro-input"
            value={selectedProblem?.id ?? ""}
            onChange={(event) => selectProblem(event.target.value)}
            disabled={!isHost}
          >
            <option value="">Select a problem</option>
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title} ({problem.difficulty})
              </option>
            ))}
          </select>
        </div>

        <button
          className="retro-btn retro-btn-accent retro-start-btn"
          onClick={() => {
            if (!selectedProblem) return
            startGame()
          }}
          disabled={!isHost || !mode || !selectedProblem}
        >
          {isHost ? "[ ► Start Game ]" : "[ Waiting for host... ]"}
        </button>
      </div>
    </div>
  )
}