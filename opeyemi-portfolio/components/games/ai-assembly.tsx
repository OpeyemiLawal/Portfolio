"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, ArrowLeft } from "lucide-react"

type GameState = "playing" | "won"
type Tool = {
  id: string
  name: string
  x: number
  y: number
  homeX: number
  homeY: number
  color: string
  placed: boolean
  dragging: boolean
}

type Slot = {
  id: string
  x: number
  y: number
  width: number
  height: number
  toolId: string | null
  label: string
}

const TOOLS = [
  { id: "ai", name: "AI", color: "#e879f9" },
  { id: "code", name: "Code", color: "#22d3ee" },
  { id: "design", name: "Design", color: "#f97316" },
  { id: "data", name: "Data", color: "#22c55e" },
  { id: "deploy", name: "Deploy", color: "#ef4444" },
]

const SLOTS = [
  { id: "slot1", label: "Ideation", correctTool: "ai" },
  { id: "slot2", label: "Development", correctTool: "code" },
  { id: "slot3", label: "UI/UX", correctTool: "design" },
  { id: "slot4", label: "Analysis", correctTool: "data" },
  { id: "slot5", label: "Production", correctTool: "deploy" },
]

interface AIAssemblyProps {
  onGameEnd?: () => void
}

export default function AIAssembly({ onGameEnd }: AIAssemblyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const dragRef = useRef<{ tool: Tool | null; offsetX: number; offsetY: number }>({
    tool: null,
    offsetX: 0,
    offsetY: 0,
  })

  const [gameState, setGameState] = useState<GameState>("playing")
  const [placedCount, setPlacedCount] = useState(0)

  const gameRef = useRef({
    tools: [] as Tool[],
    slots: [] as Slot[],
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
  })

  const initGame = useCallback(() => {
    const canvas = canvasRef.current!
    const game = gameRef.current

    // Initialize tools in a row at the bottom
    game.tools = TOOLS.map((tool, i) => ({
      ...tool,
      x: 50 + i * 80,
      y: canvas.height - 60,
      homeX: 50 + i * 80,
      homeY: canvas.height - 60,
      placed: false,
      dragging: false,
    }))

    // Initialize slots in a row at the top
    game.slots = SLOTS.map((slot, i) => ({
      id: slot.id,
      x: 40 + i * 80,
      y: 40,
      width: 60,
      height: 60,
      toolId: null,
      label: slot.label,
    }))

    game.particles = []
    setGameState("playing")
    setPlacedCount(0)
    dragRef.current = { tool: null, offsetX: 0, offsetY: 0 }
  }, [])

  const drawTool = (ctx: CanvasRenderingContext2D, tool: Tool) => {
    const size = 30
    const x = tool.x - size / 2
    const y = tool.y - size / 2

    // Glow effect
    if (!tool.placed) {
      ctx.shadowColor = tool.color
      ctx.shadowBlur = tool.dragging ? 20 : 10
    }

    // Tool background
    ctx.fillStyle = tool.color + (tool.placed ? "60" : "CC")
    ctx.fillRect(x, y, size, size)

    // Tool icon based on type
    ctx.shadowBlur = 0
    ctx.fillStyle = tool.placed ? "#666" : "#fff"
    ctx.font = "12px monospace"
    ctx.textAlign = "center"
    ctx.fillText(tool.name, tool.x, tool.y + 4)

    // Draw specific icons
    ctx.fillStyle = tool.placed ? "#666" : "#fff"
    switch (tool.id) {
      case "ai":
        // Brain icon
        ctx.fillRect(tool.x - 8, tool.y - 12, 16, 8)
        ctx.fillRect(tool.x - 6, tool.y - 8, 12, 4)
        break
      case "code":
        // Brackets
        ctx.fillRect(tool.x - 10, tool.y - 8, 2, 16)
        ctx.fillRect(tool.x + 8, tool.y - 8, 2, 16)
        ctx.fillRect(tool.x - 10, tool.y - 8, 4, 2)
        ctx.fillRect(tool.x - 10, tool.y + 6, 4, 2)
        ctx.fillRect(tool.x + 6, tool.y - 8, 4, 2)
        ctx.fillRect(tool.x + 6, tool.y + 6, 4, 2)
        break
      case "design":
        // Palette
        ctx.beginPath()
        ctx.arc(tool.x, tool.y - 4, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = tool.color
        ctx.fillRect(tool.x - 2, tool.y - 6, 4, 4)
        break
      case "data":
        // Chart bars
        ctx.fillRect(tool.x - 8, tool.y - 4, 3, 8)
        ctx.fillRect(tool.x - 3, tool.y - 8, 3, 12)
        ctx.fillRect(tool.x + 2, tool.y - 6, 3, 10)
        ctx.fillRect(tool.x + 7, tool.y - 2, 3, 6)
        break
      case "deploy":
        // Rocket
        ctx.fillRect(tool.x - 2, tool.y - 10, 4, 12)
        ctx.fillRect(tool.x - 4, tool.y - 6, 2, 4)
        ctx.fillRect(tool.x + 2, tool.y - 6, 2, 4)
        ctx.fillRect(tool.x - 1, tool.y - 12, 2, 2)
        break
    }
  }

  const drawSlot = (ctx: CanvasRenderingContext2D, slot: Slot) => {
    // Slot background
    ctx.strokeStyle = slot.toolId ? "#22c55e" : "#666"
    ctx.lineWidth = 2
    ctx.strokeRect(slot.x, slot.y, slot.width, slot.height)

    if (!slot.toolId) {
      ctx.fillStyle = "#333"
      ctx.fillRect(slot.x + 2, slot.y + 2, slot.width - 4, slot.height - 4)
    }

    // Label
    ctx.fillStyle = "#ccc"
    ctx.font = "10px monospace"
    ctx.textAlign = "center"
    ctx.fillText(slot.label, slot.x + slot.width / 2, slot.y + slot.height + 15)
  }

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, "#0f0b1a")
    grad.addColorStop(1, "#0a1820")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Circuit lines
    ctx.strokeStyle = "rgba(34, 211, 238, 0.1)"
    ctx.lineWidth = 1

    // Horizontal lines connecting slots
    for (let i = 0; i < 4; i++) {
      const y = 70 + i * 30
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Particles
    const game = gameRef.current
    game.particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      if (p.life <= 0) {
        game.particles.splice(i, 1)
        return
      }
      ctx.fillStyle =
        p.color +
        Math.floor(p.life * 255)
          .toString(16)
          .padStart(2, "0")
      ctx.fillRect(p.x, p.y, 2, 2)
    })
  }

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (gameState !== "playing") return

      const pos = getMousePos(e)
      const game = gameRef.current

      // Check if clicking on a tool
      for (const tool of game.tools) {
        if (!tool.placed) {
          const dx = pos.x - tool.x
          const dy = pos.y - tool.y
          if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
            tool.dragging = true
            dragRef.current = {
              tool,
              offsetX: dx,
              offsetY: dy,
            }
            break
          }
        }
      }
    },
    [gameState],
  )

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const drag = dragRef.current
      if (!drag.tool || gameState !== "playing") return

      const pos = getMousePos(e)
      drag.tool.x = pos.x - drag.offsetX
      drag.tool.y = pos.y - drag.offsetY
    },
    [gameState],
  )

  const handleEnd = useCallback(() => {
    const drag = dragRef.current
    if (!drag.tool || gameState !== "playing") return

    const game = gameRef.current
    const tool = drag.tool
    tool.dragging = false

    // Check if dropped on a slot
    let dropped = false
    for (const slot of game.slots) {
      if (
        tool.x > slot.x &&
        tool.x < slot.x + slot.width &&
        tool.y > slot.y &&
        tool.y < slot.y + slot.height &&
        !slot.toolId
      ) {
        // Check if it's the correct tool for this slot
        const correctTool = SLOTS.find((s) => s.id === slot.id)?.correctTool
        if (correctTool === tool.id) {
          // Correct placement
          slot.toolId = tool.id
          tool.x = slot.x + slot.width / 2
          tool.y = slot.y + slot.height / 2
          tool.placed = true
          dropped = true
          setPlacedCount((prev) => prev + 1)

          // Add success particles
          for (let i = 0; i < 10; i++) {
            game.particles.push({
              x: tool.x,
              y: tool.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1,
              color: tool.color,
            })
          }
        }
        break
      }
    }

    // If not dropped correctly, return to home position
    if (!dropped) {
      tool.x = tool.homeX
      tool.y = tool.homeY
    }

    dragRef.current = { tool: null, offsetX: 0, offsetY: 0 }
  }, [gameState])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    const game = gameRef.current

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    drawBackground(ctx, canvas.width, canvas.height)

    // Draw slots
    game.slots.forEach((slot) => drawSlot(ctx, slot))

    // Draw tools
    game.tools.forEach((tool) => drawTool(ctx, tool))

    // Continue loop if playing
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState])

  // Check win condition
  useEffect(() => {
    if (placedCount >= 5 && gameState === "playing") {
      setGameState("won")
    }
  }, [placedCount, gameState])

  // Mouse/touch handlers
  useEffect(() => {
    const canvas = canvasRef.current!

    const handleMouseDown = (e: MouseEvent) => handleStart(e)
    const handleMouseMove = (e: MouseEvent) => handleMove(e)
    const handleMouseUp = () => handleEnd()

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      handleStart(e)
    }
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleMove(e)
    }
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      handleEnd()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleStart, handleMove, handleEnd])

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
    <div className="relative h-[320px] w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-lg border border-white/10 bg-[#0a0a0c] cursor-grab"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Game UI Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-4 text-sm">
        <div className="rounded-full bg-black/60 px-3 py-1 text-cyan-300">Placed: {placedCount}/5</div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 right-3 text-xs text-zinc-400">Drag tools to correct slots</div>

      {/* Win Screen */}
      {gameState === "won" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-emerald-400">
              <Trophy className="h-6 w-6" />
              Project Assembled!
            </div>
            <p className="text-zinc-300">All tools perfectly matched!</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={scrollToProjects} className="bg-fuchsia-600 hover:bg-fuchsia-500">
                View Projects
              </Button>
              <Button onClick={initGame} variant="outline" className="border-white/20 bg-white/5">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
              <Button onClick={onGameEnd} variant="outline" className="border-white/20 bg-white/5">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Choose Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
