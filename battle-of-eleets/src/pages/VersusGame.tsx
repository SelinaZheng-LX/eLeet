import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import { useGame } from "../lib/gameContext"

export default function VersusGame() {
  const navigate = useNavigate()
  const { selectedProblem, versusCode, results, setVersusCode, submitVersus } = useGame()

  useEffect(() => {
    if (results.length > 0) {
      navigate("/results")
    }
  }, [navigate, results.length])

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
        </section>
      </div>
    </div>
  )
}
