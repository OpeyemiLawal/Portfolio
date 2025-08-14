"use client"

import { useEffect, useMemo, useState } from "react"
import { testimonials as baseTestimonials } from "@/data/testimonials"
import { supabaseBrowser } from "@/lib/supabase/client"
import { Trophy, Star } from "lucide-react"
import { motion } from "framer-motion"

export function Testimonials() {
  type AdminTestimonial = {
    quote: string
    author: string
    role?: string
    badge?: string
    rating?: number
  }

  const [dbTestimonials, setDbTestimonials] = useState<AdminTestimonial[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from("testimonials")
          .select("id, quote, author, role, badge, rating")
          .order("created_at", { ascending: false })
        if (error) throw error
        const mapped = (data || []).map((row: any) => ({
          quote: row.quote,
          author: row.author,
          role: row.role || "",
          badge: row.badge || "",
          rating: row.rating || 5,
        })) as AdminTestimonial[]
        if (mounted) setDbTestimonials(mapped)
      } catch {
        if (mounted) setDbTestimonials([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const testimonials = useMemo(() => {
    return [...dbTestimonials, ...baseTestimonials]
  }, [dbTestimonials])
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="font-mono text-4xl font-bold lg:text-5xl">
            Client <span className="text-emerald-400">Reviews</span>
          </h2>
          <p className="mt-4 text-xl text-gray-400">Achievement unlocked: Happy clients</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-400/10"
            >
              <div className="absolute inset-0 bg-emerald-400/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Achievement Unlocked
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    {testimonial.badge}
                  </span>
                </div>

                <div className="mb-4 flex gap-1">
                  {Array.from({ length: (testimonial as any).rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="mb-4 text-sm leading-relaxed text-gray-200">"{testimonial.quote}"</blockquote>

                <div className="mb-4 text-sm text-gray-400">
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div>{testimonial.role}</div>
                </div>

                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full w-0 bg-emerald-400 transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
