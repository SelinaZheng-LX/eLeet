import { io } from "socket.io-client"

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001"
const useMockSocket = String(import.meta.env.VITE_MOCK_SOCKET ?? "false") === "true"

export const socket = useMockSocket
  ? null
  : io(socketUrl, {
      autoConnect: true,
    })

export const isMockSocket = useMockSocket
