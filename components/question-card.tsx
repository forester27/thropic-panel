"use client"

import type React from "react"

import { useState } from "react"
import type { TwitchGameQuestion } from "@/lib/supabase"

type QuestionCardProps = {
  question: TwitchGameQuestion
  onSubmit: (questionId: string, answer: string) => void
  currentIndex: number
  totalQuestions: number
}

export default function QuestionCard({ question, onSubmit, currentIndex, totalQuestions }: QuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(question.min_value !== undefined ? question.min_value : 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let answer = ""

    switch (question.input_type) {
      case "text":
        answer = textAnswer
        break
      case "multi-select":
        answer = selectedOption || ""
        break
      case "slider":
        answer = sliderValue.toString()
        break
    }

    onSubmit(question.id, answer)
  }

  return (
    <div className="p-4 max-w-[320px] mx-auto">
      <div className="bg-twitch-dark-100 rounded-md shadow-md p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-twitch-light-200">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {question.is_tiebreaker && (
              <span className="text-xs bg-twitch-dark-300 text-twitch-purple-100 px-2 py-1 rounded-full">
                Tiebreaker
              </span>
            )}
          </div>
          <h2 className="text-lg font-medium text-twitch-light">{question.question_text}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {question.input_type === "text" && (
            <div className="mb-4">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full px-3 py-2 bg-twitch-dark-200 border border-twitch-dark-400 text-twitch-light rounded-md shadow-sm focus:outline-none focus:ring-twitch-purple focus:border-twitch-purple"
                placeholder="Type your answer..."
                required
              />
            </div>
          )}

          {question.input_type === "multi-select" && question.options && (
            <div className="mb-4 grid gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  className={`w-full px-4 py-2 text-left border rounded-md transition-colors ${
                    selectedOption === option
                      ? "bg-twitch-purple text-white border-twitch-purple"
                      : "border-twitch-dark-400 bg-twitch-dark-200 text-twitch-light hover:bg-twitch-dark-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.input_type === "slider" && (
            <div className="mb-4">
              <input
                type="range"
                min={question.min_value || 0}
                max={question.max_value || 100}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-twitch-dark-300 rounded-lg appearance-none cursor-pointer accent-twitch-purple"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-twitch-light-200">{question.min_value || 0}</span>
                <span className="text-sm font-medium text-twitch-light">{sliderValue}</span>
                <span className="text-sm text-twitch-light-200">{question.max_value || 100}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-twitch-purple text-white rounded-md shadow-sm hover:bg-twitch-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitch-purple transition-colors"
            >
              {currentIndex === totalQuestions - 1 ? "Finish" : "Next Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
