"use client"

import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowDownRight } from "lucide-react"

const GameSelector = dynamic(() => import("./games/game-selector"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-xl bg-gradient-to-br from-fuchsia-700/30 to-cyan-600/20 flex items-center justify-center">
      <div className="text-fuchsia-300 animate-pulse">Loading games...</div>
    </div>
  ),
})

export function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, -40])
  const glow = useTransform(scrollY, [0, 400], [1, 0.6])

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.12),transparent_60%)]"
        aria-hidden
      />
      <div className="container mx-auto grid min-h-[70vh] grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-2 relative z-10">
        <motion.div style={{ y }} className="space-y-6">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
              Opeyemi Lawal
            </span>
          </motion.h1>
          <motion.p
            className="text-lg text-zinc-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {"Game Developer • Creative Coder • Software Engineer (AI-accelerated workflows)"}
          </motion.p>
          <motion.p
            className="max-w-xl text-zinc-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {
              "With 5+ years of experience in game development, software engineering, and design, I help clients turn ideas into polished games, software, and tools. I combine beautiful design, engaging interactions, and robust engineering to create exceptional digital experiences. I leverage AI to accelerate prototyping, create assets, and automate workflows, delivering production-ready results faster."
            }
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button 
              asChild
              className="group bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_30px] shadow-fuchsia-600/40"
            >
              <a href="https://www.upwork.com/freelancers/~010cb1dc112cd4f0fb?mp_source=share" target="_blank" rel="noopener noreferrer">
                <Sparkles className="mr-2 h-4 w-4" />
                Hire on Upwork
                <ArrowDownRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="border-fuchsia-500/30 bg-white/5 hover:bg-white/10 relative z-20"
              onClick={scrollToProjects}
            >
              View Projects
            </Button>
          </motion.div>
          <motion.div 
            style={{ opacity: glow }}
            className="pointer-events-none absolute left-0 top-0 h-12 w-12 rounded-full bg-fuchsia-500/20 blur-2xl -z-10"
          />
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-fuchsia-500/10 to-cyan-500/10 p-2 shadow-[0_0_80px] shadow-fuchsia-600/10">
            <GameSelector />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-xs text-zinc-300/80">
              <span>Interactive mini-games</span>
              <span className="rounded-full bg-white/5 px-2 py-1">choose your challenge</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
