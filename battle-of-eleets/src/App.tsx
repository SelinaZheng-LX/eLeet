import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Lobby from "./pages/Lobby"
import Match from "./pages/Match"
import GeoMatch from "./pages/GeoMatch"
import Results from "./pages/Results"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/match" element={<Match />} />
        <Route path="/geo-match" element={<GeoMatch />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}