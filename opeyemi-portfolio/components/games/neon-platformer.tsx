"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, ArrowLeft, Flag, ArrowLeft as LeftArrow, ArrowRight as RightArrow, ArrowUp as UpArrow } from "lucide-react"

type GameState = "playing" | "won" | "lost"
type Platform = {
  x: number
  y: number
  width: number
  height: number
  color: string
  type: "static" | "moving" | "disappearing"
  moveSpeed?: number
  moveRange?: number
  originalX?: number
  direction?: number
  disappearTimer?: number
}

type Checkpoint = {
  x: number
  y: number
  activated: boolean
}

interface NeonPlatformerProps {
  onGameEnd?: () => void
}

export default function NeonPlatformer({ onGameEnd }: NeonPlatformerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const keysRef = useRef<Set<string>>(new Set())

  const [gameState, setGameState] = useState<GameState>("playing")
  const [timeLeft, setTimeLeft] = useState(60)
  const [deaths, setDeaths] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Game state
  const gameRef = useRef({
    player: {
      x: 50,
      y: 200,
      width: 16,
      height: 16,
      vx: 0,
      vy: 0,
      speed: 5,
      jumpPower: 14,
      onGround: false,
      coyoteTime: 0,
      jumpBuffer: 0,
    },
    platforms: [] as Platform[],
    checkpoints: [] as Checkpoint[],
    currentCheckpoint: 0,
    goal: { x: 0, y: 0, width: 32, height: 32, reached: false },
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    gravity: 0.7,
    friction: 0.85,
    cameraX: 0,
  })

  const initGame = useCallback(() => {
    const canvas = canvasRef.current!
    const game = gameRef.current

    // Reset player
    game.player = {
      x: 30,
      y: canvas.height - 100,
      width: 16,
      height: 16,
      vx: 0,
      vy: 0,
      speed: 5,
      jumpPower: 14,
      onGround: false,
      coyoteTime: 0,
      jumpBuffer: 0,
    }

    // Create enhanced platform layout
    game.platforms = [
      // Starting area
      { x: 0, y: canvas.height - 20, width: 150, height: 20, color: "#22d3ee", type: "static" },

      // First section - basic jumps
      { x: 200, y: canvas.height - 20, width: 100, height: 20, color: "#22d3ee", type: "static" },
      { x: 350, y: canvas.height - 60, width: 80, height: 12, color: "#e879f9", type: "static" },

      // Moving platforms section
      {
        x: 480,
        y: canvas.height - 100,
        width: 60,
        height: 12,
        color: "#fbbf24",
        type: "moving",
        moveSpeed: 1,
        moveRange: 80,
        originalX: 480,
        direction: 1,
      },
      {
        x: 600,
        y: canvas.height - 140,
        width: 60,
        height: 12,
        color: "#fbbf24",
        type: "moving",
        moveSpeed: 1.5,
        moveRange: 100,
        originalX: 600,
        direction: -1,
      },

      // Disappearing platforms
      {
        x: 750,
        y: canvas.height - 120,
        width: 50,
        height: 12,
        color: "#ef4444",
        type: "disappearing",
        disappearTimer: 900, // 15 seconds at 60fps (900 frames)
      },
      {
        x: 850,
        y: canvas.height - 160,
        width: 50,
        height: 12,
        color: "#ef4444",
        type: "disappearing",
        disappearTimer: 900, // 15 seconds at 60fps (900 frames)
      },

      // Upper level platforms
      { x: 950, y: canvas.height - 200, width: 80, height: 12, color: "#e879f9", type: "static" },
      {
        x: 1100,
        y: canvas.height - 240,
        width: 60,
        height: 12,
        color: "#fbbf24",
        type: "moving",
        moveSpeed: 2,
        moveRange: 60,
        originalX: 1100,
        direction: 1,
      },

      // Final challenge
      {
        x: 1250,
        y: canvas.height - 180,
        width: 40,
        height: 12,
        color: "#ef4444",
        type: "disappearing",
        disappearTimer: 900, // 15 seconds at 60fps (900 frames)
      },
      {
        x: 1350,
        y: canvas.height - 220,
        width: 40,
        height: 12,
        color: "#ef4444",
        type: "disappearing",
        disappearTimer: 900, // 15 seconds at 60fps (900 frames)
      },

      // Goal platform
      { x: 1450, y: canvas.height - 280, width: 100, height: 12, color: "#22c55e", type: "static" },
    ]

    // Checkpoints
    game.checkpoints = [
      { x: 75, y: canvas.height - 60, activated: true }, // Starting checkpoint
      { x: 525, y: canvas.height - 140, activated: false },
      { x: 975, y: canvas.height - 240, activated: false },
      { x: 1475, y: canvas.height - 320, activated: false },
    ]

    // Goal portal
    game.goal = {
      x: 1500,
      y: canvas.height - 320,
      width: 32,
      height: 32,
      reached: false,
    }

    game.particles = []
    game.currentCheckpoint = 0
    game.cameraX = 0
    setGameState("playing")
    setTimeLeft(60)
    setDeaths(0)
  }, [])

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: any, cameraX: number) => {
    const screenX = player.x - cameraX

    // Player trail effect
    if (Math.abs(player.vx) > 2) {
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = `rgba(34, 211, 238, ${0.3 - i * 0.1})`
        ctx.fillRect(screenX - i * 3 * Math.sign(player.vx), player.y, player.width, player.height)
      }
    }

    // Player glow
    ctx.shadowColor = "#22d3ee"
    ctx.shadowBlur = 12
    ctx.fillStyle = "#22d3ee"
    ctx.fillRect(screenX, player.y, player.width, player.height)

    // Player details
    ctx.shadowBlur = 0
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(screenX + 4, player.y + 2, 2, 2) // left eye
    ctx.fillRect(screenX + 10, player.y + 2, 2, 2) // right eye

    // Animated mouth based on movement
    const mouthY = player.y + 8 + (player.onGround ? 0 : Math.sin(Date.now() * 0.01) * 1)
    ctx.fillRect(screenX + 6, mouthY, 4, 2)

    // Landing particles
    if (player.onGround && Math.abs(player.vx) > 1) {
      if (Math.random() < 0.3) {
        gameRef.current.particles.push({
          x: player.x + Math.random() * player.width,
          y: player.y + player.height,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2,
          life: 0.5,
          color: "#22d3ee",
        })
      }
    }
  }

  const drawPlatform = (ctx: CanvasRenderingContext2D, platform: Platform, cameraX: number) => {
    const screenX = platform.x - cameraX

    // Platform glow intensity based on type
    let glowIntensity = 8
    if (platform.type === "moving") glowIntensity = 12
    if (platform.type === "disappearing") {
      glowIntensity = platform.disappearTimer! < 300 ? 15 : 8
      // Flashing effect when about to disappear (last 5 seconds)
      if (platform.disappearTimer! < 300 && Math.floor(Date.now() / 100) % 2) {
        return // Skip drawing to create flashing effect
      }
    }

    ctx.shadowColor = platform.color
    ctx.shadowBlur = glowIntensity
    ctx.fillStyle = platform.color
    ctx.fillRect(screenX, platform.y, platform.width, platform.height)

    // Platform highlight
    ctx.shadowBlur = 0
    ctx.fillStyle = platform.color + "60"
    ctx.fillRect(screenX, platform.y, platform.width, 2)

    // Special effects for platform types
    if (platform.type === "moving") {
      // Motion lines
      ctx.fillStyle = platform.color + "40"
      for (let i = 1; i <= 3; i++) {
        ctx.fillRect(screenX - i * 5, platform.y + 2, platform.width, 2)
      }
    }
  }

  const drawCheckpoint = (ctx: CanvasRenderingContext2D, checkpoint: Checkpoint, index: number, cameraX: number) => {
    const screenX = checkpoint.x - cameraX
    const time = Date.now() * 0.005
    const pulse = Math.sin(time + index) * 0.3 + 0.7

    if (checkpoint.activated) {
      ctx.shadowColor = "#22c55e"
      ctx.shadowBlur = 15 * pulse
      ctx.fillStyle = "#22c55e"
    } else {
      ctx.shadowColor = "#6b7280"
      ctx.shadowBlur = 5
      ctx.fillStyle = "#6b7280"
    }

    // Flag pole
    ctx.fillRect(screenX, checkpoint.y, 3, 40)

    // Flag
    ctx.beginPath()
    ctx.moveTo(screenX + 3, checkpoint.y)
    ctx.lineTo(screenX + 20, checkpoint.y + 5)
    ctx.lineTo(screenX + 20, checkpoint.y + 15)
    ctx.lineTo(screenX + 3, checkpoint.y + 20)
    ctx.closePath()
    ctx.fill()

    ctx.shadowBlur = 0
  }

  const drawGoal = (ctx: CanvasRenderingContext2D, goal: any, cameraX: number) => {
    const screenX = goal.x - cameraX
    const time = Date.now() * 0.008
    const pulse = Math.sin(time) * 0.4 + 0.8

    // Goal portal effect with enhanced animation
    ctx.shadowColor = "#22c55e"
    ctx.shadowBlur = 20 * pulse

    // Outer rings
    for (let i = 3; i >= 1; i--) {
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.8 - i * 0.2})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(screenX + goal.width / 2, goal.y + goal.height / 2, (goal.width / 2) * i * pulse, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Center portal
    ctx.shadowBlur = 0
    ctx.fillStyle = "#22c55e"
    ctx.beginPath()
    ctx.arc(screenX + goal.width / 2, goal.y + goal.height / 2, 6 * pulse, 0, Math.PI * 2)
    ctx.fill()

    // Swirling particles
    for (let i = 0; i < 8; i++) {
      const angle = time * 2 + (i * Math.PI) / 4
      const radius = 15 + Math.sin(time * 3 + i) * 5
      const px = screenX + goal.width / 2 + Math.cos(angle) * radius
      const py = goal.y + goal.height / 2 + Math.sin(angle) * radius

      ctx.fillStyle = `rgba(34, 197, 94, ${0.8 - (i % 3) * 0.2})`
      ctx.fillRect(px - 1, py - 1, 2, 2)
    }
  }

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number) => {
    // Enhanced parallax background
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, "#1a0f2e")
    grad.addColorStop(0.3, "#0f0b1a")
    grad.addColorStop(0.7, "#0a1820")
    grad.addColorStop(1, "#051015")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Parallax grid layers
    const layers = [
      { speed: 0.1, opacity: 0.03, size: 100 },
      { speed: 0.3, opacity: 0.05, size: 50 },
      { speed: 0.5, opacity: 0.08, size: 25 },
    ]

    layers.forEach((layer) => {
      ctx.strokeStyle = `rgba(217, 70, 239, ${layer.opacity})`
      ctx.lineWidth = 1
      const offset = (cameraX * layer.speed) % layer.size

      for (let i = -offset; i < width + layer.size; i += layer.size) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      for (let i = 0; i < height + layer.size; i += layer.size) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }
    })

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
      ctx.fillRect(p.x - cameraX, p.y, 3, 3)
    })

    // Add ambient particles
    if (Math.random() < 0.1) {
      game.particles.push({
        x: cameraX + width + 10,
        y: Math.random() * height,
        vx: -Math.random() * 2 - 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        color: ["#e879f9", "#22d3ee", "#fbbf24"][Math.floor(Math.random() * 3)],
      })
    }
  }

  const respawnPlayer = useCallback(() => {
    const game = gameRef.current
    const checkpoint = game.checkpoints[game.currentCheckpoint]

    game.player.x = checkpoint.x
    game.player.y = checkpoint.y - 20
    game.player.vx = 0
    game.player.vy = 0
    setDeaths((prev) => prev + 1)

    // Death particles
    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: game.player.x + game.player.width / 2,
        y: game.player.y + game.player.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: "#ef4444",
      })
    }
  }, [])

  const checkCollisions = useCallback(() => {
    const game = gameRef.current
    const player = game.player

    // Platform collisions with enhanced physics
    player.onGround = false
    for (const platform of game.platforms) {
      if (platform.type === "disappearing" && platform.disappearTimer! <= 0) continue

      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y
      ) {
        // Landing on top
        if (player.vy > 0 && player.y < platform.y) {
          player.y = platform.y - player.height
          player.vy = 0
          player.onGround = true
          player.coyoteTime = 6 // Coyote time frames

          // Landing particles
          for (let i = 0; i < 5; i++) {
            game.particles.push({
              x: player.x + Math.random() * player.width,
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3,
              life: 0.5,
              color: platform.color,
            })
          }
        }
        // Hitting from below
        else if (player.vy < 0 && player.y > platform.y) {
          player.y = platform.y + platform.height
          player.vy = 0
        }
        // Side collisions
        else if (player.vx > 0 && player.x < platform.x) {
          player.x = platform.x - player.width
          player.vx = 0
        } else if (player.vx < 0 && player.x > platform.x) {
          player.x = platform.x + platform.width
          player.vx = 0
        }
      }
    }

    // Checkpoint collisions
    game.checkpoints.forEach((checkpoint, index) => {
      if (
        !checkpoint.activated &&
        player.x < checkpoint.x + 20 &&
        player.x + player.width > checkpoint.x &&
        player.y < checkpoint.y + 40 &&
        player.y + player.height > checkpoint.y
      ) {
        checkpoint.activated = true
        game.currentCheckpoint = index

        // Checkpoint particles
        for (let i = 0; i < 10; i++) {
          game.particles.push({
            x: checkpoint.x + 10,
            y: checkpoint.y + 20,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color: "#22c55e",
          })
        }
      }
    })

    // Goal collision
    if (
      player.x < game.goal.x + game.goal.width &&
      player.x + player.width > game.goal.x &&
      player.y < game.goal.y + game.goal.height &&
      player.y + player.height > game.goal.y
    ) {
      if (!game.goal.reached) {
        game.goal.reached = true
        setGameState("won")

        // Victory particles
        for (let i = 0; i < 25; i++) {
          game.particles.push({
            x: game.goal.x + game.goal.width / 2,
            y: game.goal.y + game.goal.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.5,
            color: "#22c55e",
          })
        }
      }
    }
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const game = gameRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Handle input (WASD only)
    const keys = keysRef.current
    const player = game.player

    // Horizontal movement
    if (keys.has("KeyA") || keys.has("a")) {
      player.vx = -player.speed
    } else if (keys.has("KeyD") || keys.has("d")) {
      player.vx = player.speed
    } else {
      player.vx *= game.friction
    }

    // Jumping with buffer and coyote time
    if (keys.has("KeyW") || keys.has("w") || keys.has(" ")) {
      if (!keys.has("jumpPressed")) {
        keys.add("jumpPressed")
        player.jumpBuffer = 6 // Jump buffer frames
      }
    } else {
      keys.delete("jumpPressed")
    }

    if (player.jumpBuffer > 0 && (player.onGround || player.coyoteTime > 0)) {
      player.vy = -player.jumpPower
      player.onGround = false
      player.coyoteTime = 0
      player.jumpBuffer = 0

      // Jump particles
      for (let i = 0; i < 5; i++) {
        game.particles.push({
          x: player.x + Math.random() * player.width,
          y: player.y + player.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2,
          life: 0.5,
          color: "#22d3ee",
        })
      }
    }

    // Update timers
    if (player.jumpBuffer > 0) player.jumpBuffer--
    if (player.coyoteTime > 0) player.coyoteTime--

    // Apply gravity
    player.vy += game.gravity

    // Update position
    player.x += player.vx
    player.y += player.vy

    // Update camera to follow player
    const targetCameraX = player.x - canvas.width / 3
    game.cameraX += (targetCameraX - game.cameraX) * 0.1

    // Update platforms
    game.platforms.forEach((platform) => {
      if (platform.type === "moving") {
        platform.x += platform.moveSpeed! * platform.direction!
        if (platform.x <= platform.originalX! || platform.x >= platform.originalX! + platform.moveRange!) {
          platform.direction! *= -1
        }
      } else if (platform.type === "disappearing") {
        if (platform.disappearTimer! > 0) {
          platform.disappearTimer!--
        }
      }
    })

    // Check for falling off the world
    if (player.y > canvas.height + 50) {
      respawnPlayer()
    }

    // Check collisions
    checkCollisions()

    // Draw everything
    drawBackground(ctx, canvas.width, canvas.height, game.cameraX)
    game.platforms.forEach((platform) => drawPlatform(ctx, platform, game.cameraX))
    game.checkpoints.forEach((checkpoint, index) => drawCheckpoint(ctx, checkpoint, index, game.cameraX))
    drawGoal(ctx, game.goal, game.cameraX)
    drawPlayer(ctx, player, game.cameraX)

    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState, checkCollisions, respawnPlayer])

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

  // Analog joystick state
  const [joystick, setJoystick] = useState({
    active: false,
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
    touchId: null as number | null
  })
  const [jumpPressed, setJumpPressed] = useState(false)

  // Handle mobile touch controls with analog joystick
  const handleTouchStart = (e: React.TouchEvent, isJoystick: boolean) => {
    if (isMobile) {
      const touch = e.touches[0]
      if (isJoystick) {
        // Joystick touch
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setJoystick({
          active: true,
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
          moveX: touch.clientX,
          moveY: touch.clientY,
          touchId: touch.identifier
        })
      } else {
        // Jump button touch
        setJumpPressed(true)
        keysRef.current.add('KeyW')
        keysRef.current.add('w')
        keysRef.current.add('jumpPressed')
        const player = gameRef.current.player
        if (player.onGround || player.coyoteTime > 0) {
          player.jumpBuffer = 6
        }
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (joystick.active && joystick.touchId !== null) {
      const touch = Array.from(e.touches).find(t => t.identifier === joystick.touchId)
      if (touch) {
        const moveX = touch.clientX - joystick.startX
        const moveY = touch.clientY - joystick.startY
        
        // Update joystick position
        setJoystick(prev => ({ ...prev, moveX: touch.clientX, moveY: touch.clientY }))
        
        // Update movement based on joystick position
        const deadZone = 10
        const maxDistance = 50
        const distance = Math.min(Math.sqrt(moveX * moveX + moveY * moveY), maxDistance)
        
        if (distance > deadZone) {
          // Calculate direction
          const angle = Math.atan2(moveY, moveX)
          const moveLeft = Math.cos(angle) < -0.3
          const moveRight = Math.cos(angle) > 0.3
          
          // Update movement keys
          if (moveLeft) {
            keysRef.current.add('KeyA')
            keysRef.current.add('a')
            keysRef.current.delete('KeyD')
            keysRef.current.delete('d')
          } else if (moveRight) {
            keysRef.current.add('KeyD')
            keysRef.current.add('d')
            keysRef.current.delete('KeyA')
            keysRef.current.delete('a')
          } else {
            keysRef.current.delete('KeyA')
            keysRef.current.delete('a')
            keysRef.current.delete('KeyD')
            keysRef.current.delete('d')
          }
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, isJoystick: boolean) => {
    if (isMobile) {
      if (isJoystick) {
        // Reset joystick
        setJoystick({
          active: false,
          startX: 0,
          startY: 0,
          moveX: 0,
          moveY: 0,
          touchId: null
        })
        // Clear movement keys
        keysRef.current.delete('KeyA')
        keysRef.current.delete('a')
        keysRef.current.delete('KeyD')
        keysRef.current.delete('d')
      } else {
        // Handle jump button release
        setJumpPressed(false)
        keysRef.current.delete('KeyW')
        keysRef.current.delete('w')
        keysRef.current.delete('jumpPressed')
      }
    }
  }

  // Keyboard controls (WASD only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      keysRef.current.add(e.key.toLowerCase())
      if (e.key === " ") e.preventDefault() // Prevent page scroll
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
    const canvas = canvasRef.current!
    canvas.width = Math.max(canvas.offsetWidth, 500)
    canvas.height = canvas.offsetHeight
    initGame()
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
  }, [gameState, gameLoop])

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg border border-white/10 bg-[#0a0a0c] touch-none"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Game Stats - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-fuchsia-300">{timeLeft}s</div>
          <div className="text-xs text-pink-200">Time Left</div>
        </div>
        <div className="rounded-lg bg-black/60 px-4 py-2 text-center">
          <div className="text-xl font-bold text-red-300">{deaths}</div>
          <div className="text-xs text-pink-200">Deaths</div>
        </div>
      </div>

      {/* Checkpoint Indicator - Top right */}
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2">
        <Flag className="h-4 w-4 text-cyan-300" />
        <span className="text-sm text-white">Checkpoint: {gameRef.current.currentCheckpoint + 1}/4</span>
      </div>

      {/* Mobile Controls - Only visible on mobile devices */}
      {isMobile && gameState === "playing" && (
        <div className="fixed inset-0 z-10 pointer-events-none">
          {/* Analog Joystick */}
          <div 
            className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-black/20 backdrop-blur-sm border-2 border-gray-600/50 pointer-events-auto"
            onTouchStart={(e) => handleTouchStart(e, true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, true)}
            onTouchCancel={(e) => handleTouchEnd(e, true)}
          >
            {joystick.active && (
              <div 
                className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
                style={{
                  left: `${Math.min(Math.max(joystick.moveX - joystick.startX, -50), 50) + 50}%`,
                  top: `${Math.min(Math.max(joystick.moveY - joystick.startY, -50), 50) + 50}%`,
                }}
              />
            )}
          </div>

          {/* Jump Button */}
          <button
            onTouchStart={(e) => handleTouchStart(e, false)}
            onTouchEnd={(e) => handleTouchEnd(e, false)}
            onTouchCancel={(e) => handleTouchEnd(e, false)}
            className={`absolute bottom-8 right-8 w-24 h-24 rounded-full flex items-center justify-center pointer-events-auto transition-transform duration-100 ${jumpPressed ? 'scale-95' : 'scale-100'}`}
            aria-label="Jump"
          >
            <div className="w-full h-full rounded-full bg-cyan-600/80 backdrop-blur-md border-2 border-cyan-400 flex items-center justify-center">
              <UpArrow className="w-12 h-12 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Win Screen */}
      {gameState === "won" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center space-y-3 sm:space-y-4 max-w-sm">
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-emerald-400">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              Portal Reached!
            </div>
            <p className="text-sm sm:text-base text-zinc-300">
              Time: {60 - timeLeft}s • Deaths: {deaths}
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
              <Button onClick={scrollToProjects} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-xs sm:text-sm">
                View Projects
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
              Deaths: {deaths} • Checkpoint: {gameRef.current.currentCheckpoint + 1}/4
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
