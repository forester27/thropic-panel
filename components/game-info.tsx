"use client"

import type { TwitchGame } from "@/lib/supabase"

type GameInfoProps = {
  game: TwitchGame
  onStart: () => void
  hasCompletedGame: boolean
  canRetry: boolean
}

export default function GameInfo({ game, onStart, hasCompletedGame, canRetry }: GameInfoProps) {
  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md overflow-hidden">
        {game.branding?.logo_url && (
          <div className="w-full h-40 bg-twitch-dark-200 flex items-center justify-center">
            <img
              src={game.branding.logo_url || "/placeholder.svg"}
              alt={`${game.title} logo`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        <div className="p-4">
          <h1 className="text-xl font-bold text-twitch-light mb-2">{game.title}</h1>
          <p className="text-twitch-light-200 mb-4">{game.description}</p>

          {game.prize && (
            <div className="mb-4 p-3 bg-twitch-dark-300 rounded-md">
              <h3 className="text-sm font-medium text-twitch-purple-100">Prize</h3>
              <p className="text-sm text-twitch-light-200 mt-1">{game.prize}</p>
            </div>
          )}

          {game.starts_at && game.ends_at && (
            <div className="mb-4">
              <p className="text-sm text-twitch-light-200">
                Available from {new Date(game.starts_at).toLocaleDateString()} to{" "}
                {new Date(game.ends_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {hasCompletedGame && !canRetry && (
            <div className="mb-4 p-3 bg-twitch-dark-300 rounded-md">
              <p className="text-sm text-twitch-light-100">
                You've already completed this game and reached the maximum number of attempts.
              </p>
            </div>
          )}

          {hasCompletedGame && canRetry && (
            <div className="mb-4 p-3 bg-twitch-dark-300 rounded-md">
              <p className="text-sm text-twitch-light-100">
                You've already played this game, but you can try again to improve your score!
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={onStart}
              disabled={hasCompletedGame && !canRetry}
              className="px-6 py-2 bg-twitch-purple text-white rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {hasCompletedGame && canRetry ? "Play Again" : "Start Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
