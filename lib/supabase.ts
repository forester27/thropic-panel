import { createClient } from "@supabase/supabase-js"

// Create a singleton instance for the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  // Only create the client if we're in a browser environment or if the environment variables are available
  if (typeof window !== "undefined") {
    if (!supabaseInstance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseAnonKey) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
      } else {
        console.warn("Supabase environment variables are missing. Client will not be initialized.")
        // Return a dummy client that won't throw errors during build
        return {
          from: () => ({
            select: () => ({ data: null, error: new Error("Supabase client not initialized") }),
            insert: () => ({ data: null, error: new Error("Supabase client not initialized") }),
            update: () => ({ data: null, error: new Error("Supabase client not initialized") }),
            delete: () => ({ data: null, error: new Error("Supabase client not initialized") }),
            eq: () => ({ data: null, error: new Error("Supabase client not initialized") }),
          }),
          channel: () => ({
            on: () => ({ subscribe: () => ({}) }),
          }),
          removeChannel: () => ({}),
        } as any
      }
    }
    return supabaseInstance
  }

  // Return a dummy client for SSR/build time
  return {
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => ({}),
  } as any
})()

// Types for our database tables
export type TwitchUser = {
  id: string
  twitch_id: string
  email?: string
  display_name: string
  role: "viewer" | "streamer"
  active_game_id?: string
  created_at: string
}

export type TwitchGame = {
  id: string
  title: string
  description: string
  donation_link?: string
  prize?: string
  branding: {
    primary_color?: string
    secondary_color?: string
    logo_url?: string
  }
  terms_text: string
  is_public: boolean
  allowed_twitch_ids: string[]
  entry_limit: number | null
  scoring_mode: "free_to_play" | "donation_required"
  starts_at: string
  ends_at: string
  is_closed: boolean
  created_at: string
}

export type TwitchGameQuestion = {
  id: string
  game_id: string
  question_text: string
  input_type: "text" | "multi-select" | "slider"
  correct_answer?: string
  options?: string[]
  min_value?: number
  max_value?: number
  is_tiebreaker: boolean
  created_at: string
}

export type TwitchGameEntry = {
  id: string
  game_id: string
  user_id: string
  twitch_id: string
  question_id: string
  submitted_answer: string
  is_paid: boolean
  checkout_session_id?: string
  created_at: string
}

export type TwitchGameScore = {
  id: string
  game_id: string
  user_id: string
  twitch_id: string
  total_score: number
  tiebreaker_guess?: number
  is_paid: boolean
  is_winner: boolean
  attempt_number: number
  email?: string
  email_consent_timestamp?: string
  terms_accepted_at?: string
  last_updated: string
}

export type LeaderboardEntry = {
  twitch_id: string
  display_name: string
  total_score: number
  rank: number
  is_current_user: boolean
}
