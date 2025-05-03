"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getTwitchContext } from "@/lib/twitch-sdk"
import { supabase, type TwitchGame } from "@/lib/supabase"
import LoadingState from "@/components/ui/loading-state"
import ErrorState from "@/components/ui/error-state"

export default function LiveConfigPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [twitchId, setTwitchId] = useState<string | undefined>()
  const [channelId, setChannelId] = useState<string | undefined>()
  const [availableGames, setAvailableGames] = useState<TwitchGame[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize and get Twitch context
  useEffect(() => {
    const initTwitch = async () => {
      try {
        const context = await getTwitchContext()
        setTwitchId(context.userId)
        setChannelId(context.channelId)

        if (context.userId) {
          await loadGames(context.userId)
          await getActiveGame(context.userId)
        } else {
          setError("Unable to identify your Twitch account. Please ensure you're properly authenticated.")
        }
      } catch (err) {
        console.error("Error initializing:", err)
        setError("Failed to initialize the extension. Please refresh and try again.")
      } finally {
        setLoading(false)
      }
    }

    initTwitch()
  }, [])

  const loadGames = async (userId: string) => {
    try {
      // Get games that are either public or specifically assigned to this streamer
      const { data, error } = await supabase
        .from("twitch_games")
        .select("*")
        .or(`is_public.eq.true,allowed_twitch_ids.cs.{${userId}}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAvailableGames(data || [])
    } catch (err) {
      console.error("Error loading games:", err)
      setError("Failed to load available games. Please refresh and try again.")
    }
  }

  const getActiveGame = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("twitch_users")
        .select("active_game_id")
        .eq("twitch_id", userId)
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
    setSelectedGameId(e.target.value || null)
    setSuccess(null)
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

  if (loading) {
    return (
      <div className="bg-twitch-dark min-h-[500px] flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  if (error && !availableGames.length) {
    return (
      <div className="bg-twitch-dark min-h-[500px] flex items-center justify-center">
        <ErrorState message={error} />
      </div>
    )
  }

  return (
    <div className="bg-twitch-dark min-h-[500px] p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-twitch-light mb-4">Live Game Management</h1>

        <div className="bg-twitch-dark-100 rounded-md p-4 shadow-md">
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
        </div>

        <div className="mt-4 bg-twitch-dark-100 rounded-md p-4 shadow-md">
          <h2 className="text-lg font-medium text-twitch-light mb-2">Live Stats</h2>
          <p className="text-twitch-light-200 mb-4">
            This panel allows you to change the active game while you're streaming. Viewers will immediately see the new
            game in your panel.
          </p>

          {activeGameId && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-twitch-dark-200 p-3 rounded-md text-center">
                <div className="text-sm text-twitch-light-200">Current Game</div>
                <div className="text-lg font-medium text-twitch-light">
                  {availableGames.find((g) => g.id === activeGameId)?.title || "None"}
                </div>
              </div>
              <div className="bg-twitch-dark-200 p-3 rounded-md text-center">
                <div className="text-sm text-twitch-light-200">Status</div>
                <div className="text-lg font-medium text-twitch-purple">Active</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
