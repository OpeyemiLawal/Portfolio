"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2, Code, Bot, Globe, Smartphone } from "lucide-react"

const skillZones = {
  games: {
    color: "cyan",
    skills: [
      {
        name: "Godot",
        icon: "https://godotengine.org/assets/press/icon_color.svg",
        description: "Open-source game engine mastery",
      },
      { name: "Unity", icon: "/Unity_icon.png", description: "Professional 3D game development" },
      {
        name: "Roblox",
        icon: "/Roblox_icon.png",
        description: "Platform game creation and scripting",
      },
      { name: "Phaser.JS", icon: "🌟", description: "HTML5 game framework expertise" },
      { name: "Three.JS", icon: "🌐", description: "3D web graphics and WebGL" },
      { name: "WebGL", icon: "⚡", description: "High-performance browser graphics" },
      { name: "Multiplayer", icon: "👥", description: "Real-time multiplayer systems" },
    ],
  },
  software: {
    color: "purple",
    categories: [
      {
        title: "Web Application Development",
        icon: <Globe className="w-4 h-4" />,
        subcategories: [
          {
            title: "Frontend",
            skills: [
              { name: "React.js", icon: "⚛️", description: "Modern component-based UI" },
              { name: "Vue.js", icon: "💚", description: "Progressive JavaScript framework" },
              { name: "Angular", icon: "🅰️", description: "Full-featured web framework" },
              { name: "JavaScript", icon: "🟨", description: "Core web programming language" },
              { name: "TypeScript", icon: "📘", description: "Type-safe JavaScript development" },
            ],
          },
          {
            title: "Backend",
            skills: [
              { name: "Node.js", icon: "🟢", description: "Server-side JavaScript runtime" },
              { name: "PostgreSQL", icon: "🐘", description: "Advanced relational database" },
              { name: "MySQL", icon: "🐬", description: "Popular relational database" },
              { name: "MongoDB", icon: "🍃", description: "NoSQL document database" },
              { name: "Redis", icon: "🔴", description: "In-memory data structure store" },
              { name: "REST APIs", icon: "🔗", description: "RESTful web services" },
              { name: "GraphQL", icon: "🔷", description: "Query language for APIs" },
              { name: "gRPC", icon: "⚡", description: "High-performance RPC framework" },
            ],
          },
          {
            title: "Deployment",
            skills: [
              { name: "AWS", icon: "☁️", description: "Amazon Web Services cloud" },
              { name: "Azure", icon: "🔵", description: "Microsoft cloud platform" },
              { name: "Google Cloud", icon: "🌤️", description: "Google cloud services" },
              { name: "Vercel", icon: "▲", description: "Frontend deployment platform" },
              { name: "Netlify", icon: "🌐", description: "JAMstack deployment platform" },
            ],
          },
        ],
      },
      {
        title: "Mobile App Development",
        icon: <Smartphone className="w-4 h-4" />,
        subcategories: [
          {
            title: "Cross-Platform",
            skills: [
              { name: "Flutter", icon: "🐦", description: "Google's UI toolkit (Dart)" },
              { name: "React Native", icon: "📱", description: "Native apps with React (JS/TS)" },
            ],
          },
        ],
      },
    ],
  },
  aitools: {
    color: "orange",
    skills: [
      { name: "ChatGPT", icon: "🤖", description: "AI-powered development assistance" },
      { name: "Cursor", icon: "🎯", description: "AI-enhanced code editor" },
      { name: "v0", icon: "⚡", description: "Rapid UI prototyping with AI" },
      { name: "GitHub Copilot", icon: "🚁", description: "AI pair programming assistant" },
      { name: "Claude", icon: "🧠", description: "Advanced AI reasoning and coding" },
      { name: "Windsurf", icon: "🏄", description: "AI-accelerated development workflow" },
    ],
  },
}

export function SkillsZone() {
  const [activeSkill, setActiveSkill] = useState("games")

  const renderSkillCard = (skill: any, index: number, color: string) => (
    <motion.div
      key={skill.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-4 text-center h-full">
        <div
          className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-${color}-500/20 group-hover:bg-${color}-500/30 flex items-center justify-center text-2xl transition-colors duration-300`}
        >
          {(skill.icon.startsWith("http") || skill.icon.startsWith("/")) ? (
            <img 
              src={skill.icon} 
              alt={skill.name} 
              className="w-8 h-8 object-contain" 
              onError={(e) => {
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.textContent = skill.name === 'Unity' ? '🎮' : '👾';
                target.parentNode?.insertBefore(fallback, target.nextSibling);
              }}
            />
          ) : (
            skill.icon
          )}
        </div>
        <h3 className="font-semibold text-sm mb-1">{skill.name}</h3>
        <p className={`text-xs text-${color}-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          {skill.description}
        </p>
      </Card>
    </motion.div>
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-mono text-4xl lg:text-5xl font-bold mb-4">
            Skill <span className="text-purple-400">Zones</span>
          </h2>
          <p className="text-xl text-gray-400">Technologies and tools I master</p>
        </div>

        <Tabs value={activeSkill} onValueChange={setActiveSkill} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <TabsTrigger value="games" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Game development
            </TabsTrigger>
            <TabsTrigger
              value="software"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Code className="w-4 h-4 mr-2" />
              Software development
            </TabsTrigger>
            <TabsTrigger
              value="aitools"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI tools
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="mt-8">
            <div className="flex flex-wrap justify-center gap-4">
              {skillZones.games.skills.map((skill, index) => renderSkillCard(skill, index, skillZones.games.color))}
            </div>
          </TabsContent>

          {/* Software Tab */}
          <TabsContent value="software" className="mt-8">
            <div className="space-y-8">
              {skillZones.software.categories.map((category, categoryIndex) => (
                <div key={category.title} className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    {category.icon}
                    <h3 className="text-xl font-bold text-purple-400 font-mono">{category.title}</h3>
                  </div>

                  {category.subcategories.map((subcategory, subIndex) => (
                    <div key={subcategory.title} className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 pl-4 border-l-2 border-purple-400/50">
                        {subcategory.title}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {subcategory.skills.map((skill, skillIndex) =>
                          renderSkillCard(skill, skillIndex, skillZones.software.color),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="aitools" className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {skillZones.aitools.skills.map((skill, index) => renderSkillCard(skill, index, skillZones.aitools.color))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.section>
  )
}
