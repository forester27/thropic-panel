"use client"

import type React from "react"

import { useState } from "react"

type UserFormProps = {
  onSubmit: (email: string, termsAccepted: boolean) => void
  termsText: string
  defaultEmail?: string
}

export default function UserForm({ onSubmit, termsText, defaultEmail }: UserFormProps) {
  const [email, setEmail] = useState(defaultEmail || "")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions")
      return
    }

    onSubmit(email, termsAccepted)
  }

  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-4">
        <h2 className="text-xl font-bold text-twitch-light mb-4">Almost Done!</h2>
        <p className="text-twitch-light-200 mb-4">
          Please provide your email to save your score and see where you rank.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-twitch-light mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md shadow-sm focus:outline-none focus:ring-twitch-purple focus:border-twitch-purple"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 bg-twitch-dark-200 border-twitch-dark-400 text-twitch-purple rounded focus:ring-twitch-purple"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-twitch-light">
                  I accept the terms and conditions
                </label>
                <p className="text-twitch-light-200 mt-1 text-xs">{termsText}</p>
              </div>
            </div>
          </div>

          {error && <div className="mb-4 p-2 bg-red-900/30 text-red-400 rounded-md text-sm">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-twitch-purple text-white rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
