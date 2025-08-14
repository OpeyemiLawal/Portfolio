"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, ArrowLeft, Gamepad2, Bug, Zap } from "lucide-react"
import CodeQuest from "./code-quest"
import DebugDash from "./debug-dash"
import NeonPlatformer from "./neon-platformer"

type GameType = "selector" | "code-quest" | "debug-dash" | "neon-platformer"

const games = [
  {
    id: "code-quest" as const,
    name: "Code Quest",
    description: "Navigate through a skill-collecting adventure with power-ups and obstacles",
    icon: Gamepad2,
    color: "from-cyan-500 to-blue-600",
    difficulty: "Easy",
    features: ["WASD Movement", "Power-ups", "Obstacles", "Timer Challenge"],
  },
  {
    id: "debug-dash" as const,
    name: "Debug Dash",
    description: "Hunt down evolving bugs with combo multipliers and special abilities",
    icon: Bug,
    color: "from-red-500 to-pink-600",
    difficulty: "Medium",
    features: ["Click/Tap", "Combo System", "Bug Evolution", "Power-ups"],
  },
  {
    id: "neon-platformer" as const,
    name: "Neon Jump",
    description: "Master precise platforming with moving platforms and checkpoint system",
    icon: Zap,
    color: "from-purple-500 to-fuchsia-600",
    difficulty: "Hard",
    features: ["WASD + Space", "Moving Platforms", "Checkpoints", "Physics"],
  },
]

export default function GameSelector() {
  const [currentGame, setCurrentGame] = useState<GameType>("selector")

  const handleGameSelect = (gameId: GameType) => {
    setCurrentGame(gameId)
  }

  const handleBackToSelector = () => {
    setCurrentGame("selector")
  }

  // Game selector screen
  if (currentGame === "selector") {
    return (
      <div className="h-[320px] w-full p-3 sm:p-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Choose Your Challenge
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">Interactive demos showcasing different technical skills</p>
        </div>

        {/* Games Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 min-h-0">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-3 sm:p-4 text-left transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-lg hover:shadow-fuchsia-500/10"
              >
                {/* Background gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative h-full flex flex-col">
                  {/* Icon and difficulty */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${game.color} shadow-lg`}>
                      <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-xs text-zinc-400 bg-white/10 px-2 py-1 rounded-full border border-white/10">
                      {game.difficulty}
                    </span>
                  </div>

                  {/* Game info */}
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-white text-sm sm:text-lg mb-1 sm:mb-2 group-hover:text-fuchsia-200 transition-colors">
                      {game.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3 flex-1 line-clamp-2">
                      {game.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {game.features.slice(0, 2).map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-white/5 text-zinc-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/10"
                        >
                          {feature}
                        </span>
                      ))}
                      {game.features.length > 2 && (
                        <span className="text-xs bg-white/5 text-zinc-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/10">
                          +{game.features.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Play button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Click to play</span>
                      <div className="flex items-center gap-1 text-fuchsia-300 group-hover:text-fuchsia-200 transition-colors">
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm font-medium">Play</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div
                    className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r ${game.color} blur-xl opacity-20`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs text-zinc-500">Each game demonstrates different aspects of interactive development</p>
        </div>
      </div>
    )
  }

  // Game components with back button
  return (
    <div className="relative h-[320px] w-full">
      <Button
        onClick={handleBackToSelector}
        variant="outline"
        size="sm"
        className="absolute top-2 left-2 z-10 border-white/20 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm text-xs sm:text-sm"
      >
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Back
      </Button>

      {currentGame === "code-quest" && <CodeQuest onGameEnd={handleBackToSelector} />}
      {currentGame === "debug-dash" && <DebugDash onGameEnd={handleBackToSelector} />}
      {currentGame === "neon-platformer" && <NeonPlatformer onGameEnd={handleBackToSelector} />}
    </div>
  )
}
