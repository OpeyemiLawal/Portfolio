"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Menu, MousePointer2 } from "lucide-react"
import Link from "next/link"
import { useSiteSettings } from "./site-settings-context"

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#workflow", label: "AI Workflow" },
  { href: "#skills-zone", label: "Skills" },
  { href: "#playground", label: "AI Playground" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { cursorEnabled, setCursorEnabled } = useSiteSettings()

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session').then(async (r) => {
      if (!r.ok) return
      const data = await r.json().catch(() => ({}))
      if (!cancelled) setIsAdmin(Boolean(data?.authenticated))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0c]/70 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0c]/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="#" className="group inline-flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-fuchsia-500 shadow-[0_0_18px] shadow-fuchsia-500/80 transition-all group-hover:scale-110" />
          <span className="text-sm font-medium tracking-widest text-zinc-300 group-hover:text-white">
            OPEYEMI LAWAL
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-300 hover:text-white transition-colors data-[cursor-target=true]:cursor-none"
            >
              {l.label}
            </a>
          ))}
          <div className="mx-2 h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4 text-zinc-400" />
              <Switch checked={cursorEnabled} onCheckedChange={setCursorEnabled} aria-label="Toggle cursor effects" />
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" className="border-cyan-400/30 bg-white/5 hover:bg-white/10 text-cyan-300">
                  View Dashboard
                </Button>
              </Link>
            )}
            <a href="https://www.upwork.com/freelancers/opeyemi" target="_blank" rel="noopener noreferrer">
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_30px] shadow-fuchsia-600/40">
                Hire on Upwork
              </Button>
            </a>
          </div>
        </nav>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0a0c] border-l border-white/10">
              <div className="mt-10 flex flex-col gap-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-zinc-200 hover:text-white text-base"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="my-4 h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Cursor FX</Label>
                  <Switch checked={cursorEnabled} onCheckedChange={setCursorEnabled} />
                </div>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="mb-2 w-full border-cyan-400/30 bg-white/5 hover:bg-white/10 text-cyan-300">
                      View Dashboard
                    </Button>
                  </Link>
                )}
                <a
                  href="https://www.upwork.com/freelancers/opeyemi"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500">Hire on Upwork</Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
