"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowRight, Zap, Clock, Target } from "lucide-react"

const aiWorkflow = [
  {
    phase: "Planning & Analysis",
    icon: Target,
    description: "Break down complex projects into manageable components",
    tools: ["ChatGPT", "Grok"],
    process: "Generate detailed technical specifications and development roadmaps",
    benefit: "3x faster project planning",
    color: "cyan",
  },
  {
    phase: "Rapid Development",
    icon: Zap,
    description: "Accelerate coding with AI-powered development tools",
    tools: ["Cursor", "Windsurf", "GitHub Copilot"],
    process: "Smart code completion, refactoring, and debugging assistance",
    benefit: "5x faster development",
    color: "purple",
  },
  {
    phase: "UI Prototyping",
    icon: Clock,
    description: "Build and iterate on interfaces at lightning speed",
    tools: ["v0", "ChatGPT"],
    process: "Rapid prototyping and component generation from descriptions",
    benefit: "10x faster UI creation",
    color: "green",
  },
]

export function AIWorkflow() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="font-mono text-4xl font-bold lg:text-5xl">
            AI-Powered <span className="text-cyan-400">Workflow</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-400">
            Delivering projects faster without compromising quality
          </p>
        </motion.div>

        {/* Workflow Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {aiWorkflow.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="relative h-full overflow-hidden border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-2">
                  {/* Icon & Phase */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`rounded-lg bg-${item.color}-500/20 p-2`}>
                      <Icon className={`h-5 w-5 text-${item.color}-400`} />
                    </div>
                    <h3 className="text-lg font-semibold">{item.phase}</h3>
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-sm text-gray-400">{item.description}</p>

                  {/* Tools */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.tools.map((tool) => (
                      <Badge
                        key={tool}
                        className={`bg-${item.color}-500/20 text-${item.color}-400 border-${item.color}-500/30`}
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>

                  {/* Process */}
                  <p className="mb-4 text-xs text-gray-500">{item.process}</p>

                  {/* Benefit */}
                  <div
                    className={`inline-flex items-center gap-2 rounded-full bg-${item.color}-500/10 px-3 py-1 text-sm font-medium text-${item.color}-400`}
                  >
                    <Zap className="h-3 w-3" />
                    {item.benefit}
                  </div>

                  {/* Hover Arrow */}
                  <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-gray-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-3 text-sm font-medium backdrop-blur-sm">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-gray-300">Result: Projects delivered 3-5x faster with enterprise quality</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
