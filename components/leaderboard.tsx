import type { LeaderboardEntry } from "@/lib/supabase"

type LeaderboardProps = {
  entries: LeaderboardEntry[]
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 bg-twitch-dark-200 rounded-md">
        <p className="text-twitch-light-200">No entries yet. Be the first on the leaderboard!</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-twitch-dark-400">
      <table className="min-w-full divide-y divide-twitch-dark-400">
        <thead className="bg-twitch-dark-200">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-twitch-light-200 uppercase tracking-wider"
            >
              Rank
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-twitch-light-200 uppercase tracking-wider"
            >
              Player
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-twitch-light-200 uppercase tracking-wider"
            >
              Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-twitch-dark-100 divide-y divide-twitch-dark-400">
          {entries.map((entry) => (
            <tr key={entry.twitch_id} className={entry.is_current_user ? "bg-twitch-dark-300" : ""}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-twitch-light">{entry.rank}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-twitch-light-200">
                <div className="flex items-center">
                  {entry.is_current_user && (
                    <span className="inline-block w-2 h-2 bg-twitch-purple rounded-full mr-2"></span>
                  )}
                  {entry.display_name}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-twitch-light text-right">{entry.total_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
