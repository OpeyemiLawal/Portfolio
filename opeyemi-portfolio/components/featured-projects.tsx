"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { projects as baseProjects } from "@/data/projects"
import { supabaseBrowser } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog-fixed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, Image as ImageIcon, Gamepad2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSiteSettings } from "./site-settings-context"
import Head from "next/head"

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
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false)
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false)
  const [isGameFullscreen, setIsGameFullscreen] = useState(false)
  const [isGameLoading, setIsGameLoading] = useState(false)
  const [showGamePlayButton, setShowGamePlayButton] = useState(true)
  const { playHover, playClick } = useSiteSettings()
  const [dbProjects, setDbProjects] = useState<AdminProject[]>([])

  const toggleVideoFullscreen = () => {
    const videoContainer = document.querySelector('.video-container')
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().then(() => {
          // Add cursor-visible class to the fullscreen element
          if (document.fullscreenElement) {
            document.fullscreenElement.classList.add('cursor-visible')
            // Add close button to fullscreen
            const closeBtn = document.createElement('button')
            closeBtn.className = 'fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
            closeBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            `
            closeBtn.onclick = () => document.exitFullscreen()
            document.fullscreenElement.appendChild(closeBtn)
          }
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  const handlePlayGame = async () => {
    const gameContainer = document.querySelector('.game-container')
    if (!gameContainer) return

    try {
      // Show loading state briefly to ensure smooth transition
      setIsGameLoading(true)
      
      await gameContainer.requestFullscreen()
      setShowGamePlayButton(false)
      
      // Add close button to fullscreen
      const closeBtn = document.createElement('button')
      closeBtn.className = 'fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-sm border border-gray-600'
      closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-5 h-5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `
      closeBtn.onclick = (e) => {
        e.stopPropagation()
        document.exitFullscreen()
      }
      document.fullscreenElement?.appendChild(closeBtn)
      
      // Hide loading state after a short delay to ensure smooth transition
      setTimeout(() => {
        setIsGameLoading(false)
      }, 500)
      
    } catch (err) {
      console.error('Error entering fullscreen:', err)
      setIsGameLoading(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement
      
      setIsVideoFullscreen(!!fullscreenElement?.classList.contains('video-container'))
      setIsGalleryFullscreen(!!fullscreenElement?.classList.contains('gallery-container'))
      
      if (fullscreenElement?.classList.contains('game-container')) {
        setIsGameFullscreen(true)
        setShowGamePlayButton(false)
      } else {
        // Remove any existing close button when exiting fullscreen
        const existingCloseBtn = document.querySelector('.fullscreen-close-btn')
        if (existingCloseBtn) {
          existingCloseBtn.remove()
        }
        setIsGameFullscreen(false)
        setShowGamePlayButton(true)
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleGalleryFullscreen = () => {
    const galleryContainer = document.querySelector('.gallery-container')
    if (galleryContainer) {
      if (!document.fullscreenElement) {
        galleryContainer.requestFullscreen().then(() => {
          // Add cursor-visible class to the fullscreen element
          if (document.fullscreenElement) {
            document.fullscreenElement.classList.add('cursor-visible')
            // Add close button to fullscreen
            const closeBtn = document.createElement('button')
            closeBtn.className = 'fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
            closeBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            `
            closeBtn.onclick = () => document.exitFullscreen()
            document.fullscreenElement.appendChild(closeBtn)
          }
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement
      setIsVideoFullscreen(!!fullscreenElement?.classList.contains('video-container'))
      setIsGalleryFullscreen(!!fullscreenElement?.classList.contains('gallery-container'))
      setIsGameFullscreen(!!fullscreenElement?.classList.contains('game-container'))
      
      // Add or remove cursor-visible class based on fullscreen state
      if (fullscreenElement) {
        fullscreenElement.classList.add('cursor-visible')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])



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
      <Head>
        <style jsx global>{`
          @keyframes cursor-blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
          @keyframes spin-medium {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-medium {
            animation: spin-medium 2s linear infinite;
          }
          .cursor-blink { animation: cursor-blink 1.5s infinite; }
          .cursor-visible * { cursor: default !important; }
        `}</style>
      </Head>
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
                    <div className="flex flex-wrap gap-2 max-w-full [&>div]:whitespace-nowrap">
                      {project.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {project.gallery && project.gallery.length > 0 && (
                      <div className="flex justify-end">
                        <button
                          onClick={toggleGalleryFullscreen}
                          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-1"
                        >
                          {isGalleryFullscreen ? (
                            <>
                              <Minimize2 className="w-3 h-3" />
                              <span>Exit fullscreen</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3 h-3" />
                              <span>View fullscreen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
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

      <Dialog open={active !== null} onOpenChange={(isOpen) => !isOpen && setActive(null)}>
        <DialogContent 
          className="p-0 border border-gray-700 bg-gray-900/95 backdrop-blur-xl overflow-hidden rounded-lg"
          showCloseButton={false}
        >
          {active !== null && (
            <>
              <DialogHeader className="border-b border-gray-800 pb-4 relative">
                <Button
                  onClick={() => setActive(null)}
                  className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 hover:text-white"
                  variant="ghost"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <span className="sr-only">Close</span>
                </Button>
                <DialogTitle className="text-2xl font-bold font-mono text-white pr-10">
                  {filteredProjects[active].title}
                </DialogTitle>
                <p className="text-gray-400 mt-2">{filteredProjects[active].subtitle}</p>
              </DialogHeader>

              <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] h-full overflow-y-auto p-6">
                {/* Video Section */}
                <div className="space-y-6 h-full flex flex-col overflow-y-auto pr-2">
                  <div 
                    className="relative w-full rounded-lg border border-gray-700 bg-gray-800/50 video-container"
                    style={{ 
                      cursor: 'default',
                      aspectRatio: '16/9',
                      height: '0',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isVideoLoading && filteredProjects[active].video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                        <div className="animate-pulse text-center">
                          <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-gray-400 font-mono">Loading video...</p>
                        </div>
                      </div>
                    )}
                    {filteredProjects[active].video && filteredProjects[active].video.includes('youtube.com/embed') ? (
                      <div className="absolute inset-0 w-full h-full">
                        <iframe
                          src={filteredProjects[active].video}
                          title={`${filteredProjects[active].title} - YouTube Video`}
                          className="w-full h-full"
                          allowFullScreen
                          onLoad={() => setIsVideoLoading(false)}
                          style={{
                            border: 'none',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </div>
                    ) : filteredProjects[active].video ? (
                      <>
                        <div className="absolute inset-0 w-full h-full">
                          <video
                            src={filteredProjects[active].video}
                            autoPlay={isVideoPlaying}
                            muted
                            loop
                            className="w-full h-full object-cover"
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                            style={{
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <button
                          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                          className="absolute bottom-4 right-16 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 hover:bg-black/70 transition-colors z-10"
                          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                        >
                          {isVideoPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No video available</p>
                      </div>
                    )}
                    {filteredProjects[active].video && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVideoFullscreen()
                        }}
                        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-600 hover:bg-black/70 transition-colors z-10"
                        aria-label={isVideoFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      >
                        {isVideoFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-white" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Playable Game Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-gray-300 font-mono">Play the Game</h4>
                      <button
                        onClick={handlePlayGame}
                        className="p-1.5 rounded bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 hover:text-white transition-colors"
                        title="Play in fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="relative w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 game-container" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */, height: 0 }}>
                      {filteredProjects[active].category === 'game' ? (
                        <div className="absolute top-0 left-0 w-full h-full">
                          {showGamePlayButton && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                              <button 
                                onClick={handlePlayGame}
                                className="px-10 py-3 bg-gradient-to-r from-fuchsia-600 to-cyan-600 rounded-lg hover:from-fuchsia-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                              >
                                <span className="font-mono font-bold text-white tracking-wider">
                                  PLAY NOW
                                </span>
                              </button>
                            </div>
                          )}
                          {isGameLoading && !showGamePlayButton && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                              <div className="animate-pulse text-center">
                                <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm text-gray-400 font-mono">Loading game...</p>
                              </div>
                            </div>
                          )}
                          <div className={`absolute inset-0 transition-opacity duration-500 ${!isGameFullscreen ? 'opacity-0' : 'opacity-100'}`}>
                            {filteredProjects[active].links?.demo ? (
                            <iframe
                              src={filteredProjects[active].links.demo.startsWith('http') ? filteredProjects[active].links.demo : `https://${filteredProjects[active].links.demo}`}
                              title={`Play ${filteredProjects[active].title}`}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              style={{
                                border: 'none',
                                width: '100%',
                                height: '100%',
                                aspectRatio: '16/9',
                                display: isGameLoading ? 'none' : 'block'
                              }}
                              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                              onLoad={() => {
                                setIsGameLoading(false)
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <p>No playable demo available</p>
                            </div>
                          )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-400">
                          <Gamepad2 className="w-8 h-8 mb-2" />
                          <p>No playable demo available for this project</p>
                          {filteredProjects[active].links?.demo && (
                            <a 
                              href={filteredProjects[active].links.demo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-2 text-cyan-400 hover:underline text-sm"
                            >
                              Open in new tab
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-gray-300 font-mono">Project Gallery</h4>
                      <button
                        onClick={toggleGalleryFullscreen}
                        className="p-1.5 rounded bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 hover:text-white transition-colors"
                        title={isGalleryFullscreen ? "Exit fullscreen" : "View fullscreen"}
                      >
                        {isGalleryFullscreen ? (
                          <Minimize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div 
                      className="relative gallery-container"
                      style={{ cursor: 'default' }}
                    >
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
                <div className="space-y-8 overflow-y-auto pr-2 pl-2">
                  {/* Project Overview */}
                  <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-5 bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-cyan-400 font-mono tracking-wider">PROJECT OVERVIEW</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-justify text-sm">
                      {filteredProjects[active].description}
                    </p>
                  </motion.div>

                  {/* Project Tags */}
                  {filteredProjects[active].tags && filteredProjects[active].tags.length > 0 && (
                    <motion.div 
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-5 bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-cyan-400 font-mono tracking-wider">PROJECT TAGS</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filteredProjects[active].tags?.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge 
                              className="text-gray-200 border border-gray-700 hover:border-cyan-400/30 transition-all duration-300"
                              style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5))',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tech Stack */}
                  <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-5 bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-cyan-400 font-mono tracking-wider">TECH STACK</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredProjects[active].stack?.map((tech, index) => (
                        <motion.div
                          key={tech}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                        >
                          <Badge 
                            className="bg-gray-800/80 text-gray-200 border border-gray-700 hover:border-cyan-400/50 hover:bg-gray-800 transition-all duration-300"
                            style={{
                              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
                              backdropFilter: 'blur(8px)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            {tech}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Tools */}
                  <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-5 bg-gradient-to-b from-purple-400 to-fuchsia-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-purple-400 font-mono tracking-wider">AI TOOLS USED</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredProjects[active].aiTools?.map((tool, index) => (
                        <motion.div
                          key={tool}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge 
                            className="text-purple-200 border border-purple-800/50 hover:border-purple-400/50 transition-all duration-300"
                            style={{
                              background: 'linear-gradient(145deg, rgba(76, 29, 149, 0.3), rgba(107, 33, 168, 0.3))',
                              backdropFilter: 'blur(8px)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            {tool}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Project Links */}
                  <motion.div 
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-5 bg-gradient-to-b from-fuchsia-400 to-cyan-400 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-fuchsia-400 font-mono tracking-wider">PROJECT LINKS</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {filteredProjects[active].links?.demo && (
                        <motion.a
                          href={filteredProjects[active].links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex-1 min-w-[160px] px-6 py-3 text-sm font-medium text-center rounded-lg overflow-hidden transition-all duration-300"
                          whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)' }}
                          style={{
                            background: 'linear-gradient(145deg, rgba(192, 38, 211, 0.9), rgba(34, 211, 238, 0.9))',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                            <ExternalLink className="w-4 h-4" />
                            Live Demo
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.a>
                      )}
                      {filteredProjects[active].links?.repo && (
                        <motion.a
                          href={filteredProjects[active].links.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex-1 min-w-[160px] px-6 py-3 text-sm font-medium text-center bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300"
                          whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.2)' }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2 text-gray-200 group-hover:text-white">
                            <Github className="w-4 h-4" />
                            View Code
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
