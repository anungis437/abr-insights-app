import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple GoTrueClient instances
let clientInstance: SupabaseClient<any, 'public', any> | null = null

export function createClient(): SupabaseClient<any, 'public', any> {
  // Check for required environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // During build/compile time (webpack), env vars may not be available
    // Only throw in actual runtime contexts
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Please set:\n' +
          '  - NEXT_PUBLIC_SUPABASE_URL\n' +
          '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
          'in your .env.local file'
      )
    }
    // During build, create a mock client to satisfy TypeScript
    console.warn('Supabase client: Environment variables not available during build')
    return {} as SupabaseClient<any, 'public', any>
  }

  // Return existing instance if available (singleton pattern)
  if (clientInstance) {
    return clientInstance
  }

  // Create new instance and cache it
  clientInstance = createBrowserClient(url, key)
  return clientInstance
}
