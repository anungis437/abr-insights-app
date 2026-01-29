/**
 * CE Credit Tracking Service
 *
 * Provides functions for tracking and managing Continuing Education credits:
 * - Dashboard data aggregation
 * - Credit history retrieval
 * - Renewal requirement calculations
 * - Expiry tracking and alerts
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface CECreditSummary {
  regulatory_body: string
  total_credits: number
  total_hours: number
  active_certificates: number
  expiring_soon: number
  expiring_soon_credits: number
  categories: {
    category: string
    credits: number
    hours: number
    certificates: number
  }[]
}

export interface ActiveCECredit {
  id: string
  certificate_number: string
  title: string
  issue_date: string
  expiry_date: string | null
  credits: number
  hours: number
  regulatory_body: string
  category: string | null
  days_until_expiry: number | null
  expiring_soon: boolean
  course_title: string | null
}

export interface RenewalAlert {
  regulatory_body: string
  certificates_expiring: number
  credits_at_risk: number
  earliest_expiry: string
  certificates: {
    certificate_id: string
    certificate_number: string
    title: string
    credits: number
    expiry_date: string
    days_remaining: number
  }[]
}

export interface CEDashboardData {
  summary: Record<string, CECreditSummary> | null
  active_credits: ActiveCECredit[] | null
  renewal_alerts: RenewalAlert[] | null
  total_stats: {
    total_certificates: number
    total_credits: number
    total_hours: number
    active_certificates: number
    expired_certificates: number
    regulatory_bodies: number
  } | null
}

export interface CECreditHistory {
  certificate_id: string
  certificate_number: string
  title: string
  course_title: string | null
  issue_date: string
  expiry_date: string | null
  ce_credits: number
  ce_hours: number
  regulatory_body: string
  credit_category: string | null
  status: 'active' | 'expired' | 'revoked'
  days_until_expiry: number | null
  quiz_score: number | null
}

export interface CERequirements {
  regulatory_body: string
  cycle_start: string
  cycle_end: string
  required_credits: number
  earned_credits: number
  remaining_credits: number
  progress_percentage: number
  on_track: boolean
  days_remaining: number
}

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Get comprehensive CE credit dashboard data for a user
 */
export async function getUserCEDashboard(userId: string): Promise<CEDashboardData | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_user_ce_dashboard', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error fetching CE dashboard:', error)
      return null
    }

    return data as CEDashboardData
  } catch (error) {
    console.error('Error in getUserCEDashboard:', error)
    return null
  }
}

/**
 * Get CE credit history for a user
 */
export async function getCECreditHistory(
  userId: string,
  regulatoryBody?: string,
  limit: number = 50
): Promise<CECreditHistory[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_ce_credit_history', {
      p_user_id: userId,
      p_regulatory_body: regulatoryBody || null,
      p_limit: limit,
    })

    if (error) {
      console.error('Error fetching CE credit history:', error)
      return []
    }

    return data as CECreditHistory[]
  } catch (error) {
    console.error('Error in getCECreditHistory:', error)
    return []
  }
}

/**
 * Calculate CE requirements and progress for a regulatory body
 */
export async function calculateCERequirements(
  userId: string,
  regulatoryBody: string,
  cycleStartDate?: string,
  cycleEndDate?: string
): Promise<CERequirements | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('calculate_ce_requirements', {
      p_user_id: userId,
      p_regulatory_body: regulatoryBody,
      p_cycle_start_date: cycleStartDate || null,
      p_cycle_end_date: cycleEndDate || null,
    })

    if (error) {
      console.error('Error calculating CE requirements:', error)
      return null
    }

    return data as CERequirements
  } catch (error) {
    console.error('Error in calculateCERequirements:', error)
    return null
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get CE credit summary by regulatory body
 */
export async function getCECreditSummaryByBody(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('user_ce_credit_summary')
      .select('*')
      .eq('user_id', userId)
      .order('regulatory_body')
      .order('credit_category')

    if (error) {
      console.error('Error fetching CE summary:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getCECreditSummaryByBody:', error)
    return []
  }
}

/**
 * Get active CE credits for a user
 */
export async function getActiveCECredits(userId: string, regulatoryBody?: string) {
  const supabase = await createClient()

  try {
    let query = supabase.from('active_ce_credits').select('*').eq('user_id', userId)

    if (regulatoryBody) {
      query = query.eq('regulatory_body', regulatoryBody)
    }

    const { data, error } = await query.order('days_until_expiry', {
      ascending: true,
      nullsFirst: false,
    })

    if (error) {
      console.error('Error fetching active CE credits:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getActiveCECredits:', error)
    return []
  }
}

/**
 * Get renewal alerts for a user
 */
export async function getCERenewalAlerts(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('ce_credit_renewal_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('earliest_expiry')

    if (error) {
      console.error('Error fetching renewal alerts:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getCERenewalAlerts:', error)
    return []
  }
}

/**
 * Get certificates expiring within a time period
 */
export async function getExpiringCertificates(userId: string, daysAhead: number = 90) {
  const supabase = await createClient()

  try {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    const future = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        certificate_number,
        title,
        issue_date,
        expiry_date,
        ce_credits,
        ce_hours,
        regulatory_body,
        credit_category,
        status,
        course:courses(title)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('ce_credits', 0)
      .not('regulatory_body', 'is', null)
      .not('expiry_date', 'is', null)
      .gte('expiry_date', today)
      .lte('expiry_date', future)
      .order('expiry_date')

    if (error) {
      console.error('Error fetching expiring certificates:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Error in getExpiringCertificates:', error)
    return []
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get list of regulatory bodies a user has earned credits from
 */
export async function getUserRegulatoryBodies(userId: string): Promise<string[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('regulatory_body')
      .eq('user_id', userId)
      .gt('ce_credits', 0)
      .not('regulatory_body', 'is', null)
      .order('regulatory_body')

    if (error) {
      console.error('Error fetching regulatory bodies:', error)
      return []
    }

    // Get unique regulatory bodies
    const bodies = [...new Set(data.map((d) => d.regulatory_body).filter(Boolean))]
    return bodies as string[]
  } catch (error) {
    console.error('Error in getUserRegulatoryBodies:', error)
    return []
  }
}

/**
 * Format CE credit display (e.g., "1.5 credits" or "1 credit")
 */
export function formatCECredits(credits: number): string {
  const creditText = credits === 1 ? 'credit' : 'credits'
  return `${credits.toFixed(1)} ${creditText}`
}

/**
 * Format hours display (e.g., "2.5 hours" or "1 hour")
 */
export function formatHours(hours: number): string {
  const hourText = hours === 1 ? 'hour' : 'hours'
  return `${hours.toFixed(1)} ${hourText}`
}

/**
 * Get expiry status label and color
 */
export function getExpiryStatus(
  expiryDate: string | null,
  status: string
): { label: string; color: string } {
  if (status !== 'active') {
    return { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'gray' }
  }

  if (!expiryDate) {
    return { label: 'No Expiry', color: 'green' }
  }

  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) {
    return { label: 'Expired', color: 'red' }
  } else if (daysUntil <= 30) {
    return { label: `Expires in ${daysUntil} days`, color: 'red' }
  } else if (daysUntil <= 90) {
    return { label: `Expires in ${daysUntil} days`, color: 'orange' }
  } else {
    return { label: `Expires ${expiryDate}`, color: 'green' }
  }
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(earned: number, required: number): number {
  if (required === 0) return 0
  return Math.min(Math.round((earned / required) * 100), 100)
}
