import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple GoTrueClient instances
let clientInstance: SupabaseClient | null = null

export function createClient() {
  // Return null during build if env vars aren't available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // During build time, return a mock client
    return null as any
  }
  
  // Return existing instance if available (singleton pattern)
  if (clientInstance) {
    return clientInstance
  }
  
  // Create new instance and cache it
  clientInstance = createBrowserClient(url, key)
  return clientInstance
}
