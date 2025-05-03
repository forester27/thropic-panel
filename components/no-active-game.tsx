export default function NoActiveGame() {
  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-twitch-light-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-twitch-light mb-2">No Active Game</h2>
        <p className="text-twitch-light-200 mb-4">The streamer hasn't activated a game yet. Check back later!</p>
      </div>
    </div>
  )
}
