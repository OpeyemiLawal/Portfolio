"use client"

import { caseStudies } from "@/data/case-studies"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function CaseStudies() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Case Studies</h2>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Selected deep dives with visuals, timeline, and measurable outcomes.
        </p>
      </div>
      <div className="space-y-8">
        {caseStudies.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.05 * i, duration: 0.6 }}
            className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-5"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 md:col-span-2">
              <Image src={c.cover || "/placeholder.svg"} alt={c.title} fill className="object-cover" />
            </div>
            <div className="md:col-span-3">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-zinc-300">{c.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.stack.map((s) => (
                  <Badge key={s} className="bg-white/10">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-zinc-200">Timeline</h4>
                <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                  {c.timeline.map((t, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-fuchsia-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-zinc-200">Outcomes</h4>
                <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-300 sm:grid-cols-3">
                  {c.outcomes.map((o, idx) => (
                    <li key={idx} className="rounded-md border border-white/10 bg-black/30 p-2">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
