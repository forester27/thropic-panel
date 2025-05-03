"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase, type TwitchGame } from "@/lib/supabase"

type StreamerExperienceProps = {
  twitchId?: string
  channelId?: string
}

export default function StreamerExperience({ twitchId, channelId }: StreamerExperienceProps) {
  const [availableGames, setAvailableGames] = useState<TwitchGame[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (twitchId) {
      loadGames()
      getActiveGame()
    }
  }, [twitchId])

  const loadGames = async () => {
    if (!twitchId) return

    try {
      setLoading(true)

      // Get games that are either public or specifically assigned to this streamer
      const { data, error } = await supabase
        .from("twitch_games")
        .select("*")
        .or(`is_public.eq.true,allowed_twitch_ids.cs.{${twitchId}}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAvailableGames(data || [])
    } catch (err) {
      console.error("Error loading games:", err)
      setError("Failed to load available games. Please refresh and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getActiveGame = async () => {
    if (!twitchId) return

    try {
      const { data, error } = await supabase
        .from("twitch_users")
        .select("active_game_id")
        .eq("twitch_id", twitchId)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data?.active_game_id) {
        setActiveGameId(data.active_game_id)
        setSelectedGameId(data.active_game_id)
      }
    } catch (err) {
      console.error("Error getting active game:", err)
    }
  }

  const handleGameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGameId(e.target.value)
  }

  const handleActivateGame = async () => {
    if (!twitchId || !selectedGameId) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Update user's active game
      const { error } = await supabase
        .from("twitch_users")
        .update({ active_game_id: selectedGameId })
        .eq("twitch_id", twitchId)

      if (error) throw error

      setActiveGameId(selectedGameId)
      setSuccess("Game activated successfully! Viewers will now see this game in your panel.")
    } catch (err) {
      console.error("Error activating game:", err)
      setError("Failed to activate game. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-4">
        <h1 className="text-xl font-bold text-twitch-light mb-4">Streamer Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitch-purple"></div>
          </div>
        ) : (
          <>
            {availableGames.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-twitch-light-200">No games available for your channel.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="game-select" className="block text-sm font-medium text-twitch-light mb-1">
                    Select a game to activate
                  </label>
                  <select
                    id="game-select"
                    className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md shadow-sm focus:outline-none focus:ring-twitch-purple focus:border-twitch-purple"
                    value={selectedGameId || ""}
                    onChange={handleGameSelect}
                  >
                    <option value="">-- Select a game --</option>
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGameId && (
                  <div className="mb-4">
                    <div className="bg-twitch-dark-200 p-3 rounded-md">
                      <h3 className="font-medium text-twitch-light">
                        {availableGames.find((g) => g.id === selectedGameId)?.title}
                      </h3>
                      <p className="text-sm text-twitch-light-200 mt-1">
                        {availableGames.find((g) => g.id === selectedGameId)?.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleActivateGame}
                    disabled={!selectedGameId || saving || selectedGameId === activeGameId}
                    className="px-4 py-2 bg-twitch-purple text-white rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Activating..." : selectedGameId === activeGameId ? "Currently Active" : "Activate Game"}
                  </button>
                </div>

                {error && <div className="mt-4 p-2 bg-red-900/30 text-red-400 rounded-md text-sm">{error}</div>}

                {success && <div className="mt-4 p-2 bg-green-900/30 text-green-400 rounded-md text-sm">{success}</div>}

                {activeGameId && (
                  <div className="mt-4 p-2 bg-twitch-dark-300 text-twitch-purple-100 rounded-md text-sm">
                    <p>
                      <strong>Currently active game:</strong>{" "}
                      {availableGames.find((g) => g.id === activeGameId)?.title || "Unknown game"}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
