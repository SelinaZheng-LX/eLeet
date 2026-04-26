import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useGame } from "../lib/gameContext"

export default function Home() {
  const navigate = useNavigate()
  const { createRoom, joinRoom, roomCode: activeRoomCode, players, currentUser } = useGame()
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [pendingAction, setPendingAction] = useState<"create" | "join" | null>(null)

  useEffect(() => {
    if (!pendingAction || !activeRoomCode || !currentUser) return
    const selfInRoom = players.some((player) => player.socketId === currentUser.socketId)
    if (!selfInRoom) return
    setPendingAction(null)
    navigate("/lobby")
  }, [activeRoomCode, currentUser, navigate, pendingAction, players])

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
              setPendingAction("create")
            }}
            className="retro-btn retro-btn-primary"
          >
            [ Create Room ]
          </button>
          <button
            onClick={() => {
              if (!username.trim() || !roomCode.trim()) return
              joinRoom(roomCode.trim(), username.trim())
              setPendingAction("join")
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