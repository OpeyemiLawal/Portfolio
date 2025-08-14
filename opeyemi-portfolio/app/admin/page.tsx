"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"
import { FolderKanban, MessageSquareHeart } from "lucide-react"

type AdminProject = {
  id: string
  title: string
  category: string
  cover?: string
}

type AdminTestimonial = {
  quote: string
  author: string
  role?: string
  badge?: string
}

export default function AdminOverviewPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([])

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("admin_projects") || "null")
      const t = JSON.parse(localStorage.getItem("admin_testimonials") || "null")
      setProjects(Array.isArray(p) ? p : [])
      setTestimonials(Array.isArray(t) ? t : [])
    } catch {
      setProjects([])
      setTestimonials([])
    }
  }, [])

  const stats = useMemo(() => {
    const total = projects.length
    const byCategory = projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    return { total, byCategory, testimonials: testimonials.length }
  }, [projects, testimonials])

  return (
    <div className="space-y-6">
      {/* Dashboard header removed per request */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-gray-900/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400">Total projects managed</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-gray-900/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageSquareHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.testimonials}</div>
            <p className="text-xs text-gray-400">Client reviews and ratings</p>
          </CardContent>
        </Card>

        {/* Categories card removed per request */}
      </div>
    </div>
  )
}


