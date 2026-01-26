/**
 * Supabase Admin Client
 * For server-side operations that require bypassing RLS
 * USE ONLY in trusted backend contexts: webhooks, background jobs, migrations
 * NEVER expose to client-side code or user-facing routes
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Create admin Supabase client with service role key
 * Bypasses RLS - use with extreme caution
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
