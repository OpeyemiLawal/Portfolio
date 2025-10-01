'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Provide a safe no-op client when env vars are missing so the app can run
// and gracefully fall back to local data.
function createNoopClient() {
  const noopChain = {
    select() { return noopChain },
    eq() { return noopChain },
    order() { return Promise.resolve({ data: [], error: null }) },
  }
  return {
    from() { return noopChain },
  } as any
}

let client: any

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — using no-op client')
  }
  client = createNoopClient()
} else {
  client = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabaseBrowser = client

