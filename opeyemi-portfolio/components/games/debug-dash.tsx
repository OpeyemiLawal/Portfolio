"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, ArrowLeft, Zap, Target } from "lucide-react"
import { useRouter } from "next/navigation"

type GameState = "playing" | "won" | "gameOver"
type Bug = {
  id: number
  x: number
  y: number
  size: number
  life: number
  color: string
  glitchOffset: number
  type: "normal" | "fast" | "big" | "spawner"
  speed: number
  points: number
}

type PowerUp = {
  id: number
  x: number
  y: number
  type: "freeze" | "double" | "laser"
  life: number
  color: string
}

interface DebugDashProps {
  onGameEnd?: () => void
}

export default function DebugDash({ onGameEnd }: DebugDashProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const bugIdRef = useRef(0)
  const powerUpIdRef = useRef(0)

  const [gameState, setGameState] = useState<GameState>("playing")
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)

  const gameRef = useRef({
    bugs: [] as Bug[],
    powerUps: [] as PowerUp[],
    freezeTime: 0,
    doublePoints: false,
    doubleTime: 0,
    laserActive: false,
    laserTime: 0,
    comboTimer: 0,
    lastBugSpawn: 0,
    lastPowerUpSpawn: 0,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>
  })

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.bugs = []
    game.powerUps = []
    game.particles = []
    game.lastBugSpawn = 0
    game.lastPowerUpSpawn = 0
    game.freezeTime = 0
    game.doublePoints = false
    game.doubleTime = 0
    game.laserActive = false
    game.laserTime = 0
    game.comboTimer = 0
    bugIdRef.current = 0
    powerUpIdRef.current = 0
    setGameState("playing")
    setTimeLeft(30)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
  }, [])

  const spawnBug = useCallback(() => {
    const canvas = canvasRef.current!
    const game = gameRef.current

    const bugTypes = [
      { type: "normal", size: 15, speed: 0.5, points: 10, color: "#ff6b6b", weight: 50 },
      { type: "fast", size: 12, speed: 2, points: 20, color: "#4ecdc4", weight: 25 },
      { type: "big", size: 25, speed: 0.2, points: 30, color: "#45b7d1", weight: 15 },
      { type: "spawner", size: 20, speed: 0.3, points: 50, color: "#feca57", weight: 10 },
    ] as const

    // Weighted random selection
    const totalWeight = bugTypes.reduce((sum, type) => sum + type.weight, 0)
    let random = Math.random() * totalWeight
    
    type BugType = typeof bugTypes[number]
    let selectedType: BugType = bugTypes[0]

    for (const type of bugTypes) {
      random -= type.weight
      if (random <= 0) {
        selectedType = type
        break
      }
    }

    game.bugs.push({
      id: bugIdRef.current++,
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      size: selectedType.size + Math.random() * 5,
      life: 1,
      color: selectedType.color,
      glitchOffset: Math.random() * Math.PI * 2,
      type: selectedType.type,
      speed: selectedType.speed,
      points: selectedType.points,
    })
  }, [])

  const spawnPowerUp = useCallback(() => {
    const canvas = canvasRef.current!
    const game = gameRef.current

    const powerUpTypes = [
      { type: "freeze", color: "#3b82f6" },
      { type: "double", color: "#10b981" },
      { type: "laser", color: "#f59e0b" },
    ] as const

    const selectedType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]

    game.powerUps.push({
      id: powerUpIdRef.current++,
      x: Math.random() * (canvas.width - 30) + 15,
      y: Math.random() * (canvas.height - 30) + 15,
      type: selectedType.type,
      life: 1,
      color: selectedType.color,
    })
  }, [])

  const drawBug = (ctx: CanvasRenderingContext2D, bug: Bug) => {
    const time = Date.now() * 0.01
    const glitch = gameRef.current.freezeTime > 0 ? 0 : Math.sin(time + bug.glitchOffset) * 3
    const frozen = gameRef.current.freezeTime > 0

    ctx.save()
    ctx.translate(bug.x + glitch, bug.y)

    // Enhanced glow based on bug type
    const glowIntensity = frozen ? 5 : 15
    ctx.shadowColor = bug.color
    ctx.shadowBlur = glowIntensity
    ctx.fillStyle =
      bug.color +
      Math.floor(bug.life * 255)
        .toString(16)
        .padStart(2, "0")

    // Draw bug based on type
    switch (bug.type) {
      case "normal":
        // Standard hexagon
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * bug.size * 0.5
          const y = Math.sin(angle) * bug.size * 0.5
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.fill()
        break

      case "fast":
        // Streamlined shape with motion lines
        ctx.fillRect(-bug.size * 0.3, -bug.size * 0.2, bug.size * 0.6, bug.size * 0.4)
        ctx.fillRect(-bug.size * 0.4, -bug.size * 0.1, bug.size * 0.2, bug.size * 0.2)
        ctx.fillRect(bug.size * 0.2, -bug.size * 0.1, bug.size * 0.2, bug.size * 0.2)
        // Motion trails
        if (!frozen) {
          ctx.fillStyle = bug.color + "40"
          for (let i = 1; i <= 3; i++) {
            ctx.fillRect(-bug.size * 0.3 - i * 5, -bug.size * 0.1, bug.size * 0.4, bug.size * 0.2)
          }
        }
        break

      case "big":
        // Large octagon
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4
          const x = Math.cos(angle) * bug.size * 0.5
          const y = Math.sin(angle) * bug.size * 0.5
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.fill()
        break

      case "spawner":
        // Pulsing diamond with spawn indicators
        const pulse = Math.sin(time * 4) * 0.2 + 1
        ctx.beginPath()
        ctx.moveTo(0, -bug.size * 0.5 * pulse)
        ctx.lineTo(bug.size * 0.5 * pulse, 0)
        ctx.lineTo(0, bug.size * 0.5 * pulse)
        ctx.lineTo(-bug.size * 0.5 * pulse, 0)
        ctx.closePath()
        ctx.fill()
        // Spawn indicators
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(-2, -2, 4, 4)
        break
    }

    // Bug legs/details
    ctx.strokeStyle = bug.color
    ctx.lineWidth = 2
    const legCount = bug.type === "big" ? 8 : 6
    for (let i = 0; i < legCount; i++) {
      const angle = (i * Math.PI * 2) / legCount
      const startX = Math.cos(angle) * bug.size * 0.3
      const startY = Math.sin(angle) * bug.size * 0.3
      const endX = Math.cos(angle) * bug.size * 0.6
      const endY = Math.sin(angle) * bug.size * 0.6
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }

    // Eyes
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(-4, -6, 3, 3)
    ctx.fillRect(1, -6, 3, 3)

    ctx.restore()
  }

  const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    const time = Date.now() * 0.005
    const bob = Math.sin(time + powerUp.x * 0.01) * 3
    const glow = Math.sin(time * 3) * 0.3 + 0.7

    ctx.shadowColor = powerUp.color
    ctx.shadowBlur = 15 * glow
    ctx.fillStyle = powerUp.color

    switch (powerUp.type) {
      case "freeze":
        // Snowflake
        ctx.save()
        ctx.translate(powerUp.x, powerUp.y + bob)
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3)
          ctx.fillRect(-1, -8, 2, 16)
          ctx.fillRect(-4, -6, 8, 2)
        }
        ctx.restore()
        break
      case "double":
        // Double coins
        ctx.beginPath()
        ctx.arc(powerUp.x - 3, powerUp.y + bob, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(powerUp.x + 3, powerUp.y + bob, 6, 0, Math.PI * 2)
        ctx.fill()
        break
      case "laser":
        // Laser sight
        ctx.fillRect(powerUp.x - 8, powerUp.y + bob - 1, 16, 2)
        ctx.fillRect(powerUp.x - 1, powerUp.y + bob - 8, 2, 16)
        ctx.beginPath()
        ctx.arc(powerUp.x, powerUp.y + bob, 4, 0, Math.PI * 2)
        ctx.fill()
        break
    }
    ctx.shadowBlur = 0
  }

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Enhanced background with effects
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
    grad.addColorStop(0, "#1a0f2e")
    grad.addColorStop(0.5, "#0f0b1a")
    grad.addColorStop(1, "#0a1820")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Freeze effect
    if (gameRef.current.freezeTime > 0) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fillRect(0, 0, width, height)
    }

    // Double points effect
    if (gameRef.current.doublePoints) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.05)"
      ctx.fillRect(0, 0, width, height)
    }

    // Laser effect
    if (gameRef.current.laserActive) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.1)"
      ctx.fillRect(0, 0, width, height)
    }

    // Animated grid
    ctx.strokeStyle = "rgba(217, 70, 239, 0.08)"
    ctx.lineWidth = 1
    const offset = (Date.now() * 0.03) % 50
    for (let i = -offset; i < width + 50; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = -offset; i < height + 50; i += 50) {
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
      p.life -= 0.02
      if (p.life <= 0) {
        game.particles.splice(i, 1)
        return
      }
      const alpha = Math.floor(p.life * 255)
        .toString(16)
        .padStart(2, "0")
      ctx.fillStyle = p.color + alpha
      ctx.fillRect(p.x, p.y, 4, 4)
    })
  }

  const scrollToProjects = useCallback(() => {
    router.push('/#projects')
  }, [router])

  const resetGame = useCallback(() => {
    initGame()
  }, [initGame])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return

      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      let clientX: number, clientY: number
      
      if ('touches' in e) {
        // Touch event
        const touch = e.touches[0] || (e as unknown as TouchEvent).changedTouches[0]
        clientX = touch.clientX
        clientY = touch.clientY
      } else {
        // Mouse event
        clientX = e.clientX
        clientY = e.clientY
      }
      
      const x = clientX - rect.left
      const y = clientY - rect.top

      const game = gameRef.current
      let hitSomething = false

      // Check power-up clicks first
      for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i]
        const dx = x - powerUp.x
        const dy = y - powerUp.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 15) {
          game.powerUps.splice(i, 1)
          hitSomething = true

          switch (powerUp.type) {
            case "freeze":
              game.freezeTime = 180 // 3 seconds
              break
            case "double":
              game.doublePoints = true
              game.doubleTime = 300 // 5 seconds
              break
            case "laser":
              game.laserActive = true
              game.laserTime = 240 // 4 seconds
              break
          }

          // Power-up particles
          for (let j = 0; j < 8; j++) {
            game.particles.push({
              x: powerUp.x,
              y: powerUp.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 1,
              color: powerUp.color,
            })
          }
          break
        }
      }

      // Check bug clicks
      for (let i = game.bugs.length - 1; i >= 0; i--) {
        const bug = game.bugs[i]
        const dx = x - bug.x
        const dy = y - bug.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < bug.size || (game.laserActive && Math.abs(dx) < 50 && Math.abs(dy) < 50)) {
          game.bugs.splice(i, 1)
          hitSomething = true

          // Calculate points
          let points = bug.points
          if (game.doublePoints) points *= 2
          points += combo * 5 // Combo bonus

          setScore((prev) => prev + points)
          setCombo((prev) => {
            const newCombo = prev + 1
            setMaxCombo((max) => Math.max(max, newCombo))
            return newCombo
          })
          game.comboTimer = 120 // 2 seconds to maintain combo

          // Spawner bug creates more bugs when destroyed
          if (bug.type === "spawner") {
            for (let j = 0; j < 3; j++) {
              game.bugs.push({
                id: bugIdRef.current++,
                x: bug.x + (Math.random() - 0.5) * 60,
                y: bug.y + (Math.random() - 0.5) * 60,
                size: 10 + Math.random() * 5,
                life: 1,
                color: "#ff6b6b",
                glitchOffset: Math.random() * Math.PI * 2,
                type: "normal",
                speed: 1,
                points: 15,
              })
            }
          }

          // Enhanced explosion particles
          const particleCount = bug.type === "big" ? 15 : 10
          for (let j = 0; j < particleCount; j++) {
            game.particles.push({
              x: bug.x,
              y: bug.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 1,
              color: bug.color,
            })
          }
          break
        }
      }

      // Reset combo if no hit
      if (!hitSomething) {
        setCombo(0)
        game.comboTimer = 0
      }
    },
    [gameState, combo, initGame]
  )

  // Game loop
  const gameLoop = useCallback(() => {
    const now = Date.now()
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const game = gameRef.current
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw background
    drawBackground(ctx, canvas.width, canvas.height)
    
    // Update game state
    if (gameState === 'playing') {
      // Spawn power-ups
      if (now - game.lastPowerUpSpawn > 8000 + Math.random() * 5000) {
        spawnPowerUp()
        game.lastPowerUpSpawn = now
      }

      // Spawn bugs
      const spawnRate = Math.max(500, 1500 - timeLeft * 30) // Faster spawning over time
      if (now - game.lastBugSpawn > spawnRate) {
        spawnBug()
        game.lastBugSpawn = now
      }

      // Update timers
      if (game.freezeTime > 0) game.freezeTime--
      if (game.doubleTime > 0) {
        game.doubleTime--
        if (game.doubleTime <= 0) game.doublePoints = false
      }
      if (game.laserTime > 0) {
        game.laserTime--
        if (game.laserTime <= 0) game.laserActive = false
      }
      if (game.comboTimer > 0) {
        game.comboTimer--
        if (game.comboTimer <= 0) setCombo(0)
      }
    }

    // Update and draw bugs
    for (let i = game.bugs.length - 1; i >= 0; i--) {
      const bug = game.bugs[i]
      
      // Update bug movement (unless frozen)
      if (game.freezeTime <= 0) {
        bug.life -= 0.005 // Bugs fade out over time

        // Move bugs based on type
        switch (bug.type) {
          case "fast":
            const angle = Math.atan2(canvas.height / 2 - bug.y, canvas.width / 2 - bug.x)
            bug.x += Math.cos(angle) * bug.speed
            bug.y += Math.sin(angle) * bug.speed
            break
          case "normal":
            bug.x += (Math.random() - 0.5) * bug.speed
            bug.y += (Math.random() - 0.5) * bug.speed
            break
          case "big":
            bug.x += Math.sin(now * 0.001 + bug.id) * bug.speed
            bug.y += Math.cos(now * 0.001 + bug.id) * bug.speed
            break
          case "spawner":
            bug.x += Math.sin(now * 0.002 + bug.id) * bug.speed * 0.5
            bug.y += Math.cos(now * 0.002 + bug.id) * bug.speed * 0.5
            break
        }

        // Keep bugs in bounds
        bug.x = Math.max(bug.size, Math.min(canvas.width - bug.size, bug.x))
        bug.y = Math.max(bug.size, Math.min(canvas.height - bug.size, bug.y))
      }

      if (bug.life <= 0) {
        game.bugs.splice(i, 1)
        continue
      }
      
      drawBug(ctx, bug)
    }

    // Draw power-ups
    for (let i = game.powerUps.length - 1; i >= 0; i--) {
      const powerUp = game.powerUps[i]
      powerUp.life -= 0.003
      
      if (powerUp.life <= 0) {
        game.powerUps.splice(i, 1)
        continue
      }
      
      drawPowerUp(ctx, powerUp)
    }

    // Draw UI
    if (gameState === 'playing') {
      // Draw score and time
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${score}`, 20, 40)
      
      // Draw combo
      if (combo > 0) {
        ctx.fillStyle = `hsl(${combo * 10 % 360}, 100%, 60%)`
        ctx.font = `${18 + combo * 2}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(`${combo} COMBO!`, canvas.width / 2, 40)
      }
      
      // Draw time remaining
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`Time: ${timeLeft}`, canvas.width - 20, 40)
      
      // Draw power-up indicators
      if (game.freezeTime > 0) {
        ctx.fillStyle = 'rgba(0, 180, 216, 0.5)'
        ctx.fillRect(20, canvas.height - 30, 100, 10)
        ctx.fillStyle = '#00b4d8'
        ctx.fillRect(20, canvas.height - 30, (game.freezeTime / 180) * 100, 10)
      }
      
      if (game.doubleTime > 0) {
        ctx.fillStyle = 'rgba(255, 214, 10, 0.5)'
        ctx.fillRect(20, canvas.height - 50, 100, 10)
        ctx.fillStyle = '#ffd60a'
        ctx.fillRect(20, canvas.height - 50, (game.doubleTime / 300) * 100, 10)
      }
      
      if (game.laserTime > 0) {
        ctx.fillStyle = 'rgba(255, 77, 109, 0.5)'
        ctx.fillRect(20, canvas.height - 70, 100, 10)
        ctx.fillStyle = '#ff4d6d'
        ctx.fillRect(20, canvas.height - 70, (game.laserTime / 240) * 100, 10)
      }
    }

    // Continue the game loop
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState, spawnBug, spawnPowerUp, timeLeft, score, combo])

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("won")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Click/touch handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create separate handlers for mouse and touch events
    const handleMouseClick = (e: MouseEvent) => {
      handleClick(e as unknown as React.MouseEvent<HTMLCanvasElement>)
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      handleClick(e as unknown as React.TouchEvent<HTMLCanvasElement>)
    }

    canvas.addEventListener("click", handleMouseClick)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })

    return () => {
      canvas.removeEventListener("click", handleMouseClick)
      canvas.removeEventListener("touchstart", handleTouchStart)
    }
  }, [handleClick])

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Initialize game
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [initGame, isMobile])

  // Start game loop
  useEffect(() => {
    if (gameState === "playing" && !isMobile) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop, isMobile])

  // Show mobile message if on mobile
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0a0a0c] rounded-lg border border-white/10 p-6 text-center">
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-red-400 mb-2">Not Available on Mobile</h3>
          <p className="text-gray-300 mb-4">Debug Dash is designed for desktop play. Please switch to a computer to play this game.</p>
          {onGameEnd && (
            <Button onClick={onGameEnd} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg bg-gradient-to-br from-red-900/30 to-pink-900/30"
      />
      
      {/* Game Stats - Centered at top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-fuchsia-300">{score}</div>
          <div className="text-xs text-pink-200">Score</div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-cyan-300">{timeLeft}s</div>
          <div className="text-xs text-pink-200">Time</div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-yellow-300">{combo}x</div>
          <div className="text-xs text-pink-200">Combo</div>
        </div>
      </div>
      
      {/* Power-up Status - Bottom left */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {gameRef.current.freezeTime > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-blue-600/80 px-3 py-1 text-sm text-white">
            <span className="text-xs">❄️</span> Freeze
          </div>
        )}
        {gameRef.current.doublePoints && (
          <div className="flex items-center gap-1 rounded-full bg-yellow-600/80 px-3 py-1 text-sm text-white">
            <span className="text-xs">⚡</span> 2x Points
          </div>
        )}
        {gameRef.current.laserActive && (
          <div className="flex items-center gap-1 rounded-full bg-red-600/80 px-3 py-1 text-sm text-white">
            <span className="text-xs">🔫</span> Laser
          </div>
        )}
      </div>
      
      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold">Game Over!</h2>
            <p className="text-xl">Final Score: {score}</p>
            <p className="text-pink-300">Max Combo: {maxCombo}x</p>
          </div>
          <Button
            onClick={resetGame}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </div>
      )}

      {/* Win Screen */}
      {gameState === "won" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center space-y-3 sm:space-y-4 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-emerald-400">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              All Bugs Debugged!
            </div>
            <p className="text-sm sm:text-base text-zinc-300">
              Final Score: {score}
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              <Button onClick={scrollToProjects} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-xs sm:text-sm">
                View Projects
              </Button>
              <Button onClick={initGame} variant="outline" className="border-white/20 bg-white/5 text-xs sm:text-sm">
                <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Play Again
              </Button>
              {onGameEnd && (
                <Button onClick={onGameEnd} variant="outline" className="border-white/20 bg-white/5 text-xs sm:text-sm">
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Choose Game
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
