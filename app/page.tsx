"use client"

import { useEffect, useState } from "react"
import { supabase, type TwitchUser, type TwitchGame } from "@/lib/supabase"
import { getTwitchContext, type TwitchContext } from "@/lib/twitch-sdk"
import ViewerExperience from "@/components/viewer-experience"
import StreamerExperience from "@/components/streamer-experience"
import LoadingState from "@/components/ui/loading-state"
import ErrorState from "@/components/ui/error-state"

export default function TwitchExtension() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [twitchContext, setTwitchContext] = useState<TwitchContext | null>(null)
  const [user, setUser] = useState<TwitchUser | null>(null)
  const [activeGame, setActiveGame] = useState<TwitchGame | null>(null)

  // Initialize and get Twitch context
  useEffect(() => {
    const initTwitch = async () => {
      try {
        // Check if Supabase environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError("Supabase environment variables are missing. Please check your configuration.")
          setLoading(false)
          return
        }

        const context = await getTwitchContext()
        setTwitchContext(context)

        if (context.userId && context.channelId) {
          // Get or create user
          const { data: userData, error: userError } = await supabase
            .from("twitch_users")
            .select("*")
            .eq("twitch_id", context.userId)
            .single()

          if (userError && userError.code !== "PGRST116") {
            throw userError
          }

          if (userData) {
            setUser(userData)
          } else if (context.userId) {
            // Create new user
            const { data: newUser, error: createError } = await supabase
              .from("twitch_users")
              .insert({
                twitch_id: context.userId,
                display_name: `User_${context.userId.substring(0, 8)}`,
                role: context.role || "viewer",
              })
              .select()
              .single()

            if (createError) throw createError
            setUser(newUser)
          }

          // Get active game for this channel
          if (context.channelId) {
            const { data: streamerData } = await supabase
              .from("twitch_users")
              .select("*")
              .eq("twitch_id", context.channelId)
              .single()

            if (streamerData?.active_game_id) {
              const { data: gameData } = await supabase
                .from("twitch_games")
                .select("*")
                .eq("id", streamerData.active_game_id)
                .single()

              if (gameData) {
                setActiveGame(gameData)
              }
            }
          }
        }
      } catch (err) {
        console.error("Error initializing:", err)
        setError("Failed to initialize the extension. Please refresh and try again.")
      } finally {
        setLoading(false)
      }
    }

    initTwitch()

    // Check for checkout session ID in URL
    const urlParams = new URLSearchParams(window.location.search)
    const checkoutSessionId = urlParams.get("checkout_session_id")

    if (checkoutSessionId && twitchContext?.userId) {
      handleDonationCallback(checkoutSessionId, twitchContext.userId)
    }
  }, [])

  // Handle donation callback
  const handleDonationCallback = async (sessionId: string, twitchId: string) => {
    try {
      // Update entries with this checkout session
      const { error } = await supabase
        .from("twitch_game_entries")
        .update({ is_paid: true })
        .eq("twitch_id", twitchId)
        .eq("checkout_session_id", sessionId)

      if (error) throw error

      // Update scores
      await supabase.from("twitch_game_scores").update({ is_paid: true }).eq("twitch_id", twitchId)

      // Remove the query parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete("checkout_session_id")
      window.history.replaceState({}, document.title, url.toString())
    } catch (err) {
      console.error("Error processing donation:", err)
    }
  }

  if (loading) {
    return (
      <div className="bg-twitch-dark min-h-[200px] max-w-[320px] mx-auto rounded-md overflow-hidden shadow-md">
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-twitch-dark min-h-[200px] max-w-[320px] mx-auto rounded-md overflow-hidden shadow-md">
        <ErrorState message={error} />
      </div>
    )
  }

  // Render based on role
  if (twitchContext?.role === "streamer") {
    return (
      <div className="bg-twitch-dark min-h-[200px] max-w-[320px] mx-auto rounded-md overflow-hidden shadow-md">
        <StreamerExperience twitchId={twitchContext.userId} channelId={twitchContext.channelId} />
      </div>
    )
  }

  return (
    <div className="bg-twitch-dark min-h-[200px] max-w-[320px] mx-auto rounded-md overflow-hidden shadow-md">
      <ViewerExperience
        user={user}
        activeGame={activeGame}
        twitchId={twitchContext?.userId}
        channelId={twitchContext?.channelId}
      />
    </div>
  )
}
