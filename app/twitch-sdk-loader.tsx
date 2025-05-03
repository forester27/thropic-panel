"use client"

import { useEffect } from "react"

export default function TwitchSDKLoader() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      // Check if the SDK is already loaded
      if (!window.Twitch) {
        // Create script element
        const script = document.createElement("script")
        script.src = "https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"
        script.async = true
        script.crossOrigin = "anonymous"

        // Append to document head
        document.head.appendChild(script)

        // Clean up on unmount
        return () => {
          document.head.removeChild(script)
        }
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
