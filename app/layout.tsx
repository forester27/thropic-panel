import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import TwitchSDKLoader from "./twitch-sdk-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Twitch Panel Extension",
  description: "Interactive game panel for Twitch streamers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TwitchSDKLoader />
        {children}
      </body>
    </html>
  )
}
