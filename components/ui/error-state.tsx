"use client"

type ErrorStateProps = {
  message: string
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-twitch-purple">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-twitch-light mb-2">Error</h2>
        <p className="text-twitch-light-200 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-twitch-purple text-white rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
