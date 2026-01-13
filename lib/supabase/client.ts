import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Return null during build if env vars aren't available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // During build time, return a mock client
    return null as any
  }
  
  return createBrowserClient(url, key)
}
