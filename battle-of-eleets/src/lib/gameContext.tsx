import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { getProblems } from "./api"
import { MOCK_PROBLEMS } from "./mockData"
import { isMockSocket, socket } from "./socket"
import type { GameMode, Player, Problem, SubmissionResult } from "./types"

interface GameState {
  roomCode: string
  currentUser: Player | null
  players: Player[]
  problems: Problem[]
  mode: GameMode | null
  selectedProblem: Problem | null
  gameStarted: boolean
  versusCode: string
  collabCode: string
  collabTurnNumber: number
  currentTurnSocketId: string | null
  results: SubmissionResult[]
}

interface GameContextValue extends GameState {
  createRoom: (username: string) => void
  joinRoom: (roomCode: string, username: string) => void
  selectMode: (mode: GameMode) => void
  selectProblem: (problemId: string) => void
  startGame: () => GameMode | null
  setVersusCode: (value: string) => void
  addCollabLine: (line: string) => void
  submitVersus: () => void
  submitCollab: () => void
  resetGame: () => void
}

const DEFAULT_STATE: GameState = {
  roomCode: "",
  currentUser: null,
  players: [],
  problems: [],
  mode: null,
  selectedProblem: null,
  gameStarted: false,
  versusCode: "",
  collabCode: "",
  collabTurnNumber: 1,
  currentTurnSocketId: null,
  results: [],
}

