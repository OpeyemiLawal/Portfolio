"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Code2, Lightbulb, Gamepad2, Send, Sparkles, Zap, Target } from "lucide-react"
import { motion } from "framer-motion"

export function AIPlayground() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="font-mono text-4xl font-bold lg:text-5xl">
            AI <span className="text-purple-400">Playground</span>
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Interactive demos showcasing AI-accelerated development workflows
          </p>
        </motion.div>

        <Tabs defaultValue="code-assistant" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <TabsTrigger
              value="code-assistant"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Code2 className="w-4 h-4 mr-2" />
              Code Assistant
            </TabsTrigger>
            <TabsTrigger
              value="project-generator"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Project Ideas
            </TabsTrigger>
            <TabsTrigger
              value="game-concepts"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Game Concepts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code-assistant" className="mt-8">
            <AICodeAssistant />
          </TabsContent>

          <TabsContent value="project-generator" className="mt-8">
            <ProjectIdeaGenerator />
          </TabsContent>

          <TabsContent value="game-concepts" className="mt-8">
            <GameConceptGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function AICodeAssistant() {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const exampleQuestions = [
    "Build a React component for user authentication",
    "Create a game inventory system in Unity",
    "Design a REST API for a social media app",
    "Implement real-time chat with WebSockets",
  ]

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/ai/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (data.error) {
        setResponse(`Error: ${data.error}`)
      } else {
        setResponse(data.response)
      }
    } catch (error) {
      setResponse("Failed to get AI response. Please check your API key configuration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2 text-cyan-400">AI Code Assistant Demo</h3>
          <p className="text-gray-400">Ask me about any coding challenge and see how I break it down systematically.</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about building any feature or solving a coding problem..."
              className="flex-1 bg-gray-800/50 border-gray-700"
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            />
            <Button onClick={handleAsk} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500">
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Thinking..." : "Ask"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Try these:</span>
            {exampleQuestions.map((q, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-400"
                onClick={() => setQuestion(q)}
              >
                {q}
              </Badge>
            ))}
          </div>

          {response && (
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-300">{response}</pre>
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

function ProjectIdeaGenerator() {
  const [industry, setIndustry] = useState("")
  const [techStack, setTechStack] = useState("")
  const [goals, setGoals] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!industry.trim() || !techStack.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/ai/project-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, techStack, goals }),
      })

      const data = await res.json()

      if (data.error) {
        console.error("API Error:", data.error)
      } else {
        setResult(data.result)
      }
    } catch (error) {
      console.error("Failed to generate project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2 text-purple-400">Project Idea Generator</h3>
          <p className="text-gray-400">
            Describe your needs and get a detailed project brief with timeline and features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Industry (e.g., Healthcare, E-commerce, Education)"
              className="bg-gray-800/50 border-gray-700"
            />
            <Input
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Preferred tech stack (e.g., React, Node.js, MongoDB)"
              className="bg-gray-800/50 border-gray-700"
            />
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Project goals and requirements (optional)"
              className="bg-gray-800/50 border-gray-700"
              rows={3}
            />
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500">
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate Project Brief"}
            </Button>
          </div>

          {result && (
            <Card className="bg-gray-800/50 border-gray-700 p-4 space-y-4">
              <h4 className="font-bold text-lg text-purple-400">{result.title}</h4>
              <p className="text-gray-300">{result.description}</p>

              <div>
                <h5 className="font-semibold text-white mb-2">Key Features:</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.features.map((feature: string, i: number) => (
                    <li key={i}>• {feature}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  <Zap className="w-3 h-3 mr-1" />
                  {result.timeline}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}

function GameConceptGenerator() {
  const [genre, setGenre] = useState("")
  const [platform, setPlatform] = useState("")
  const [theme, setTheme] = useState("")
  const [concept, setConcept] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const genres = ["Action", "RPG", "Puzzle", "Strategy", "Platformer", "Racing"]
  const platforms = ["Mobile", "PC", "Web", "Console", "VR"]

  const handleGenerate = async () => {
    if (!genre || !platform) return
    setLoading(true)

    try {
      const res = await fetch("/api/ai/game-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, platform, theme }),
      })

      const data = await res.json()

      if (data.error) {
        console.error("API Error:", data.error)
      } else {
        setConcept(data.result)
      }
    } catch (error) {
      console.error("Failed to generate game concept:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2 text-pink-400">Game Concept Generator</h3>
          <p className="text-gray-400">
            Generate complete game concepts with mechanics, monetization, and development plans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <Badge
                    key={g}
                    variant={genre === g ? "default" : "secondary"}
                    className={`cursor-pointer ${genre === g ? "bg-pink-600" : "hover:bg-pink-500/20"}`}
                    onClick={() => setGenre(g)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Platform</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <Badge
                    key={p}
                    variant={platform === p ? "default" : "secondary"}
                    className={`cursor-pointer ${platform === p ? "bg-pink-600" : "hover:bg-pink-500/20"}`}
                    onClick={() => setPlatform(p)}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Theme (optional, e.g., Cyberpunk, Fantasy, Space)"
              className="bg-gray-800/50 border-gray-700"
            />

            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-500">
              <Target className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Generate Game Concept"}
            </Button>
          </div>

          {concept && (
            <Card className="bg-gray-800/50 border-gray-700 p-4 space-y-4">
              <h4 className="font-bold text-lg text-pink-400">{concept.title}</h4>
              <p className="text-gray-300">{concept.concept}</p>

              <div>
                <h5 className="font-semibold text-white mb-2">Core Mechanics:</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  {concept.mechanics.map((mechanic: string, i: number) => (
                    <li key={i}>• {mechanic}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Monetization:</span>
                  <p className="text-white">{concept.monetization}</p>
                </div>
                <div>
                  <span className="text-gray-400">Timeline:</span>
                  <p className="text-white">{concept.developmentTime}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  )
}
