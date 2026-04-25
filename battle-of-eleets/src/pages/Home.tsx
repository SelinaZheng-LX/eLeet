import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">Battle of the eLeets</h1>
      <p className="text-lg text-gray-600">
        Real-time LeetCode battles with friends and nearby coders
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/lobby")}
          className="px-6 py-3 rounded-xl bg-black text-white"
        >
          Create Room
        </button>

        <button
          onClick={() => navigate("/geo-match")}
          className="px-6 py-3 rounded-xl border"
        >
          Find Nearby Players
        </button>
      </div>
    </div>
  )
}