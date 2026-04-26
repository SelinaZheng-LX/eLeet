import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useGame } from "../lib/gameContext"

export default function Home() {
  const navigate = useNavigate()
  const { createRoom, joinRoom } = useGame()
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")

  return (
    <div className="retro-screen scanlines">
      <div className="retro-shell">
        <div className="retro-hero">
          <h1 className="retro-title">█▓▒░ LEET BATTLE ░▒▓█</h1>
          <p className="retro-subtitle">Real-time competitive and collaborative coding</p>
        </div>

        <div className="retro-panel">
          <label className="retro-label" htmlFor="username">
            ► Player Name
          </label>
          <input
            id="username"
            className="retro-input"
            placeholder="ENTER USERNAME..."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="retro-row">
          <button
            onClick={() => {
              if (!username.trim()) return
              createRoom(username.trim())
              navigate("/lobby")
            }}
            className="retro-btn retro-btn-primary"
          >
            [ Create Room ]
          </button>
          <button
            onClick={() => {
              if (!username.trim() || !roomCode.trim()) return
              joinRoom(roomCode.trim(), username.trim())
              navigate("/lobby")
            }}
            className="retro-btn retro-btn-secondary"
          >
            [ Join Room ]
          </button>
        </div>
        <input
          className="retro-input retro-code-input"
          placeholder="ENTER ROOM CODE"
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
          maxLength={6}
        />
      </div>
    </div>
  )
}