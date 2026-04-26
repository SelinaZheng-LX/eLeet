import { useMemo, useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { useGame } from "../lib/gameContext"

const TURN_SECONDS = 30

export default function CollabGame() {
  const navigate = useNavigate()
  const {
    roomCode,
    selectedProblem,
    collabCode,
    players,
    currentUser,
    currentTurnSocketId,
    collabTurnNumber,
    gameStarted,
    results,
    hydrateProblemForRoom,
    addCollabLine,
    submitCollab,
  } = useGame()
  const [lineInput, setLineInput] = useState("")

  const isMyTurn = currentUser?.socketId === currentTurnSocketId
  const currentTurnName = useMemo(
    () => players.find((player) => player.socketId === currentTurnSocketId)?.username ?? "Teammate",
    [currentTurnSocketId, players],
  )

  useEffect(() => {
    if (!gameStarted && results.length > 0) {
      navigate("/results")
    }
  }, [gameStarted, navigate, results.length])

  useEffect(() => {
    if (selectedProblem || !roomCode) return
    void hydrateProblemForRoom(roomCode)
  }, [hydrateProblemForRoom, roomCode, selectedProblem])

  if (!selectedProblem) {
    return (
      <div className="page">
        <h1>Collab Mode</h1>
        <p className="subtitle">No problem selected.</p>
      </div>
    )
  }

  return (
    <div className="retro-game-screen scanlines">
      <div className="retro-game-topbar">
        <h1>▓ LeetBattle</h1>
        <span className="retro-tag">🤝 Collab Mode</span>
      </div>
      <div className={`banner ${isMyTurn ? "your-turn" : "waiting"}`}>
        {isMyTurn ? "Your turn" : `Waiting for ${currentTurnName}...`} | Turn {collabTurnNumber} |{" "}
        {TURN_SECONDS}s
      </div>
      <div className="split retro-game-split">
        <section className="panel problem-panel retro-panel">
          <div className="problem-title-row">
            <h2>{selectedProblem.title}</h2>
            <span className={`difficulty-pill ${selectedProblem.difficulty}`}>
              {selectedProblem.difficulty}
            </span>
          </div>
          <p className="problem-prompt">{selectedProblem.prompt}</p>
          <div className="problem-tests">
            <h3>Sample Test Cases</h3>
            {selectedProblem.testCases.map((testCase, index) => (
              <div key={`${testCase.input}-${index}`} className="test-case-card">
                <p>
                  <strong>Input:</strong> {testCase.input}
                </p>
                <p>
                  <strong>Expected:</strong> {testCase.expectedOutput}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel editor-panel retro-panel">
          <div className="editor-top">
            <h2>Shared Editor</h2>
            <span className="editor-language">[ Python 3 ]</span>
          </div>
          <Editor
            height="100%"
            language="python"
            value={collabCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              readOnly: !isMyTurn,
              fontSize: 14,
              scrollBeyondLastLine: false,
              padding: { top: 12 },
            }}
          />
          <div className="row">
            <input
              className="input"
              value={lineInput}
              onChange={(event) => setLineInput(event.target.value)}
              placeholder="Type one line of code"
              disabled={!isMyTurn}
            />
            <button
              className="button secondary"
              disabled={!isMyTurn || !lineInput.trim()}
              onClick={() => {
                addCollabLine(lineInput)
                setLineInput("")
              }}
            >
              Add Line
            </button>
            <button
              className="button primary"
              onClick={() => {
                submitCollab()
              }}
            >
              Submit Team Code
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
