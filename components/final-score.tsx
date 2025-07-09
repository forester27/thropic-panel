"use client"

import { useState } from "react"
import type { LeaderboardEntry } from "@/lib/supabase"
import Leaderboard from "./leaderboard"

type FinalScoreProps = {
  score: number | null
  totalQuestions: number
  leaderboard: LeaderboardEntry[]
  donationLink?: string
  isPaid: boolean
  onTryAgain: () => void
  canRetry: boolean
  gameTitle: string
}

export default function FinalScore({
  score,
  totalQuestions,
  leaderboard,
  donationLink,
  isPaid,
  onTryAgain,
  canRetry,
  gameTitle,
}: FinalScoreProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const shareText = `I scored ${score}/${totalQuestions} on ${gameTitle}! Try to beat my score!`

    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-twitch-light mb-2">Your Score</h2>
          <div className="text-4xl font-bold text-twitch-purple">
            {score !== null ? score : "-"}/{totalQuestions}
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {donationLink && !isPaid && (
            <a
              href={donationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 bg-twitch-purple text-white text-center font-medium rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple transition-colors"
            >
              Donate Now to Join Leaderboard
            </a>
          )}

          <button
            onClick={handleShare}
            className="w-full px-4 py-3 bg-twitch-dark-200 text-twitch-light text-center font-medium rounded-md shadow-sm border border-twitch-dark-400 hover:bg-twitch-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-dark-400 transition-colors"
          >
            {copied ? "Copied!" : "Copy Score to Share"}
          </button>

          {canRetry && (
            <button
              onClick={onTryAgain}
              className="w-full px-4 py-3 bg-twitch-dark-200 text-twitch-light text-center font-medium rounded-md shadow-sm border border-twitch-dark-400 hover:bg-twitch-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-dark-400 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-twitch-light mb-3">Leaderboard</h3>
          <Leaderboard entries={leaderboard} />

          {donationLink && !isPaid && leaderboard.length > 0 && (
            <div className="mt-4 p-3 bg-twitch-dark-300 rounded-md text-sm text-twitch-purple-100">
              <p>Donate to appear on the leaderboard and compete for prizes!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
