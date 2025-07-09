"use client"

import { useState, useEffect } from "react"

interface QuizQuestion {
  question: string
  answers: string[]
  correct: number
}

interface LeaderboardEntry {
  name: string
  score: number
}

declare global {
  interface Window {
    Twitch?: {
      ext: {
        onAuthorized: (callback: (auth: any) => void) => void
      }
    }
  }
}

const quizPool: QuizQuestion[] = [
  {
    question: "What is the cost for families to receive treatment, travel, housing, and food at St. Jude?",
    answers: ["$0 – St. Jude covers it all", "$10,000", "$1,000", "$100"],
    correct: 0,
  },
  {
    question: "How does St. Jude share its research with the world?",
    answers: [
      "Keeps it internal",
      "Shares it freely with doctors and scientists globally",
      "Sells it to the highest bidder",
      "Shares it once a year",
    ],
    correct: 1,
  },
  {
    question: "Since opening in 1962, how has St. Jude helped increase childhood cancer survival rates?",
    answers: ["Stayed the same", "From 20% to over 80%", "From 10% to 20%", "From 40% to 60%"],
    correct: 1,
  },
  {
    question: "Which creator has publicly supported St. Jude's mission?",
    answers: ["Elon Musk", "Charli D'Amelio", "MrBeast", "Logan Paul"],
    correct: 2,
  },
  {
    question: "Why are small donations to St. Jude especially powerful?",
    answers: [
      "They buy ads on social media",
      "Most funding comes from everyday people, not corporations",
      "They're matched by the government",
      "They're used to build new hospitals overseas",
    ],
    correct: 1,
  },
  {
    question: "What makes St. Jude different from most hospitals?",
    answers: [
      "It never sends families a bill",
      "It has TikTok influencers on staff",
      "It only accepts celebrities",
      "It only treats rare conditions",
    ],
    correct: 0,
  },
  {
    question: "How often does St. Jude update its research and protocols?",
    answers: [
      "Only when asked",
      "Only for big donors",
      "Once every 5 years",
      "Constantly, to push global breakthroughs",
    ],
    correct: 3,
  },
  {
    question: "What happens when a child is treated at St. Jude?",
    answers: [
      "They get world-class treatment with no financial burden",
      "Their community covers costs",
      "They have to stay long term",
      "Their family pays out of pocket",
    ],
    correct: 0,
  },
  {
    question: "Which of these best reflects St. Jude's mission?",
    answers: [
      "To cure childhood diseases and share the science with the world",
      "To support pharmaceutical companies",
      "To treat adults with rare cancers",
      "To fundraise for hospitals globally",
    ],
    correct: 0,
  },
  {
    question: "Which of these has St. Jude done recently?",
    answers: [
      "Opened a chain of clinics in malls",
      "Bought a sports team",
      "Partnered with fashion brands",
      "Launched the largest childhood cancer research initiative in the U.S.",
    ],
    correct: 3,
  },
]

