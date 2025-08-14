"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, ArrowLeft, Zap, Shield } from "lucide-react"
import type { MutableRefObject } from "react"

type GameState = "playing" | "won" | "lost"

interface Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
  hasShield: boolean
  shieldTime: number
  speedBoost: boolean
  speedTime: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}
type Skill = {
  id: string
  name: string
  x: number
  y: number
  collected: boolean
  color: string
}

type PowerUp = {
  id: string
  x: number
  y: number
  type: "speed" | "shield" | "time"
  collected: boolean
  color: string
}

type Obstacle = {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  moveSpeed: number
  direction: number
}

const SKILLS: Omit<Skill, "x" | "y" | "collected">[] = [
  { id: "godot", name: "Godot", color: "#478cbf" },
  { id: "unity", name: "Unity", color: "#ffffff" },
  { id: "react", name: "React", color: "#61dafb" },
  { id: "webdev", name: "Web Dev", color: "#ff6b35" },
  { id: "software", name: "Software", color: "#22c55e" },
  { id: "ai", name: "AI Tools", color: "#e879f9" },
]

interface CodeQuestProps {
  onGameEnd?: () => void
}

export default function CodeQuest({ onGameEnd }: CodeQuestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const [gameState, setGameState] = useState<GameState>("playing")
  const [timeLeft, setTimeLeft] = useState(45)
  const [collectedCount, setCollectedCount] = useState(0)
  const [score, setScore] = useState(0)
  const [showTooltip, setShowTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const gameLoopRef = useRef<number | null>(null)

  // Game state
  const gameRef = useRef({
    player: {
      x: 50,
      y: 150,
      width: 16,
      height: 16,
      speed: 3,
      hasShield: false,
      shieldTime: 0,
      speedBoost: false,
      speedTime: 0,
    } as Player,
    skills: [] as Skill[],
    powerUps: [] as PowerUp[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    lastObstacleSpawn: 0,
    lastPowerUpSpawn: 0,
  })

  const initGame = useCallback(() => {
    const canvas = canvasRef.current!
    const game = gameRef.current

    // Reset player
    game.player = {
      x: 30,
      y: canvas.height / 2 - 8,
      width: 16,
      height: 16,
      speed: 3,
      hasShield: false,
      shieldTime: 0,
      speedBoost: false,
      speedTime: 0,
    }

    // Arrange skills in strategic positions
    const skillPositions = [
      { x: 100, y: 60 },
      { x: 250, y: 40 },
      { x: 400, y: 80 },
      { x: 150, y: 180 },
      { x: 320, y: 200 },
      { x: 450, y: 160 },
    ]

    game.skills = SKILLS.map((skill, i) => ({
      ...skill,
      x: skillPositions[i].x,
      y: skillPositions[i].y,
      collected: false,
    }))

    // Initialize power-ups
    game.powerUps = [
      { id: "speed1", x: 180, y: 120, type: "speed", collected: false, color: "#fbbf24" },
      { id: "shield1", x: 350, y: 140, type: "shield", collected: false, color: "#3b82f6" },
      { id: "time1", x: 280, y: 80, type: "time", collected: false, color: "#10b981" },
    ]

    // Initialize obstacles
    game.obstacles = [
      { id: "obs1", x: 120, y: 100, width: 8, height: 40, color: "#ef4444", moveSpeed: 1, direction: 1 },
      { id: "obs2", x: 300, y: 50, width: 40, height: 8, color: "#ef4444", moveSpeed: 1.5, direction: 1 },
      { id: "obs3", x: 200, y: 220, width: 12, height: 30, color: "#ef4444", moveSpeed: 0.8, direction: -1 },
    ]

    game.particles = []
    game.lastObstacleSpawn = 0
    game.lastPowerUpSpawn = 0
    setGameState("playing")
    setTimeLeft(45)
    setCollectedCount(0)
    setScore(0)
    setShowTooltip(null)
  }, [])

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    const time = Date.now() * 0.01

    // Shield effect
    if (player.hasShield) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 15, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Speed boost effect
    if (player.speedBoost) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(251, 191, 36, ${0.3 - i * 0.1})`
        ctx.fillRect(player.x - i * 4, player.y, player.width, player.height)
      }
    }

    // Player glow
    ctx.shadowColor = "#22d3ee"
    ctx.shadowBlur = 10
    ctx.fillStyle = "#22d3ee"
    ctx.fillRect(player.x, player.y, player.width, player.height)

    // Player details
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(player.x + 4, player.y + 2, 2, 2) // left eye
    ctx.fillRect(player.x + 10, player.y + 2, 2, 2) // right eye

    // Animated mouth
    const mouthY = player.y + 8 + Math.sin(time) * 1
    ctx.fillRect(player.x + 6, mouthY, 4, 2)
  }

  const drawSkillIcon = (ctx: CanvasRenderingContext2D, skill: Skill) => {
    if (skill.collected) return

    const time = Date.now() * 0.003
    const bob = Math.sin(time + skill.x * 0.01) * 3
    const glow = Math.sin(time * 2) * 0.4 + 0.8
    const pulse = Math.sin(time * 3) * 0.1 + 1

    // Enhanced glow
    ctx.shadowColor = skill.color
    ctx.shadowBlur = 15 * glow
    ctx.fillStyle = skill.color + "60"
    ctx.fillRect(skill.x - 3, skill.y + bob - 3, 22 * pulse, 22 * pulse)

    // Background
    ctx.shadowBlur = 0
    ctx.fillStyle = "#0a0a0c"
    ctx.fillRect(skill.x, skill.y + bob, 16, 16)

    // Draw enhanced icons with animations
    ctx.fillStyle = skill.color
    const iconTime = time + skill.x * 0.001

    switch (skill.id) {
      case "godot":
        // Animated Godot robot
        ctx.fillRect(skill.x + 4, skill.y + bob + 2, 8, 6)
        ctx.fillRect(skill.x + 2, skill.y + bob + 4, 2, 2)
        ctx.fillRect(skill.x + 12, skill.y + bob + 4, 2, 2)
        // Blinking eyes
        const blink = Math.sin(iconTime * 4) > 0.8 ? 1 : 2
        ctx.fillRect(skill.x + 5, skill.y + bob + 4, 2, blink)
        ctx.fillRect(skill.x + 9, skill.y + bob + 4, 2, blink)
        ctx.fillRect(skill.x + 4, skill.y + bob + 8, 8, 6)
        break

      case "unity":
        // Rotating Unity cube
        const rotation = iconTime * 2
        ctx.save()
        ctx.translate(skill.x + 8, skill.y + bob + 8)
        ctx.rotate(rotation)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(-5, -5, 10, 10)
        ctx.fillStyle = "#000000"
        ctx.fillRect(-3, -3, 6, 6)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(-2, -2, 4, 4)
        ctx.restore()
        break

      case "react":
        // Spinning React atom
        ctx.save()
        ctx.translate(skill.x + 8, skill.y + bob + 8)
        ctx.rotate(iconTime)
        ctx.strokeStyle = skill.color
        ctx.lineWidth = 2
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.ellipse(0, 0, 6, 3, (i * Math.PI) / 3, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.fillStyle = skill.color
        ctx.fillRect(-1, -1, 2, 2)
        ctx.restore()
        break

      case "webdev":
        // Pulsing HTML brackets
        const bracketPulse = Math.sin(iconTime * 3) * 0.5 + 1
        ctx.fillRect(skill.x + 2, skill.y + bob + 2, 2 * bracketPulse, 12)
        ctx.fillRect(skill.x + 2, skill.y + bob + 2, 4, 2)
        ctx.fillRect(skill.x + 2, skill.y + bob + 12, 4, 2)
        ctx.fillRect(skill.x + 12, skill.y + bob + 2, 2 * bracketPulse, 12)
        ctx.fillRect(skill.x + 10, skill.y + bob + 2, 4, 2)
        ctx.fillRect(skill.x + 10, skill.y + bob + 12, 4, 2)
        ctx.fillRect(skill.x + 6, skill.y + bob + 7, 4, 2)
        break

      case "software":
        // Rotating gear
        ctx.save()
        ctx.translate(skill.x + 8, skill.y + bob + 8)
        ctx.rotate(iconTime * 0.5)
        ctx.fillRect(-2, -6, 4, 12)
        ctx.fillRect(-6, -2, 12, 4)
        ctx.fillRect(-4, -4, 8, 8)
        ctx.fillStyle = "#0a0a0c"
        ctx.fillRect(-2, -2, 4, 4)
        ctx.restore()
        break

      case "ai":
        // Pulsing AI brain
        const aiPulse = Math.sin(iconTime * 4) * 0.2 + 1
        ctx.fillRect(skill.x + 4, skill.y + bob + 2, 8 * aiPulse, 8)
        ctx.fillRect(skill.x + 2, skill.y + bob + 4, 2, 4)
        ctx.fillRect(skill.x + 12, skill.y + bob + 4, 2, 4)
        ctx.fillRect(skill.x + 6, skill.y + bob + 10, 4, 2)
        ctx.fillStyle = "#0a0a0c"
        ctx.fillRect(skill.x + 6, skill.y + bob + 4, 4, 4)
        ctx.fillStyle = skill.color
        ctx.fillRect(skill.x + 7, skill.y + bob + 5, 2, 2)
        break
    }
  }

  const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    if (powerUp.collected) return

    const time = Date.now() * 0.005
    const bob = Math.sin(time + powerUp.x * 0.01) * 2
    const glow = Math.sin(time * 3) * 0.3 + 0.7

    ctx.shadowColor = powerUp.color
    ctx.shadowBlur = 12 * glow
    ctx.fillStyle = powerUp.color

    switch (powerUp.type) {
      case "speed":
        // Lightning bolt
        ctx.fillRect(powerUp.x + 6, powerUp.y + bob, 2, 8)
        ctx.fillRect(powerUp.x + 4, powerUp.y + bob + 2, 6, 2)
        ctx.fillRect(powerUp.x + 8, powerUp.y + bob + 4, 2, 4)
        break
      case "shield":
        // Shield
        ctx.beginPath()
        ctx.arc(powerUp.x + 8, powerUp.y + bob + 6, 6, 0, Math.PI * 2)
        ctx.fill()
        break
      case "time":
        // Clock
        ctx.fillRect(powerUp.x + 4, powerUp.y + bob + 4, 8, 8)
        ctx.fillStyle = "#0a0a0c"
        ctx.fillRect(powerUp.x + 7, powerUp.y + bob + 6, 2, 3)
        ctx.fillRect(powerUp.x + 7, powerUp.y + bob + 8, 3, 2)
        break
    }
    ctx.shadowBlur = 0
  }

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    const time = Date.now() * 0.01
    const pulse = Math.sin(time * 2) * 0.2 + 1

    ctx.shadowColor = obstacle.color
    ctx.shadowBlur = 8
    ctx.fillStyle = obstacle.color
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width * pulse, obstacle.height * pulse)

    // Danger stripes
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    for (let i = 0; i < obstacle.width; i += 4) {
      ctx.fillRect(obstacle.x + i, obstacle.y, 2, obstacle.height)
    }
  }

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Enhanced background
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
    grad.addColorStop(0, "#1a0f2e")
    grad.addColorStop(0.5, "#0f0b1a")
    grad.addColorStop(1, "#0a1820")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Animated grid
    ctx.strokeStyle = "rgba(217, 70, 239, 0.1)"
    ctx.lineWidth = 1
    const offset = (Date.now() * 0.02) % 40
    for (let i = -offset; i < width + 40; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = -offset; i < height + 40; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Enhanced particles
    const game = gameRef.current
    game.particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.015
      if (p.life <= 0) {
        game.particles.splice(i, 1)
        return
      }
      const alpha = Math.floor(p.life * 255)
        .toString(16)
        .padStart(2, "0")
      ctx.fillStyle = p.color + alpha
      ctx.fillRect(p.x, p.y, 3, 3)
    })

    // Add more particles
    if (Math.random() < 0.15) {
      game.particles.push({
        x: Math.random() * width,
        y: height + 10,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 3 - 1,
        life: 1,
        color: ["#e879f9", "#22d3ee", "#fbbf24"][Math.floor(Math.random() * 3)],
      })
    }
  }

  const checkCollisions = useCallback(() => {
    const game = gameRef.current
    const player = game.player

    // Skill collisions
    game.skills.forEach((skill) => {
      if (skill.collected) return

      const dx = player.x + player.width / 2 - (skill.x + 8)
      const dy = player.y + player.height / 2 - (skill.y + 8)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 20) {
        skill.collected = true
        setCollectedCount((prev) => prev + 1)
        setScore((prev) => prev + 100)

        setShowTooltip({
          text: `+${skill.name}!`,
          x: skill.x,
          y: skill.y - 20,
        })
        setTimeout(() => setShowTooltip(null), 1500)

        // Enhanced celebration particles
        for (let i = 0; i < 12; i++) {
          game.particles.push({
            x: skill.x + 8,
            y: skill.y + 8,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color: skill.color,
          })
        }
      }
    })

    // Power-up collisions
    game.powerUps.forEach((powerUp) => {
      if (powerUp.collected) return

      const dx = player.x + player.width / 2 - (powerUp.x + 8)
      const dy = player.y + player.height / 2 - (powerUp.y + 8)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 15) {
        powerUp.collected = true
        setScore((prev) => prev + 50)

        switch (powerUp.type) {
          case "speed":
            player.speedBoost = true
            player.speedTime = 300 // 5 seconds at 60fps
            setShowTooltip({ text: "Speed Boost!", x: powerUp.x, y: powerUp.y - 20 })
            break
          case "shield":
            player.hasShield = true
            player.shieldTime = 600 // 10 seconds
            setShowTooltip({ text: "Shield Active!", x: powerUp.x, y: powerUp.y - 20 })
            break
          case "time":
            setTimeLeft((prev) => prev + 10)
            setShowTooltip({ text: "+10 Seconds!", x: powerUp.x, y: powerUp.y - 20 })
            break
        }
        setTimeout(() => setShowTooltip(null), 1500)
      }
    })

    // Obstacle collisions
    if (!player.hasShield) {
      game.obstacles.forEach((obstacle) => {
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          // Hit obstacle - lose time
          setTimeLeft((prev) => Math.max(0, prev - 5))
          setShowTooltip({ text: "-5 Seconds!", x: player.x, y: player.y - 20 })
          setTimeout(() => setShowTooltip(null), 1000)

          // Knockback
          player.x = Math.max(0, player.x - 20)
        }
      })
    }
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const game = gameRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBackground(ctx, canvas.width, canvas.height)

    // Update player
    const keys = keysRef.current
    const touch = touchRef.current
    let dx = 0,
      dy = 0

    // WASD only controls
    if (keys.has("KeyA") || keys.has("a")) dx -= 1
    if (keys.has("KeyD") || keys.has("d")) dx += 1
    if (keys.has("KeyW") || keys.has("w")) dy -= 1
    if (keys.has("KeyS") || keys.has("s")) dy += 1

    // Touch controls
    if (touch) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      if (Math.abs(touch.x - centerX) > 30) dx = touch.x > centerX ? 1 : -1
      if (Math.abs(touch.y - centerY) > 30) dy = touch.y > centerY ? 1 : -1
    }

    const currentSpeed = game.player.speedBoost ? game.player.speed * 1.8 : game.player.speed
    game.player.x += dx * currentSpeed
    game.player.y += dy * currentSpeed

    // Bounds checking
    game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x))
    game.player.y = Math.max(0, Math.min(canvas.height - game.player.height, game.player.y))

    // Update power-up timers
    if (game.player.speedTime > 0) {
      game.player.speedTime--
      if (game.player.speedTime <= 0) game.player.speedBoost = false
    }
    if (game.player.shieldTime > 0) {
      game.player.shieldTime--
      if (game.player.shieldTime <= 0) game.player.hasShield = false
    }

    // Update obstacles
    game.obstacles.forEach((obstacle) => {
      if (obstacle.width > obstacle.height) {
        obstacle.x += obstacle.moveSpeed * obstacle.direction
        if (obstacle.x <= 0 || obstacle.x + obstacle.width >= canvas.width) {
          obstacle.direction *= -1
        }
      } else {
        obstacle.y += obstacle.moveSpeed * obstacle.direction
        if (obstacle.y <= 0 || obstacle.y + obstacle.height >= canvas.height) {
          obstacle.direction *= -1
        }
      }
    })

    // Draw everything
    game.skills.forEach((skill) => drawSkillIcon(ctx, skill))
    game.powerUps.forEach((powerUp) => drawPowerUp(ctx, powerUp))
    game.obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle))
    drawPlayer(ctx, game.player)

    checkCollisions()

    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState, checkCollisions])

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("lost")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Check win condition
  useEffect(() => {
    if (collectedCount >= 6 && gameState === "playing") {
      setGameState("won")
    }
  }, [collectedCount, gameState])

  // Keyboard controls (WASD only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      keysRef.current.add(e.key.toLowerCase())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current!

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      touchRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      touchRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      touchRef.current = null
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = Math.max(canvas.offsetWidth, 500)
      canvas.height = canvas.offsetHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    initGame()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [initGame])

  // Start game loop
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop, checkCollisions])

  const scrollToSkills = () => {
    document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg border border-white/10 bg-[#0a0a0c]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Game Stats - Centered at top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-fuchsia-300">{timeLeft}s</div>
          <div className="text-xs text-pink-200">Time</div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-cyan-300">{collectedCount}/6</div>
          <div className="text-xs text-pink-200">Skills</div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-pink-200">Score</div>
        </div>
      </div>

      {/* Power-up Status - Bottom left */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {gameRef.current.player.hasShield && (
          <div className="flex items-center gap-1 rounded-full bg-blue-600/80 px-3 py-1 text-sm text-white">
            <Shield className="h-3 w-3" />
            <span>Shield</span>
          </div>
        )}
        {gameRef.current.player.speedBoost && (
          <div className="flex items-center gap-1 rounded-full bg-yellow-600/80 px-3 py-1 text-sm text-white">
            <Zap className="h-3 w-3" />
            <span>Speed</span>
          </div>
        )}
      </div>

      {/* Controls hint - Bottom right */}
      <div className="absolute bottom-4 right-4 text-xs text-zinc-400 bg-black/60 px-2 py-1 rounded">
        <span className="hidden sm:inline">WASD to move</span>
        <span className="sm:hidden">Touch to move</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-10 rounded-md bg-black/80 px-2 py-1 text-xs text-white animate-bounce"
          style={{
            left: showTooltip.x,
            top: showTooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          {showTooltip.text}
        </div>
      )}

      {/* Win Screen */}
      {gameState === "won" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center space-y-3 sm:space-y-4 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-emerald-400">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              All Skills Unlocked!
            </div>
            <p className="text-sm sm:text-base text-zinc-300">
              Score: {score} • Time: {45 - timeLeft}s
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              <Button onClick={scrollToSkills} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-xs sm:text-sm">
                View Skills Tree
              </Button>
              <Button onClick={initGame} variant="outline" className="border-white/20 bg-white/5 text-xs sm:text-sm">
                <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Play Again
              </Button>
              <Button onClick={onGameEnd} variant="outline" className="border-white/20 bg-white/5 text-xs sm:text-sm">
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Choose Game
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lose Screen */}
      {gameState === "lost" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center space-y-3 sm:space-y-4 max-w-sm">
            <div className="text-lg sm:text-xl font-bold text-red-400">Time{"'"}s Up!</div>
            <p className="text-sm sm:text-base text-zinc-300">
              Skills: {collectedCount}/6 • Score: {score}
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              <Button onClick={initGame} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-xs sm:text-sm">
                <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Try Again
              </Button>
              <Button onClick={onGameEnd} variant="outline" className="border-white/20 bg-white/5 text-xs sm:text-sm">
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Choose Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
