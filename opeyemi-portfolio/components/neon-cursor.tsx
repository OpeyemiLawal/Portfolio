"use client"

import { useEffect, useRef } from "react"
import { useSiteSettings } from "./site-settings-context"

export function NeonCursor() {
  const { cursorEnabled } = useSiteSettings()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cursorEnabled) {
      if (ref.current) ref.current.style.opacity = "0"
      document.documentElement.classList.remove("cursor-none")
      return
    }
    document.documentElement.classList.add("cursor-none")
    const el = ref.current!
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y

    function onMove(e: MouseEvent) {
      tx = e.clientX
      ty = e.clientY
    }
    const speed = 0.18
    let raf = 0
    const loop = () => {
      x += (tx - x) * speed
      y += (ty - y) * speed
      el.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener("mousemove", onMove)
    raf = requestAnimationFrame(loop)
    el.style.opacity = "1"
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
    }
  }, [cursorEnabled])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-6 w-6 rounded-full opacity-0"
      style={{
        boxShadow: "0 0 15px 4px rgba(217, 70, 239, 0.6), 0 0 40px 10px rgba(34, 211, 238, 0.35)",
        background:
          "radial-gradient(circle at 30% 30%, rgba(217,70,239,0.9), rgba(34,211,238,0.6) 60%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  )
}
