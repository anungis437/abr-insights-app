/**
 * Onboarding Service
 * Replaces: base44.entities.Onboarding
 * Tables: onboarding_steps, user_onboarding
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type OnboardingStepType =
  | 'profile_setup'
  | 'preference_setting'
  | 'tour'
  | 'tutorial'
  | 'welcome'

export type OnboardingStep = {
  id: string
  step_key: string
  title: string
  description: string | null
  type: OnboardingStepType
  order_index: number
  is_required: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserOnboarding = {
  id: string
  user_id: string
  step_id: string
  completed_at: string | null
  skipped_at: string | null
  data: Record<string, any> | null
  created_at: string
  updated_at: string
}

export type OnboardingProgress = {
  totalSteps: number
  completedSteps: number
  requiredStepsCompleted: number
  requiredStepsTotal: number
  percentComplete: number
  isComplete: boolean
  steps: Array<OnboardingStep & { status: 'pending' | 'completed' | 'skipped' }>
}

export class OnboardingService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get all onboarding steps
   */
  async getSteps() {
    const { data, error } = await this.supabase
      .from('onboarding_steps')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as OnboardingStep[]
  }

  /**
   * Get user's onboarding progress
   * Replaces: base44.entities.Onboarding.getProgress()
   */
  async getUserProgress(userId: string): Promise<OnboardingProgress> {
    // Get all steps
    const steps = await this.getSteps()

    // Get user's completed/skipped steps
    const { data: userSteps, error } = await this.supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    const userStepsMap = new Map(userSteps?.map((s) => [s.step_id, s]) || [])

    // Calculate progress
    const totalSteps = steps.length
    const requiredSteps = steps.filter((s) => s.is_required)
    const requiredStepsTotal = requiredSteps.length

    let completedSteps = 0
    let requiredStepsCompleted = 0

    const stepsWithStatus = steps.map((step) => {
      const userStep = userStepsMap.get(step.id)
      let status: 'pending' | 'completed' | 'skipped' = 'pending'

      if (userStep?.completed_at) {
        status = 'completed'
        completedSteps++
        if (step.is_required) requiredStepsCompleted++
      } else if (userStep?.skipped_at) {
        status = 'skipped'
      }

      return { ...step, status }
    })

    const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    const isComplete = requiredStepsCompleted === requiredStepsTotal

    return {
      totalSteps,
      completedSteps,
      requiredStepsCompleted,
      requiredStepsTotal,
      percentComplete,
      isComplete,
      steps: stepsWithStatus,
    }
  }

  /**
   * Complete onboarding step
   * Replaces: base44.entities.Onboarding.completeStep()
   */
  async completeStep(userId: string, stepId: string, data?: Record<string, any>) {
    // Check if already exists
    const { data: existing } = await this.supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .eq('step_id', stepId)
      .single()

    if (existing) {
      // Update existing
      const { data: updated, error } = await this.supabase
        .from('user_onboarding')
        .update({
          completed_at: new Date().toISOString(),
          skipped_at: null,
          data: data || existing.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return updated as UserOnboarding
    }

    // Create new
    const { data: created, error } = await this.supabase
      .from('user_onboarding')
      .insert({
        user_id: userId,
        step_id: stepId,
        completed_at: new Date().toISOString(),
        data: data || null,
      })
      .select()
      .single()

    if (error) throw error

    // Check if all required steps are complete
    await this.checkAndMarkComplete(userId)

    return created as UserOnboarding
  }

  /**
   * Skip onboarding step
   * Replaces: base44.entities.Onboarding.skipStep()
   */
  async skipStep(userId: string, stepId: string) {
    // Check if step is required
    const { data: step } = await this.supabase
      .from('onboarding_steps')
      .select('is_required')
      .eq('id', stepId)
      .single()

    if (step?.is_required) {
      throw new Error('Cannot skip required step')
    }

    // Check if already exists
    const { data: existing } = await this.supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .eq('step_id', stepId)
      .single()

    if (existing) {
      // Update existing
      const { data: updated, error } = await this.supabase
        .from('user_onboarding')
        .update({
          skipped_at: new Date().toISOString(),
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return updated as UserOnboarding
    }

    // Create new
    const { data: created, error } = await this.supabase
      .from('user_onboarding')
      .insert({
        user_id: userId,
        step_id: stepId,
        skipped_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return created as UserOnboarding
  }

  /**
   * Reset onboarding for user
   */
  async reset(userId: string) {
    const { error } = await this.supabase.from('user_onboarding').delete().eq('user_id', userId)

    if (error) throw error

    // Update profile
    await this.supabase.from('profiles').update({ onboarding_completed: false }).eq('id', userId)
  }

  /**
   * Check and mark onboarding complete
   */
  private async checkAndMarkComplete(userId: string) {
    const progress = await this.getUserProgress(userId)

    if (progress.isComplete) {
      await this.supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId)
    }
  }

  /**
   * Get next incomplete step
   */
  async getNextStep(userId: string): Promise<OnboardingStep | null> {
    const progress = await this.getUserProgress(userId)

    const nextStep = progress.steps.find((s) => s.status === 'pending')
    return nextStep || null
  }

  /**
   * Initialize onboarding for new user
   */
  async initialize(userId: string) {
    // Check if already initialized
    const { data: existing } = await this.supabase
      .from('user_onboarding')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (existing) return

    // Create entries for all steps
    const steps = await this.getSteps()

    const entries = steps.map((step) => ({
      user_id: userId,
      step_id: step.id,
    }))

    const { error } = await this.supabase.from('user_onboarding').insert(entries)

    if (error) throw error
  }

  /**
   * Check if user has completed onboarding
   */
  async isComplete(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()

    return data?.onboarding_completed || false
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService()
