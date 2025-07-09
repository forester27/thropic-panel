"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DevTools() {
  const router = useRouter()
  const [userId, setUserId] = useState("123456789")
  const [channelId, setChannelId] = useState("987654321")
  const [role, setRole] = useState("viewer")
  const [path, setPath] = useState("/")

  const handleNavigate = () => {
    const queryParams = new URLSearchParams()
    queryParams.set("userId", userId)
    queryParams.set("channelId", channelId)
    queryParams.set("role", role)

    let targetPath = path
    if (targetPath.includes("?")) {
      targetPath = `${targetPath}&${queryParams.toString()}`
    } else {
      targetPath = `${targetPath}?${queryParams.toString()}`
    }

    window.location.href = targetPath
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-twitch-dark-100 rounded-md shadow-md">
      <h1 className="text-xl font-bold text-twitch-light mb-4">Twitch Extension Dev Tools</h1>
      <p className="text-twitch-light-200 mb-4">
        Use this page to simulate different Twitch contexts for local testing.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-twitch-light mb-1">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md"
          />
        </div>

        <div>
          <label htmlFor="channelId" className="block text-sm font-medium text-twitch-light mb-1">
            Channel ID
          </label>
          <input
            type="text"
            id="channelId"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-twitch-light mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md"
          >
            <option value="viewer">Viewer</option>
            <option value="streamer">Streamer</option>
          </select>
        </div>

        <div>
          <label htmlFor="path" className="block text-sm font-medium text-twitch-light mb-1">
            Path
          </label>
          <select
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md"
          >
            <option value="/">Panel View (/)</option>
            <option value="/config">Config (/config)</option>
            <option value="/live-config">Live Config (/live-config)</option>
          </select>
        </div>

        <button
          onClick={handleNavigate}
          className="w-full px-4 py-2 bg-twitch-purple text-white rounded-md hover:bg-twitch-purple-500 transition-colors"
        >
          Navigate with Context
        </button>
      </div>
    </div>
  )
}
