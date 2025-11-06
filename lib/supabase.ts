import { createClient } from '@supabase/supabase-js'

// Supabase client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type definitions for database tables
export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  organization_id: string
  preferred_language: 'en' | 'fr'
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  title: string
  slug: string
  description: string
  category_id: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_minutes: number
  is_published: boolean
  thumbnail_url: string | null
  created_at: string
}

export type TribunalCase = {
  id: string
  case_number: string
  title: string
  decision_date: string | null
  tribunal_name: string
  province: string | null
  summary: string | null
  full_text: string
  primary_category: string | null
  ai_classification_confidence: number | null
  created_at: string
}
