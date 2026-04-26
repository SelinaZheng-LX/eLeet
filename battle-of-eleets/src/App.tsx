import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Lobby from "./pages/Lobby"
import VersusGame from "./pages/VersusGame"
import CollabGame from "./pages/CollabGame"
import Results from "./pages/Results"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/versus" element={<VersusGame />} />
        <Route path="/collab" element={<CollabGame />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}