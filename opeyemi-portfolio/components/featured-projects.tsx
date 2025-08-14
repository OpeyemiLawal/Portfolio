"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { projects as baseProjects } from "@/data/projects"
import { supabaseBrowser } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSiteSettings } from "./site-settings-context"

const categories = [
  { id: "game", label: "Games", description: "Interactive games & experiences" },
  { id: "software", label: "Software", description: "Tools & applications" },
  { id: "aitools", label: "Creative", description: "AI-powered creative projects" },
]

type AdminProject = {
  id: string
  title: string
  subtitle?: string
  cover?: string
  video?: string
  gallery?: string[]
  category: string
  tags?: string[]
  description?: string
  problemSolution?: string[]
  stack?: string[]
  aiTools?: string[]
  links?: { demo?: string; repo?: string }
  published?: boolean
}

export function FeaturedProjects() {
  const [active, setActive] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("game")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const { playHover, playClick } = useSiteSettings()
  const [dbProjects, setDbProjects] = useState<AdminProject[]>([])



  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from("projects")
          .select("id, title, subtitle, cover, video, gallery, category, tags, description, problem_solution, stack, ai_tools, links, published")
          .eq("published", true)
          .order("created_at", { ascending: false })
        if (error) throw error
        const mapped = (data || []).map((row: any) => ({
          id: String(row.id),
          title: row.title,
          subtitle: row.subtitle || "",
          cover: row.cover || "",
          video: row.video || "",
          gallery: Array.isArray(row.gallery) ? row.gallery : [],
          category: row.category,
          tags: Array.isArray(row.tags) ? row.tags : [],
          description: row.description || "",
          problemSolution: Array.isArray(row.problem_solution) ? row.problem_solution : [],
          stack: Array.isArray(row.stack) ? row.stack : [],
          aiTools: Array.isArray(row.ai_tools) ? row.ai_tools : [],
          links: typeof row.links === "object" && row.links !== null ? row.links : {},
          published: Boolean(row.published),
        })) as AdminProject[]
        if (mounted) setDbProjects(mapped)
      } catch {
        if (mounted) setDbProjects([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const allProjects = useMemo(() => {
    // Merge: db projects → base (fallback), dedupe by id
    const result: AdminProject[] = []
    const seen = new Set<string>()
    ;[...dbProjects, ...baseProjects].forEach((p) => {
      if (p && !seen.has(p.id)) {
        seen.add(p.id)
        result.push(p)
      }
    })
    return result
  }, [dbProjects])

  const filteredProjects = allProjects.filter((project) => project.category === activeTab)

  const nextImage = () => {
    if (active !== null && active < filteredProjects.length && filteredProjects[active]?.gallery) {
      const gallery = filteredProjects[active].gallery!
      setCurrentImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (active !== null && active < filteredProjects.length && filteredProjects[active]?.gallery) {
      const gallery = filteredProjects[active].gallery!
      setCurrentImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
    }
  }

  const openModal = (index: number) => {
    setActive(index)
    setCurrentImageIndex(0)
    setIsVideoPlaying(true)
  }

  return (
    <section className="w-full py-20" id="projects">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl font-mono">
            Project <span className="text-cyan-400">Lab</span>
          </h2>
          <p className="mt-4 text-xl text-gray-400">Interactive experiments and production tools</p>
        </motion.div>

        <motion.div
          className="mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-2 rounded-full bg-gray-900/50 p-2 backdrop-blur-sm border border-gray-800">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  playClick()
                  setActiveTab(category.id)
                }}
                onMouseEnter={playHover}
                className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === category.id
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/25"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500 text-center">
            {categories.find((cat) => cat.id === activeTab)?.description}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  playClick()
                  openModal(index)
                }}
                onMouseEnter={playHover}
              >
                <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={project.cover || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold transition-colors duration-300 group-hover:text-cyan-400">
                      {project.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-gray-400">{project.subtitle}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-gray-500">No projects available in this category yet.</p>
            <p className="text-sm text-gray-600 mt-2">Check back soon for updates!</p>
          </motion.div>
        )}
      </div>

      <Dialog open={active !== null} onOpenChange={() => setActive(null)}>
        <DialogContent className="w-[95vw] max-w-[1600px] h-[90vh] max-h-[1200px] p-0 border-gray-800 bg-gray-900/95 backdrop-blur-xl overflow-hidden">
          {active !== null && (
            <>
              <DialogHeader className="border-b border-gray-800 pb-4">
                <DialogTitle className="text-2xl font-bold font-mono text-white">
                  {filteredProjects[active].title}
                </DialogTitle>
                <p className="text-gray-400 mt-2">{filteredProjects[active].subtitle}</p>
              </DialogHeader>

              <div className="grid gap-8 lg:grid-cols-2 h-full overflow-y-auto p-8">
                {/* Video Section */}
                <div className="space-y-6 h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50">
                    {filteredProjects[active].video && filteredProjects[active].video.includes('youtube.com/embed') ? (
                      <iframe
                        src={filteredProjects[active].video}
                        title={`${filteredProjects[active].title} - YouTube Video`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : filteredProjects[active].video ? (
                      <video
                        src={filteredProjects[active].video}
                        autoPlay={isVideoPlaying}
                        muted
                        loop
                        className="w-full h-full object-contain"
                        onLoadedData={() => setIsVideoPlaying(true)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No video available</p>
                      </div>
                    )}
                    {filteredProjects[active].video && !filteredProjects[active].video.includes('youtube.com/embed') && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <button
                          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                          className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 hover:bg-black/70 transition-colors"
                        >
                          {isVideoPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Gallery Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300 font-mono">Project Gallery</h4>
                    <div className="relative">
                      <div className="aspect-video overflow-hidden rounded-lg border border-gray-700">
                        <Image
                          src={filteredProjects[active].gallery?.[currentImageIndex] || filteredProjects[active].cover || "/placeholder.svg"}
                          alt={`${filteredProjects[active].title || "Project"} - Image ${currentImageIndex + 1}`}
                          fill
                          className="object-contain transition-all duration-300"
                        />
                      </div>

                      {/* Gallery Navigation */}
                      {filteredProjects[active].gallery && filteredProjects[active].gallery!.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {filteredProjects[active].gallery && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {filteredProjects[active].gallery!.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all ${
                              currentImageIndex === index
                                ? "border-cyan-400 shadow-lg shadow-cyan-400/25"
                                : "border-gray-600 hover:border-gray-500"
                            }`}
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-6 overflow-y-auto pr-4">
                  <div>
                    <p className="text-gray-300 leading-relaxed">{filteredProjects[active].description}</p>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-cyan-400 font-mono">Problem → Solution</h4>
                    <ul className="space-y-2">
                      {filteredProjects[active].problemSolution?.map((item, i) => (
                        <li key={i} className="text-sm text-gray-300 pl-4 border-l-2 border-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-300 font-mono">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {filteredProjects[active].stack?.map((tech) => (
                        <Badge key={tech} className="bg-gray-800 text-gray-300 border border-gray-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-purple-400 font-mono">AI Tools Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {filteredProjects[active].aiTools?.map((tool) => (
                        <Badge key={tool} className="bg-purple-600/20 text-purple-200 border border-purple-600/30">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                    {filteredProjects[active].links?.demo && filteredProjects[active].links.demo !== "#" && (
                      <a href={filteredProjects[active].links.demo!} target="_blank" rel="noreferrer">
                        <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25">
                          <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                        </Button>
                      </a>
                    )}
                    {filteredProjects[active].links?.repo && filteredProjects[active].links.repo !== "#" && (
                      <a href={filteredProjects[active].links.repo!} target="_blank" rel="noreferrer">
                        <Button
                          variant="outline"
                          className="border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700"
                        >
                          <Github className="mr-2 h-4 w-4" /> Source Code
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
