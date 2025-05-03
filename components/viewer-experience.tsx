"use client"

import { useState, useEffect } from "react"
import {
  supabase,
  type TwitchUser,
  type TwitchGame,
  type TwitchGameQuestion,
  type LeaderboardEntry,
} from "@/lib/supabase"
import QuestionCard from "./question-card"
import FinalScore from "./final-score"
import UserForm from "./user-form"
import GameInfo from "./game-info"
import NoActiveGame from "./no-active-game"

type ViewerExperienceProps = {
  user: TwitchUser | null
  activeGame: TwitchGame | null
  twitchId?: string
  channelId?: string
}

export default function ViewerExperience({ user, activeGame, twitchId, channelId }: ViewerExperienceProps) {
  const [currentStep, setCurrentStep] = useState<"info" | "questions" | "user-form" | "score">("info")
  const [questions, setQuestions] = useState<TwitchGameQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [score, setScore] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [attemptNumber, setAttemptNumber] = useState(1)
  const [hasCompletedGame, setHasCompletedGame] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    if (activeGame && twitchId) {
      // Load questions
      loadQuestions()

      // Check if user has already completed this game
      checkPreviousAttempts()

      // Load leaderboard
      loadLeaderboard()

      // Subscribe to leaderboard changes
      const leaderboardSubscription = supabase
        .channel("leaderboard-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "twitch_game_scores",
            filter: `game_id=eq.${activeGame.id}`,
          },
          () => {
            loadLeaderboard()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(leaderboardSubscription)
      }
    }
  }, [activeGame, twitchId])

  const loadQuestions = async () => {
    if (!activeGame) return

    const { data } = await supabase
      .from("twitch_game_questions")
      .select("*")
      .eq("game_id", activeGame.id)
      .order("created_at", { ascending: true })

    if (data) {
      setQuestions(data)
    }
  }

  const checkPreviousAttempts = async () => {
    if (!activeGame || !twitchId) return

    // Check if user has already submitted scores
    const { data: scoreData } = await supabase
      .from("twitch_game_scores")
      .select("*")
      .eq("game_id", activeGame.id)
      .eq("twitch_id", twitchId)
      .order("attempt_number", { ascending: false })
      .limit(1)

    if (scoreData && scoreData.length > 0) {
      setHasCompletedGame(true)
      setIsPaid(scoreData[0].is_paid)
      setScore(scoreData[0].total_score)
      setAttemptNumber(scoreData[0].attempt_number + 1)

      // If multiple attempts aren't allowed, go straight to score
      if (!activeGame.entry_limit || scoreData[0].attempt_number >= activeGame.entry_limit) {
        setCurrentStep("score")
      }
    }
  }

  const loadLeaderboard = async () => {
    if (!activeGame || !twitchId) return

    // This would typically be a view or RPC in Supabase
    // For simplicity, we'll query and format the data here
    const { data } = await supabase
      .from("twitch_game_scores")
      .select(`
        twitch_id,
        total_score,
        is_paid,
        twitch_users (
          display_name
        )
      `)
      .eq("game_id", activeGame.id)
      .order("total_score", { ascending: false })
      .order("created_at", { ascending: true })

    if (data) {
      // Filter based on payment requirements
      const filteredData =
        activeGame.scoring_mode === "donation_required" ? data.filter((entry) => entry.is_paid) : data

      // Format for leaderboard
      const formattedLeaderboard = filteredData.map((entry, index) => ({
        twitch_id: entry.twitch_id,
        display_name: entry.twitch_users?.display_name || `User_${entry.twitch_id.substring(0, 8)}`,
        total_score: entry.total_score,
        rank: index + 1,
        is_current_user: entry.twitch_id === twitchId,
      }))

      setLeaderboard(formattedLeaderboard)
    }
  }

  const handleStartGame = () => {
    setCurrentStep("questions")
  }

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setCurrentStep("user-form")
    }
  }

  const handleUserFormSubmit = async (email: string, termsAccepted: boolean) => {
    if (!activeGame || !twitchId || !user) return

    try {
      // Calculate score (simplified - in real app would be server-side)
      let totalScore = 0
      let tiebreakerGuess = null

      // Save entries
      const entries = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId)

        // Simple scoring - 1 point per correct answer
        if (question?.correct_answer === answer) {
          totalScore += 1
        }

        // Store tiebreaker
        if (question?.is_tiebreaker) {
          tiebreakerGuess = Number.parseFloat(answer)
        }

        return {
          game_id: activeGame.id,
          user_id: user.id,
          twitch_id: twitchId,
          question_id: questionId,
          submitted_answer: answer,
          is_paid: isPaid,
        }
      })

      // Insert entries
      const { error: entriesError } = await supabase.from("twitch_game_entries").insert(entries)

      if (entriesError) throw entriesError

      // Save score
      const { error: scoreError } = await supabase.from("twitch_game_scores").insert({
        game_id: activeGame.id,
        user_id: user.id,
        twitch_id: twitchId,
        total_score: totalScore,
        tiebreaker_guess: tiebreakerGuess,
        is_paid: isPaid,
        is_winner: false, // Will be determined later
        attempt_number: attemptNumber,
        email: email,
        email_consent_timestamp: termsAccepted ? new Date().toISOString() : null,
        terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
      })

      if (scoreError) throw scoreError

      // Update user email if provided
      if (email && user.id) {
        await supabase.from("twitch_users").update({ email }).eq("id", user.id)
      }

      setScore(totalScore)
      setCurrentStep("score")
      loadLeaderboard() // Refresh leaderboard
    } catch (error) {
      console.error("Error submitting answers:", error)
    }
  }

  const handleTryAgain = () => {
    if (!activeGame || !activeGame.entry_limit || attemptNumber > activeGame.entry_limit) {
      return
    }

    setCurrentStep("info")
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  // If no active game
  if (!activeGame) {
    return <NoActiveGame />
  }

  // Render current step
  switch (currentStep) {
    case "info":
      return (
        <GameInfo
          game={activeGame}
          onStart={handleStartGame}
          hasCompletedGame={hasCompletedGame}
          canRetry={!activeGame.entry_limit || attemptNumber <= activeGame.entry_limit}
        />
      )

    case "questions":
      return (
        <QuestionCard
          question={questions[currentQuestionIndex]}
          onSubmit={handleAnswerSubmit}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      )

    case "user-form":
      return <UserForm onSubmit={handleUserFormSubmit} termsText={activeGame.terms_text} defaultEmail={user?.email} />

    case "score":
      return (
        <FinalScore
          score={score}
          totalQuestions={questions.length}
          leaderboard={leaderboard}
          donationLink={activeGame.donation_link}
          isPaid={isPaid}
          onTryAgain={handleTryAgain}
          canRetry={!activeGame.entry_limit || attemptNumber <= activeGame.entry_limit}
          gameTitle={activeGame.title}
        />
      )
  }
}
