/**
 * Testimonials Service
 * Handles fetching testimonials for display on the public site
 * Part of Phase 4: Public Site Enhancement
 */

import { createClient } from '../client'

const supabase = createClient()

export interface Testimonial {
  id: string
  created_at: string
  updated_at: string
  name: string
  role: string
  organization: string
  content: string
  rating: number
  featured: boolean
  active: boolean
  display_order: number
  photo_url: string | null
  linkedin_url: string | null
  case_study_url: string | null
}

export interface TestimonialsFilters {
  featured?: boolean
  minRating?: number
  limit?: number
}

/**
 * Get featured testimonials for homepage
 */
export async function getFeaturedTestimonials(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('featured', true)
      .eq('active', true)
      .order('display_order', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured testimonials:', error)
      return []
    }

    return data as Testimonial[]
  } catch (err) {
    console.error('Exception fetching featured testimonials:', err)
    return []
  }
}

/**
 * Get all active testimonials with optional filters
 */
export async function getTestimonials(filters: TestimonialsFilters = {}) {
  const { featured, minRating = 1, limit = 10 } = filters

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .gte('rating', minRating)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }

  return data as Testimonial[]
}

/**
 * Get a single testimonial by ID
 */
export async function getTestimonialById(id: string) {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error) {
    console.error('Error fetching testimonial:', error)
    return null
  }

  return data as Testimonial
}

/**
 * Search testimonials by keyword
 */
export async function searchTestimonials(searchTerm: string, limit = 10) {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .textSearch('search_vector', searchTerm)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching testimonials:', error)
    return []
  }

  return data as Testimonial[]
}
