'use server'

import { supabaseServer } from '@/lib/supabase/server'

export type AdminTestimonial = {
  id?: string
  quote: string
  author: string
  role?: string
  badge?: string
  rating?: number
}

function mapRowToTestimonial(row: any): AdminTestimonial {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role || '',
    badge: row.badge || '',
    rating: row.rating || 5,
  }
}

function mapTestimonialToRow(t: AdminTestimonial) {
  // Ensure rating is a number and within valid range
  const rating = typeof t.rating === 'number' 
    ? Math.max(1, Math.min(5, t.rating)) 
    : 5;

  return {
    id: t.id,
    quote: t.quote || '', // Ensure quote is never undefined
    author: t.author || '', // Ensure author is never undefined
    role: t.role || null,
    badge: t.badge || null,
    rating: rating,
    created_at: new Date().toISOString(),
  }
}

export async function listTestimonials(): Promise<AdminTestimonial[]> {
  console.log('listTestimonials called')
  const supabase = supabaseServer()
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, quote, author, role, badge, rating, created_at')
      .order('created_at', { ascending: false })
    
    console.log('listTestimonials response - data:', data, 'error:', error)
    
    if (error) {
      console.error('Error listing testimonials:', error)
      throw error
    }
    
    const result = (data || []).map(mapRowToTestimonial)
    console.log('Mapped testimonials:', result)
    return result
  } catch (error) {
    console.error('Error in listTestimonials:', error)
    throw error
  }
}

export async function saveTestimonial(testimonial: AdminTestimonial): Promise<AdminTestimonial> {
  console.log('saveTestimonial called with:', JSON.stringify(testimonial, null, 2))
  
  // Input validation
  if (!testimonial.quote?.trim()) {
    throw new Error('Quote is required')
  }
  if (!testimonial.author?.trim()) {
    throw new Error('Author is required')
  }
  
  const supabase = supabaseServer()
  const row = mapTestimonialToRow(testimonial)
  console.log('Mapped row data:', JSON.stringify(row, null, 2))
  
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message || 'Failed to save testimonial')
    }
    
    const savedTestimonial = mapRowToTestimonial(data)
    console.log('Successfully saved testimonial:', savedTestimonial)
    return savedTestimonial
    
  } catch (error) {
    console.error('Error in saveTestimonial:', error)
    throw error instanceof Error ? error : new Error('An unknown error occurred while saving')
  }
}

export async function removeTestimonial(id: string): Promise<void> {
  const supabase = supabaseServer()
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}
