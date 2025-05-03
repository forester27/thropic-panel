export type TwitchContext = {
  userId?: string
  channelId?: string
  role?: "viewer" | "streamer"
}

export const getTwitchContext = (): Promise<TwitchContext> => {
  return new Promise((resolve) => {
    // Check if Twitch Extensions SDK is available
    if (window.Twitch && window.Twitch.ext) {
      // If onAuthorized has already been called, Twitch.ext.viewer might be available
      if (window.Twitch.ext.viewer && window.Twitch.ext.viewer.id) {
        const role = window.Twitch.ext.viewer.role === "broadcaster" ? "streamer" : "viewer"
        resolve({
          userId: window.Twitch.ext.viewer.id,
          channelId: window.Twitch.ext.viewer.channelId,
          role,
        })
      } else {
        // Otherwise, wait for onAuthorized to be called
        window.Twitch.ext.onAuthorized((auth) => {
          const role = auth.role === "broadcaster" ? "streamer" : "viewer"
          resolve({
            userId: auth.userId,
            channelId: auth.channelId,
            role,
          })
        })
      }
    } else {
      // Fallback to URL parameters for local development
      const urlParams = new URLSearchParams(window.location.search)
      const role = urlParams.get("role") === "streamer" ? "streamer" : "viewer"
      const userId = urlParams.get("userId") || undefined
      const channelId = urlParams.get("channelId") || undefined

      resolve({ userId, channelId, role })
    }
  })
}

// Add Twitch SDK types
declare global {
  interface Window {
    Twitch?: {
      ext?: {
        onAuthorized: (
          callback: (auth: {
            userId: string
            channelId: string
            token: string
            role: string
          }) => void,
        ) => void
        viewer?: {
          id: string
          channelId: string
          role: string
        }
        actions?: {
          requestIdShare: () => void
        }
        configuration?: {
          onChanged: (callback: () => void) => void
        }
        listen: (target: string, callback: (target: string, contentType: string, message: string) => void) => void
        send: (target: string, contentType: string, message: object) => void
      }
    }
  }
}
