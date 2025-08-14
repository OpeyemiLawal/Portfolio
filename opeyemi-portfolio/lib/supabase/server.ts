import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE as string

export function supabaseServer() {
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase envs. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE')
  }
  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  })
}


