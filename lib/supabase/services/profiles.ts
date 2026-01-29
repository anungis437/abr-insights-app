/**
 * Profiles Service
 * Handles user profile operations
 * Part of Phase 5: Authenticated Pages Migration
 */

import { createClient } from '../client'

const supabase = createClient()

export interface Profile {
  id: string
  organization_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  avatar_url: string | null
  job_title: string | null
  department: string | null
  employee_id: string | null
  language: 'en' | 'fr'
  timezone: string
  notification_preferences: {
    email: boolean
    push: boolean
    in_app: boolean
  }
  status: 'active' | 'inactive' | 'suspended' | 'invited'
  email_verified: boolean
  onboarding_completed: boolean
  onboarding_step: number
  last_login_at: string | null
  last_activity_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  job_title?: string
  department?: string
  language?: 'en' | 'fr'
  timezone?: string
  notification_preferences?: {
    email?: boolean
    push?: boolean
    in_app?: boolean
  }
  metadata?: Record<string, unknown>
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

/**
 * Get profile by user ID
 */
export async function getProfileById(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

/**
 * Update current user's profile
 */
export async function updateProfile(updates: UpdateProfileData) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data as Profile
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw uploadError
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('public').getPublicUrl(filePath)

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl })

  return publicUrl
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(preferences: {
  email?: boolean
  push?: boolean
  in_app?: boolean
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const currentProfile = await getCurrentProfile()

  if (!currentProfile) {
    throw new Error('Profile not found')
  }

  const updatedPreferences = {
    ...currentProfile.notification_preferences,
    ...preferences,
  }

  return await updateProfile({
    notification_preferences: updatedPreferences,
  })
}

/**
 * Update last activity timestamp
 */
export async function updateLastActivity() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  await supabase
    .from('profiles')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', user.id)
}

/**
 * Get profiles by organization
 */
export async function getOrganizationProfiles(organizationId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching organization profiles:', error)
    return []
  }

  return data as Profile[]
}
