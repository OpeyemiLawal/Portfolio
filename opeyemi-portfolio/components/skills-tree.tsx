"use client"

import { skills } from "@/data/skills"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Info } from "lucide-react"

export function SkillsTree() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Batched Skills — RPG Skill Tree</h2>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Hover to see mastery and a real example of how I{"'"}ve used each tool.
        </p>
      </div>
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {skills.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.05 * i, duration: 0.5 }}
            className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/10 p-5"
          >
            <div className="mb-3 text-sm uppercase tracking-wide text-zinc-300">{cat.category}</div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((s) => (
                <div key={s.name} className="group relative rounded-lg border border-white/10 bg-black/30 px-2 py-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/10">{s.name}</Badge>
                    <span className="text-[10px] text-zinc-400">Lv.{s.level}</span>
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-64 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a0a0c] p-3 text-xs text-zinc-300 shadow-lg group-hover:block">
                    <div className="mb-1 flex items-center gap-2 text-zinc-200">
                      <Info className="h-3.5 w-3.5" />
                      <span>Usage</span>
                    </div>
                    <p>{s.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_60%)]" />
      </div>
    </div>
  )
}