const GameContext = createContext<GameContextValue | undefined>(undefined)

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE)
  const pendingUsernameRef = useRef<string>("")

  useEffect(() => {
    getProblems()
      .then((problems) => {
        setState((prev) => ({ ...prev, problems }))
      })
      .catch(() => {
        setState((prev) => ({ ...prev, problems: MOCK_PROBLEMS }))
      })
  }, [])

  useEffect(() => {
    if (!socket) return
    const activeSocket = socket

    const handleRoomCreated = ({ roomCode }: { roomCode: string }) => {
      setState((prev) => ({ ...prev, roomCode }))
    }

    const handlePlayerJoined = ({ players }: { players: Player[] }) => {
      setState((prev) => {
        const pendingUsername = pendingUsernameRef.current
        const selfFromPlayers = players.find((player) => player.socketId === activeSocket.id)
        const fallbackSelf =
          !selfFromPlayers && pendingUsername
            ? players.find((player) => player.username === pendingUsername)
            : null

        return {
          ...prev,
          players,
          currentUser: selfFromPlayers ?? fallbackSelf ?? prev.currentUser,
        }
      })
    }

    const handlePlayerLeft = ({ players }: { players: Player[] }) => {
      setState((prev) => ({ ...prev, players }))
    }

    const handleModeSelected = ({ mode }: { mode: GameMode }) => {
      setState((prev) => ({ ...prev, mode }))
    }

    const handleProblemSelected = ({ problem }: { problem: Problem }) => {
      setState((prev) => ({
        ...prev,
        selectedProblem: problem,
        versusCode: problem.starterCode.python ?? "",
        collabCode: problem.starterCode.python ?? "",
      }))
    }

    const handleGameStarted = ({
      room,
    }: {
      room: {
        mode: GameMode | null
        codeState?: string
        currentTurnSocketId?: string
        turnNumber?: number
      }
    }) => {
      setState((prev) => ({
        ...prev,
        mode: room.mode,
        gameStarted: true,
        collabCode: room.codeState ?? prev.collabCode,
        currentTurnSocketId: room.currentTurnSocketId ?? null,
        collabTurnNumber: room.turnNumber ?? 1,
      }))
    }

    const handleTurnChanged = ({
      currentTurnSocketId,
      turnNumber,
    }: {
      currentTurnSocketId: string
      turnNumber: number
    }) => {
      setState((prev) => ({ ...prev, currentTurnSocketId, collabTurnNumber: turnNumber }))
    }

    const handleCodeUpdated = ({ codeState }: { codeState: string }) => {
      setState((prev) => ({ ...prev, collabCode: codeState }))
    }

    const handleSubmissionResult = (result: SubmissionResult) => {
      setState((prev) => {
        const nextResults = prev.results.filter((item) => item.socketId !== result.socketId)
        nextResults.push(result)
        return { ...prev, results: nextResults }
      })
    }

    const handleCollabResult = (result: SubmissionResult) => {
      setState((prev) => ({ ...prev, results: [result] }))
    }

    const handleGameEnded = ({ results }: { results: SubmissionResult[] }) => {
      setState((prev) => ({
        ...prev,
        results: results.length ? results : prev.results,
        gameStarted: false,
      }))
    }

    activeSocket.on("room-created", handleRoomCreated)
    activeSocket.on("player-joined", handlePlayerJoined)
    activeSocket.on("player-left", handlePlayerLeft)
    activeSocket.on("mode-selected", handleModeSelected)
    activeSocket.on("problem-selected", handleProblemSelected)
    activeSocket.on("game-started", handleGameStarted)
    activeSocket.on("turn-changed", handleTurnChanged)
    activeSocket.on("code-updated", handleCodeUpdated)
    activeSocket.on("submission-result", handleSubmissionResult)
    activeSocket.on("collab-result", handleCollabResult)
    activeSocket.on("game-ended", handleGameEnded)

    return () => {
      activeSocket.off("room-created", handleRoomCreated)
      activeSocket.off("player-joined", handlePlayerJoined)
      activeSocket.off("player-left", handlePlayerLeft)
      activeSocket.off("mode-selected", handleModeSelected)
      activeSocket.off("problem-selected", handleProblemSelected)
      activeSocket.off("game-started", handleGameStarted)
      activeSocket.off("turn-changed", handleTurnChanged)
      activeSocket.off("code-updated", handleCodeUpdated)
      activeSocket.off("submission-result", handleSubmissionResult)
      activeSocket.off("collab-result", handleCollabResult)
      activeSocket.off("game-ended", handleGameEnded)
    }
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      createRoom(username) {
        const cleanUsername = username.trim()
        if (!cleanUsername) return
        pendingUsernameRef.current = cleanUsername
        if (isMockSocket || !socket) {
          const host: Player = { socketId: makeId("host"), username: cleanUsername }
          const guest: Player = { socketId: makeId("guest"), username: "Friend" }
          setState((prev) => ({
            ...prev,
            roomCode: makeRoomCode(),
            players: [host, guest],
            currentUser: host,
            mode: null,
            selectedProblem: null,
            gameStarted: false,
            results: [],
          }))
          return
        }
        setState((prev) => ({
          ...prev,
          roomCode: "",
          players: [],
          currentUser: null,
          mode: null,
          selectedProblem: null,
          gameStarted: false,
          results: [],
        }))
        socket.emit("create-room", { username: cleanUsername })
      },
      joinRoom(roomCode, username) {
        const cleanUsername = username.trim()
        const normalizedRoomCode = roomCode.trim().toUpperCase()
        if (!cleanUsername || !normalizedRoomCode) return
        pendingUsernameRef.current = cleanUsername
        if (isMockSocket || !socket) {
          const player: Player = { socketId: makeId("player"), username: cleanUsername }
          setState((prev) => ({
            ...prev,
            roomCode: normalizedRoomCode,
            currentUser: player,
            players: [player, { socketId: makeId("host"), username: "Host" }],
            mode: null,
            selectedProblem: null,
            gameStarted: false,
            results: [],
          }))
          return
        }
        setState((prev) => ({
          ...prev,
          roomCode: normalizedRoomCode,
          currentUser: null,
          players: [],
          mode: null,
          selectedProblem: null,
          gameStarted: false,
          results: [],
        }))
        socket.emit("join-room", { roomCode: normalizedRoomCode, username: cleanUsername })
      },
      selectMode(mode) {
        if (!state.roomCode) return
        if (!socket) {
          setState((prev) => ({ ...prev, mode }))
          return
        }
        socket.emit("select-mode", { roomCode: state.roomCode, mode })
        setState((prev) => ({ ...prev, mode }))
      },
      selectProblem(problemId) {
        if (!state.roomCode || !problemId) return
        if (!socket) {
          const problem = state.problems.find((entry) => entry.id === problemId)
          if (!problem) return
          setState((prev) => ({
            ...prev,
            selectedProblem: problem,
            versusCode: problem.starterCode.python ?? "",
            collabCode: problem.starterCode.python ?? "",
          }))
          return
        }
        socket.emit("select-problem", { roomCode: state.roomCode, problemId })
      },
      startGame() {
        if (!state.roomCode || !state.mode || !state.selectedProblem) return null
        if (!socket) {
          setState((prev) => ({
            ...prev,
            gameStarted: true,
            currentTurnSocketId: prev.players[0]?.socketId ?? null,
            collabTurnNumber: 1,
          }))
          return state.mode
        }
        socket.emit("start-game", { roomCode: state.roomCode })
        return state.mode
      },
      setVersusCode(value) {
        setState((prev) => ({ ...prev, versusCode: value }))
      },
      addCollabLine(line) {
        if (!state.roomCode || !line.trim()) return
        if (!socket) {
          const nextTurnId =
            state.players.find((player) => player.socketId !== state.currentTurnSocketId)?.socketId ??
            state.currentTurnSocketId
          setState((prev) => ({
            ...prev,
            collabCode: prev.collabCode ? `${prev.collabCode}\n${line}` : line,
            currentTurnSocketId: nextTurnId ?? null,
            collabTurnNumber: prev.collabTurnNumber + 1,
          }))
          return
        }
        socket.emit("add-line", { roomCode: state.roomCode, line })
      },
      submitVersus() {
        if (!state.roomCode || !state.versusCode) return
        if (!socket) {
          const mockResults: SubmissionResult[] = state.players.map((player, index) => ({
            socketId: player.socketId,
            username: player.username,
            passed: index === 0,
            passedCount: index === 0 ? 2 : 1,
            totalCount: 2,
            runtime: index === 0 ? 120 : 300,
          }))
          setState((prev) => ({ ...prev, results: mockResults, gameStarted: false }))
          return
        }
        socket.emit("submit-code", {
          roomCode: state.roomCode,
          code: state.versusCode,
          language: "python",
        })
      },
      submitCollab() {
        if (!state.roomCode) return
        if (!socket) {
          setState((prev) => ({
            ...prev,
            results: [
              {
                socketId: prev.currentUser?.socketId ?? "team",
                username: "Team Submission",
                passed: true,
                passedCount: 2,
                totalCount: 2,
                runtime: 180,
              },
            ],
            gameStarted: false,
          }))
          return
        }
        socket.emit("submit-collab", { roomCode: state.roomCode, language: "python" })
      },
      resetGame() {
        setState(DEFAULT_STATE)
      },
    }),
    [state],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used inside GameProvider")
  }
  return context
}
