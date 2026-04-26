import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { useGame } from "../lib/gameContext"

export default function VersusGame() {
  const navigate = useNavigate()
  const {
    roomCode,
    selectedProblem,
    versusCode,
    gameStarted,
    currentUser,
    results,
    hydrateProblemForRoom,
    setVersusCode,
    submitVersus,
  } = useGame()
  const myResult = currentUser
    ? results.find((result) => result.socketId === currentUser.socketId)
    : undefined
  const submittedCount = results.length

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
        <h1>Versus Mode</h1>
        <p className="subtitle">No problem selected.</p>
      </div>
    )
  }

  return (
    <div className="retro-game-screen scanlines">
      <div className="retro-game-topbar">
        <h1>▓ LeetBattle</h1>
        <span className="retro-tag">⚔ Versus Mode</span>
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
            <h2>Code Editor</h2>
            <span className="editor-language">[ Python 3 ]</span>
          </div>
          <Editor
            height="100%"
            language="python"
            value={versusCode}
            onChange={(value) => setVersusCode(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              roundedSelection: true,
            }}
          />
          <button
            className="button primary"
            onClick={() => {
              submitVersus()
            }}
          >
            Submit Code
          </button>
          {myResult ? (
            <div className={`submission-feedback ${myResult.passed ? "pass" : "fail"}`}>
              <p className="submission-title">
                {myResult.passed ? "Passed" : "Failed"} {myResult.passedCount}/{myResult.totalCount} testcases
              </p>
              {myResult.error ? <p className="submission-error">{myResult.error}</p> : null}
              <p className="submission-meta">
                Players submitted: {submittedCount}/2
              </p>
            </div>
          ) : (
            <p className="submission-meta">No submission yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}