export default function TwitchQuizPanel() {
  const [currentScreen, setCurrentScreen] = useState<"landing" | "quiz" | "results">("landing")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [twitchUser, setTwitchUser] = useState("friend")
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Initialize Twitch integration
    if (typeof window !== "undefined" && window.Twitch && window.Twitch.ext) {
      window.Twitch.ext.onAuthorized((auth) => {
        try {
          const payload = JSON.parse(atob(auth.token.split(".")[1]))
          if (payload.user_id && payload.user_id !== "0") {
            setTwitchUser(`Twitch User ${payload.user_id}`)
          }
        } catch (e) {
          console.error("Failed to decode Twitch token", e)
        }
      })
    }
  }, [])

  useEffect(() => {
    // Add to leaderboard when quiz is complete
    if (currentScreen === "results") {
      setLeaderboardData((prev) => [...prev, { name: twitchUser, score }])
    }
  }, [currentScreen])

  const transitionTo = (callback: () => void) => {
    setIsTransitioning(true)
    setTimeout(() => {
      callback()
      setIsTransitioning(false)
    }, 400)
  }

  const startQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    const shuffledQuiz = [...quizPool].sort(() => 0.5 - Math.random()).slice(0, 5)
    setQuizData(shuffledQuiz)
    setCurrentScreen("quiz")
  }

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex)
    setShowAnswers(true)

    if (answerIndex === quizData[currentQuestion].correct) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowAnswers(false)
      } else {
        transitionTo(() => setCurrentScreen("results"))
      }
    }, 1000)
  }

  const getPersonality = () => {
    if (score === quizData.length) {
      return {
        title: "God-Tier Gamer",
        description:
          "Flawless execution. You speedran this quiz like a world record holder. Queue up the full game and flex on 'em!",
      }
    } else if (score >= 4) {
      return {
        title: "XP Grinder",
        description:
          "You've clearly been grinding—smart plays, sharp reflexes! Now loot your reward and dive into the full game!",
      }
    } else if (score >= 2) {
      return {
        title: "Side Quester",
        description:
          "You're on a noble mission and halfway to main story glory! Queue up the full game for more epic trivia action!",
      }
    } else {
      return {
        title: "Rookie Respawner",
        description:
          "You're just dropping in! You've got solid starter loot—now head to the full game and frag that leaderboard!",
      }
    }
  }

  const openFullGame = () => {
    window.open("https://play.thropicgames.com/challenge/gcx-2025/ZxVRDO", "_blank")
  }

  const renderLanding = () => (
    <div>
      <img
        className="trophy"
        src="https://thropicgames.com/wp-content/themes/salient/img/trophy.png?_t=1752028985"
        alt="Trophy"
      />
      <h1 className="header-title text-xl leading-10">Charity Trivia Challenge</h1>
      <p className="leading-5 text-base">
        Hey {twitchUser}, think you&apos;ve got what it takes to level up? This quick-fire charity quiz is your warm-up
        round!
      </p>
      <button onClick={() => transitionTo(startQuiz)}>Start Quiz</button>
    </div>
  )

  const renderQuestion = () => {
    const q = quizData[currentQuestion]
    const progress = (currentQuestion / quizData.length) * 100

    return (
      <div className="question-card">
        <h2 className="header-title text-2xl leading-10">
          Question {currentQuestion + 1}/{quizData.length}
        </h2>
        <p className="leading-4">{q.question}</p>
        {q.answers.map((answer, i) => (
          <div
            key={i}
            className={`answer ${
              showAnswers ? (i === q.correct ? "correct" : i === selectedAnswer ? "incorrect" : "") : ""
            }`}
            onClick={() => selectAnswer(i)}
            style={{ cursor: selectedAnswer !== null ? "default" : "pointer" }}
          >
            {answer}
          </div>
        ))}
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    )
  }

  const renderResults = () => {
    const personality = getPersonality()

    return (
      <div className="results">
        <h2 className="header-title text-2xl">Quiz Complete!</h2>
        <p>
          <strong>{twitchUser}</strong>, you scored{" "}
          <strong>
            {score}/{quizData.length}
          </strong>
        </p>
        <h3 className="font-bold text-xl" style={{ color: "#ffc107" }}>{personality.title}</h3>
        <p>{personality.description}</p>
        <button onClick={openFullGame}>Play Full Game</button>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');
        
        :global(body) {
          margin: 0;
          font-family: sans-serif;
          background: black;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        :global(*) {
          color: white;
        }
        
        .header-title {
          font-family: 'Orbitron', sans-serif;
        }
        
        .container {
          width: 318px;
          height: 496px;
          padding: 1rem;
          text-align: center;
          overflow-y: auto;
          opacity: 1;
          transition: opacity 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: black;
          color: white;
        }

        .container h1,
        .container h2,
        .container h3,
        .container p {
          color: white;
        }
        
        .fade-out {
          opacity: 0 !important;
        }
        
        .fade-in {
          opacity: 1 !important;
        }
        
        .trophy {
          width: 120px;
          height: auto;
          margin: 0 auto 1rem;
          animation: float 2s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        button {
          background: #ff0055;
          border: none;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          color: white;
          cursor: pointer;
          border-radius: 10px;
          margin-top: 1rem;
          box-shadow: 0 0 12px #ff0055;
          transition: transform 0.2s ease, background 0.2s ease;
          width: 80%;
        }
        
        button:hover {
          transform: scale(1.05);
          background: #ff3377;
        }
        
        .question-card {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
          box-shadow: 0 0 12px rgba(0,255,255,0.2);
        }
        
        .answer {
          margin: 0.5rem auto;
          background: #222;
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 0.7rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .answer:hover {
          border-color: #00f0ff;
          box-shadow: 0 0 8px #00f0ff;
        }
        
        .correct {
          background-color: #28a745 !important;
          border-color: #28a745 !important;
        }
        
        .incorrect {
          background-color: #dc3545 !important;
          border-color: #dc3545 !important;
        }
        
        .progress {
          height: 6px;
          background: #555;
          border-radius: 5px;
          margin: 0.5rem 0;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, #ff0055, #ffc107);
          width: 0%;
          transition: width 0.4s ease;
        }
        
        .results {
          background: rgba(255,255,255,0.05);
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 0 12px rgba(255, 0, 255, 0.3);
        }
        
        .results h3 {
          margin-top: 1 rem;
          color: white;
        }
        
        .results p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
      `}</style>

      <div className={`container ${isTransitioning ? "fade-out" : "fade-in"}`}>
        {currentScreen === "landing" && renderLanding()}
        {currentScreen === "quiz" && renderQuestion()}
        {currentScreen === "results" && renderResults()}
      </div>
    </>
  )
}
