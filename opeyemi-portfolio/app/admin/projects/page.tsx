"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { skills as ALL_SKILLS } from "@/data/skills"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Save, Plus, ImageIcon, Tags, LinkIcon, X, Check, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { listProjects, saveProject, removeProject as removeProjectDb, listCustomTags, addCustomTag } from "./actions"

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

const DEFAULT_PROJECT: AdminProject = {
  id: "",
  title: "",
  subtitle: "",
  cover: "",
  video: "",
  gallery: [],
  category: "game",
  tags: [],
  description: "",
  problemSolution: [],
  stack: [],
  aiTools: [],
  links: { demo: "", repo: "" },
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selected = useMemo(() => (selectedIndex == null ? null : projects[selectedIndex]), [projects, selectedIndex])
  const [justSaved, setJustSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listProjects()
        if (mounted) setProjects(data)
      } catch (err: any) {
        if (mounted) {
      setProjects([])
          toast({ title: "Failed to load projects", description: String(err?.message || err), variant: "destructive" })
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [toast])

  function persist(next: AdminProject[]) {
    setProjects(next)
  }

  function addProject() {
    const id = `project-${Date.now()}`
    persist([{ ...DEFAULT_PROJECT, id, title: "Untitled Project" }, ...projects])
    setSelectedIndex(0)
  }

  async function removeProject(index: number) {
    try {
      const toRemove = projects[index]
      if (!toRemove) return
      await removeProjectDb(toRemove.id)
      const refreshed = await listProjects()
      setProjects(refreshed)
    setSelectedIndex(null)
      toast({ title: "Deleted", description: `${toRemove.title} removed` })
    } catch (err: any) {
      toast({ title: "Delete failed", description: String(err?.message || err), variant: "destructive" })
    }
  }

  function updateSelected(update: Partial<AdminProject>) {
    if (selectedIndex == null) return
    const next = [...projects]
    next[selectedIndex] = { ...next[selectedIndex], ...update }
    persist(next)
  }

    async function handleSave() {
    try {
      if (!selected) return
      
      // Validate required fields
      if (!selected.title.trim()) {
        toast({ title: "Validation Error", description: "Project title is required", variant: "destructive" })
        return
      }
      
      if (!selected.id.trim()) {
        toast({ title: "Validation Error", description: "Project ID is required", variant: "destructive" })
        return
      }
      
      setIsSaving(true)
      setJustSaved(false)
      
      await saveProject(selected)
      const refreshed = await listProjects()
      setProjects(refreshed)
      const idx = refreshed.findIndex((p) => p.id === selected.id)
      setSelectedIndex(idx === -1 ? null : idx)
      
      setJustSaved(true)
      setIsSaving(false)
      toast({ title: "Saved to Database", description: `${selected.title} has been saved to Supabase` })
      window.setTimeout(() => setJustSaved(false), 3000)
    } catch (err: any) {
      setIsSaving(false)
      setJustSaved(false)
      toast({ title: "Save failed", description: String(err?.message || err), variant: "destructive" })
    }
  }

  const [customTags, setCustomTags] = useState<string[]>([])
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const cat = selected?.category
        if (!cat) {
          if (mounted) setCustomTags([])
          return
        }
        const tags = await listCustomTags(cat)
        if (mounted) setCustomTags(tags)
      } catch (err: any) {
        if (mounted) setCustomTags([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [selected?.category])

  function mapAdminCategoryToSkillsCategories(cat: string): string[] {
    switch (cat) {
      case "game":
        return ["Game Development", "Tools & Workflow"]
      case "software":
        return ["Software Development", "Tools & Workflow"]
      case "aitools":
        return ["AI-Accelerated Workflow", "Tools & Workflow"]
      default:
        return ["Software Development", "Tools & Workflow"]
    }
  }

  const baseTagsForCategory = useMemo(() => {
    const categories = mapAdminCategoryToSkillsCategories(selected?.category || "")
    const set = new Set<string>()
    categories.forEach((c) => {
      const group = (ALL_SKILLS as Array<{ category: string; items: Array<{ name: string }> }>).find((g) => g.category === c)
      ;(group?.items || []).forEach((it) => set.add(it.name))
    })
    return set
  }, [selected?.category])

  const suggestedTags = useMemo(() => {
    const acc = new Set<string>(Array.from(baseTagsForCategory))
    customTags.forEach((t) => acc.add(t))
    return Array.from(acc)
  }, [baseTagsForCategory, customTags])

  async function addTag(tag: string) {
    const clean = tag.trim()
    if (!clean) return
    const nextTags = Array.from(new Set([...(selected?.tags || []), clean]))
    updateSelected({ tags: nextTags })
    if (selected?.category) {
      const key = selected.category
      if (!baseTagsForCategory.has(clean) && !customTags.includes(clean)) {
        try {
          await addCustomTag(key, clean)
          const tags = await listCustomTags(key)
          setCustomTags(tags)
        } catch (err: any) {
          toast({ title: "Tag save failed", description: String(err?.message || err), variant: "destructive" })
        }
      }
    }
  }

  function removeTag(tag: string) {
    updateSelected({ tags: (selected?.tags || []).filter((t) => t !== tag) })
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files || !selected) return
    const readers: Promise<string>[] = []
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      readers.push(
        new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(String(fr.result || ""))
          fr.readAsDataURL(file)
        })
      )
    })
    const dataUrls = await Promise.all(readers)
    const next = [...(selected.gallery || []), ...dataUrls.filter(Boolean)]
    updateSelected({ gallery: next })
  }

  function handleVideoUrl(url: string) {
    if (!selected) return
    
    // Extract YouTube video ID from various URL formats
    let videoId = ""
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    
    if (match) {
      videoId = match[1]
      const embedUrl = `https://www.youtube.com/embed/${videoId}`
      updateSelected({ video: embedUrl })
      toast({ title: "YouTube video added", description: "Video link processed successfully" })
    } else {
      toast({ title: "Invalid URL", description: "Please provide a valid YouTube video URL", variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <div className="flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-200 to-cyan-300 bg-clip-text text-2xl md:text-3xl font-bold font-mono tracking-tight text-transparent">Projects</h2>
          <Button size="sm" onClick={addProject}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>

        <div className="grid gap-2">
          {projects.length === 0 && (
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-4 text-sm text-gray-400">No projects yet. Click Add to create.</CardContent>
            </Card>
          )}
          {projects.map((p, i) => (
            <Card key={p.id} className={cn("border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-gray-900/70", selectedIndex === i && "border-cyan-600/60 shadow-[0_0_20px_rgba(34,211,238,0.15)]") }>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium truncate">{p.title || "Untitled"}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedIndex(i)}>
                    Edit
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => removeProject(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
                  <div className="flex items-center gap-1">
                    {p.published ? (
                      <Eye className="h-3 w-3 text-green-400" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!selected && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-6 text-sm text-gray-400">Select a project to edit</CardContent>
          </Card>
        )}

        {selected && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">ID</Label>
                  <Input id="id" value={selected.id} onChange={(e) => updateSelected({ id: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selected.category} onValueChange={(v) => updateSelected({ category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="aitools">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>Published</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSelected({ published: !selected.published })}
                      className="h-6 px-2"
                    >
                      {selected.published ? (
                        <Eye className="h-4 w-4 text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </Label>
                  <div className="text-xs text-gray-500">
                    {selected.published ? "Visible on public site" : "Hidden from public site"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover Image</Label>
                  <input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith("image/")) return
                      const fr = new FileReader()
                      fr.onload = () => updateSelected({ cover: String(fr.result || "") })
                      fr.readAsDataURL(file)
                    }}
                    className="block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-cyan-500"
                  />
                  {selected.cover && (
                    <div className="mt-2 overflow-hidden rounded border border-gray-800/60 bg-black/30">
                      <img src={selected.cover} alt="Cover" className="h-40 w-full object-contain bg-gray-800" />
                      <div className="flex items-center justify-end gap-2 p-2">
                        <Button size="sm" variant="ghost" onClick={() => updateSelected({ cover: "" })}>Clear</Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">YouTube Video</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="video" 
                      placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)" 
                      value={selected.video || ""} 
                      onChange={(e) => updateSelected({ video: e.target.value })} 
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleVideoUrl(selected.video || "")}
                      disabled={!selected.video}
                    >
                      Process
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Paste a YouTube video URL and click Process to convert it to embed format.</p>
                  
                  {selected.video && selected.video.includes('youtube.com/embed') && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-xs text-green-400 mb-2">✓ Video URL processed successfully</p>
                      <div className="aspect-video w-full">
                        <iframe
                          src={selected.video}
                          title="YouTube video"
                          className="w-full h-full rounded"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Tabs defaultValue="gallery">
                <TabsList>
                  <TabsTrigger value="gallery">
                    <ImageIcon className="mr-2 h-4 w-4" /> Gallery
                  </TabsTrigger>
                  <TabsTrigger value="tags">
                    <Tags className="mr-2 h-4 w-4" /> Tags & Stack
                  </TabsTrigger>
                  <TabsTrigger value="links">
                    <LinkIcon className="mr-2 h-4 w-4" /> Links
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="gallery" className="space-y-3">
                  <div className="space-y-2">
                    <Label>Upload Images</Label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageFiles(e.target.files)}
                      className="block w-full text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {(selected.gallery || []).map((src, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded border border-gray-800/60 bg-black/30">
                        <img src={src} alt="Upload" className="h-28 w-full object-contain bg-gray-800" />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1 h-6 px-2"
                          onClick={() => updateSelected({ gallery: (selected.gallery || []).filter((_, i) => i !== idx) })}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="tags" className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Current Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {(selected.tags || []).length === 0 && (
                        <span className="text-xs text-gray-500">No tags yet</span>
                      )}
                      {(selected.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-800 text-gray-200">
                          {tag}
                          <button className="ml-1 inline-flex" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Suggested Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((t) => {
                        const active = (selected.tags || []).includes(t)
                        return (
                          <Button key={t} size="sm" variant={active ? "default" : "outline"} className={active ? "bg-fuchsia-600" : "border-gray-700 bg-gray-900/50"} onClick={() => addTag(t)}>
                            {t}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Add Custom Tag</Label>
                    <Input
                      placeholder="Type a tag and press Enter"
                      onKeyDown={(e) => {
                        const input = e.currentTarget as HTMLInputElement
                        if (e.key === "Enter" && input.value.trim()) {
                          addTag(input.value.trim())
                          input.value = ""
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tech Stack</Label>
                    <Input
                      placeholder="Comma separated"
                      value={(selected.stack || []).join(", ")}
                      onChange={(e) => updateSelected({ stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>AI Tools</Label>
                    <Input
                      placeholder="Comma separated"
                      value={(selected.aiTools || []).join(", ")}
                      onChange={(e) => updateSelected({ aiTools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="links" className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Demo URL</Label>
                    <Input value={selected.links?.demo || ""} onChange={(e) => updateSelected({ links: { ...selected.links, demo: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Repo URL</Label>
                    <Input value={selected.links?.repo || ""} onChange={(e) => updateSelected({ links: { ...selected.links, repo: e.target.value } })} />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} value={selected.description || ""} onChange={(e) => updateSelected({ description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Problem → Solution (one per line)</Label>
                <Textarea
                  rows={3}
                  value={(selected.problemSolution || []).join("\n")}
                  onChange={(e) => updateSelected({ problemSolution: e.target.value.split("\n").filter((s) => s.trim() !== "") })}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className={cn(
                  "transition-all duration-300",
                  isSaving && "bg-cyan-600 hover:bg-cyan-600 shadow-[0_0_24px] shadow-cyan-600/30",
                  justSaved && "bg-emerald-600 hover:bg-emerald-600 shadow-[0_0_24px] shadow-emerald-600/30",
                  !isSaving && !justSaved && "bg-fuchsia-600 hover:bg-fuchsia-500"
                )}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : justSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}


