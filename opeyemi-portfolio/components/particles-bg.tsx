"use client"

import { useEffect, useRef } from "react"

export function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * DPR
    canvas.height = h * DPR
    ctx.scale(DPR, DPR)

    const particles = Array.from({ length: 70 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.4,
    }))

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        grd.addColorStop(0, "rgba(217,70,239,0.8)")
        grd.addColorStop(1, "rgba(34,211,238,0.0)")
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fill()
      }
      requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      ctx.scale(DPR, DPR)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden />
}
