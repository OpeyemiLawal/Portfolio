'use server'

import { supabaseServer } from '@/lib/supabase/server'

export type AdminProject = {
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

function mapRowToProject(row: any): AdminProject {
  return {
    id: String(row.id),
    title: row.title,
    subtitle: row.subtitle || '',
    cover: row.cover || '',
    video: row.video || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    description: row.description || '',
    problemSolution: Array.isArray(row.problem_solution) ? row.problem_solution : [],
    stack: Array.isArray(row.stack) ? row.stack : [],
    aiTools: Array.isArray(row.ai_tools) ? row.ai_tools : [],
    links: typeof row.links === 'object' && row.links !== null ? row.links : {},
    published: Boolean(row.published),
  }
}

function mapProjectToRow(p: AdminProject) {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle || null,
    cover: p.cover || null,
    video: p.video || null,
    gallery: p.gallery || [],
    category: p.category,
    tags: p.tags || [],
    description: p.description || null,
    problem_solution: p.problemSolution || [],
    stack: p.stack || [],
    ai_tools: p.aiTools || [],
    links: p.links || {},
    published: p.published ?? true,
    updated_at: new Date().toISOString(),
  }
}

export async function listProjects(): Promise<AdminProject[]> {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, title, subtitle, cover, video, gallery, category, tags, description, problem_solution, stack, ai_tools, links, published, updated_at'
    )
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapRowToProject)
}

export async function saveProject(project: AdminProject): Promise<void> {
  const supabase = supabaseServer()
  const row = mapProjectToRow(project)
  const { error } = await supabase.from('projects').upsert(row, { onConflict: 'id' })
  if (error) throw error
}

export async function removeProject(id: string): Promise<void> {
  const supabase = supabaseServer()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function listCustomTags(category: string): Promise<string[]> {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('custom_tags').select('tag').eq('category', category)
  if (error) throw error
  return (data || []).map((r) => r.tag)
}

export async function addCustomTag(category: string, tag: string): Promise<void> {
  const supabase = supabaseServer()
  const { error } = await supabase.from('custom_tags').upsert({ category, tag })
  if (error) throw error
}


