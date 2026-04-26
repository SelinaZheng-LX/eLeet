import { useMemo, useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { useGame } from "../lib/gameContext"

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
  const [editorCode, setEditorCode] = useState(collabCode)
  const myResult = results[0]

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

  useEffect(() => {
    setEditorCode(collabCode)
  }, [collabCode])

  const pendingLine = useMemo(() => {
    const base = collabCode.replace(/\r/g, "")
    const draft = editorCode.replace(/\r/g, "")
    if (draft === base || !draft.startsWith(base)) return null

    let suffix = draft.slice(base.length)
    if (suffix.startsWith("\n")) {
      suffix = suffix.slice(1)
    }
    if (suffix.endsWith("\n")) {
      suffix = suffix.slice(0, -1)
    }
    if (!suffix || suffix.includes("\n") || suffix.trim().length === 0) return null
    return suffix
  }, [collabCode, editorCode])

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
        {isMyTurn ? "Your turn" : `Waiting for ${currentTurnName}...`} | Turn {collabTurnNumber}
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
            value={editorCode}
            onChange={(value) => {
              if (!isMyTurn) return
              setEditorCode(value ?? "")
            }}
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
            <button
              className="button secondary"
              disabled={!isMyTurn || !pendingLine}
              onClick={() => {
                if (!pendingLine) return
                addCollabLine(editorCode)
              }}
            >
              Add Line
            </button>
            <button
              className="button primary"
              onClick={() => {
                submitCollab(editorCode)
              }}
            >
              Submit Team Code
            </button>
          </div>
          {myResult ? (
            <div className={`submission-feedback ${myResult.passed ? "pass" : "fail"}`}>
              <p className="submission-title">
                {myResult.passed ? "Passed" : "Failed"} {myResult.passedCount}/{myResult.totalCount} testcases
              </p>
              {myResult.error ? <p className="submission-error">{myResult.error}</p> : null}
            </div>
          ) : null}
          <p className="submission-meta">
            Add exactly one appended line (indentation/comments allowed), then click Add Line.
          </p>
        </section>
      </div>
    </div>
  )
}
