"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const journey = [
  {
    level: 1,
    title: "Game Development Beginnings",
    description:
      "Started my coding journey with game development using Unity and simple JavaScript games. Learned that great games require both technical skill and creative problem solving, a combination that now drives every project I build.",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    level: 2,
    title: "Web Development Mastery",
    description:
      "Expanded into web technologies with React, Vue, and modern frameworks. Built responsive, user friendly interfaces that convert visitors into customers. My web applications consistently achieve high performance scores.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    level: 3,
    title: "Full Stack Expertise",
    description:
      "Developed comprehensive backend systems with Node.js, databases, and cloud deployment. I architect scalable solutions that grow with your business while maintaining optimal performance and cost efficiency.",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    level: 4,
    title: "Cross Platform Innovation",
    description:
      "Mastered mobile development with Flutter and React Native alongside advanced game development in Unity and Godot. This diverse skill set allows me to build cohesive experiences across all platforms.",
    gradient: "from-orange-400 to-red-500",
  },
  {
    level: 5,
    title: "AI Integration Pioneer",
    description:
      "Early adopter of AI tools and workflows. I leverage ChatGPT, Claude, and custom AI models to deliver projects 3x faster while maintaining premium quality. Your competitive advantage in the AI driven development era.",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    level: 6,
    title: "Speed & Innovation Leader",
    description:
      "Currently building complex applications rapidly using AI accelerated workflows. I combine cutting edge tools with proven expertise to deliver what others take months to build in record time.",
    gradient: "from-cyan-400 to-purple-400",
  },
]

export function DeveloperJourney() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-mono text-4xl lg:text-5xl font-bold mb-4">
            Developer <span className="text-cyan-400">Journey</span>
          </h2>
          <p className="text-xl text-gray-400">From game development roots to AI accelerated innovation</p>
        </div>

        <div className="relative">
          {/* Central timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-400 to-purple-400 opacity-30" />

          {journey.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
              }}
              viewport={{ once: true }}
              className="relative flex items-center mb-12"
            >
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full border-4 border-black z-10" />

              {/* Content card */}
              <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 ml-auto"}`}>
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-6">
                  <div className="flex items-center mb-3">
                    {index % 2 === 0 ? (
                      <>
                        <h3 className="text-xl font-bold mr-3">{level.title}</h3>
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${level.gradient} flex items-center justify-center text-sm font-bold`}
                        >
                          {level.level}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${level.gradient} flex items-center justify-center text-sm font-bold mr-3`}
                        >
                          {level.level}
                        </div>
                        <h3 className="text-xl font-bold">{level.title}</h3>
                      </>
                    )}
                  </div>
                  <p className="text-gray-400 mb-2">{level.description}</p>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
