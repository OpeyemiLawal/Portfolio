"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type SiteSettings = {
  cursorEnabled: boolean
  setCursorEnabled: (v: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (v: boolean) => void
  playClick: () => void
  playHover: () => void
}

const Ctx = createContext<SiteSettings | null>(null)

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Lightweight WebAudio beeps to avoid bundling audio files.
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)
  useEffect(() => {
    if (!soundEnabled) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioCtx(ctx)
    return () => {
      ctx.close()
    }
  }, [soundEnabled])

  function beep(freq: number, duration = 0.06, gain = 0.04) {
    if (!soundEnabled || !audioCtx) return
    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now)
    g.gain.setValueAtTime(gain, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(g)
    g.connect(audioCtx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  const value = useMemo(
    () => ({
      cursorEnabled,
      setCursorEnabled,
      soundEnabled,
      setSoundEnabled,
      playClick: () => beep(420),
      playHover: () => beep(880, 0.04, 0.03),
    }),
    [cursorEnabled, soundEnabled, audioCtx],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider")
  return ctx
}
