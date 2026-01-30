/**
 * Case Alerts Service
 * Manages saved searches, notifications, and digests for tribunal case updates
 */

import { createClient } from '@/lib/supabase/client'

export interface SavedSearch {
  id: string
  user_id: string
  organization_id: string
  search_name: string
  search_query: string
  search_filters: SearchFilters
  alert_enabled: boolean
  alert_frequency: 'instant' | 'daily' | 'weekly' | 'monthly'
  alert_channels: ('email' | 'in_app' | 'webhook')[]
  last_checked_at?: string
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  keywords?: string[]
  jurisdictions?: string[]
  decision_date_from?: string
  decision_date_to?: string
  case_types?: string[]
  industries?: string[]
  outcomes?: string[]
  relevance_threshold?: number
}

export interface CaseAlert {
  id: string
  saved_search_id: string
  tribunal_case_id: string
  alert_type: 'new_case' | 'case_updated' | 'related_case' | 'digest'
  alert_title: string
  alert_summary: string
  case_title: string
  decision_date: string
  relevance_score: number
  read: boolean
  created_at: string
}

export interface CaseDigest {
  id: string
  organization_id: string
  digest_period_start: string
  digest_period_end: string
  total_cases: number
  high_priority_cases: number
  cases_by_category: Record<string, number>
  key_findings: string[]
  summary: string
  generated_at: string
}

export interface AlertPreferences {
  user_id: string
  email_notifications: boolean
  in_app_notifications: boolean
  webhook_url?: string
  digest_frequency: 'daily' | 'weekly' | 'monthly'
  quiet_hours_start?: string
  quiet_hours_end?: string
  notification_grouping: boolean
}

/**
 * Create a new saved search with alert configuration
 */
export async function createSavedSearch(
  userId: string,
  organizationId: string,
  searchName: string,
  searchQuery: string,
  filters: SearchFilters,
  alertEnabled: boolean = false,
  alertFrequency: SavedSearch['alert_frequency'] = 'daily',
  alertChannels: SavedSearch['alert_channels'] = ['email', 'in_app']
): Promise<SavedSearch> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      search_name: searchName,
      search_query: searchQuery,
      search_filters: filters,
      alert_enabled: alertEnabled,
      alert_frequency: alertFrequency,
      alert_channels: alertChannels,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all saved searches for a user
 */
export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Update saved search configuration
 */
export async function updateSavedSearch(
  searchId: string,
  updates: Partial<SavedSearch>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('saved_searches')
    .update(updates)
    .eq('id', searchId)

  if (error) throw error
}

/**
 * Delete saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId)

  if (error) throw error
}

/**
 * Execute saved search and check for new cases
 */
export async function executeSavedSearch(searchId: string): Promise<CaseAlert[]> {
  const supabase = createClient()

  // Get saved search
  const { data: search, error: searchError } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('id', searchId)
    .single()

  if (searchError) throw searchError

  // Build query based on filters
  let query = supabase
    .from('tribunal_cases')
    .select('*')
    .order('decision_date', { ascending: false })

  // Apply filters
  const filters = search.search_filters as SearchFilters

  if (filters.keywords && filters.keywords.length > 0) {
    // Simple keyword search across title and summary
    const keywordFilter = filters.keywords.map(k => `case_title.ilike.%${k}%`).join(',')
    query = query.or(keywordFilter)
  }

  if (filters.jurisdictions && filters.jurisdictions.length > 0) {
    query = query.in('jurisdiction', filters.jurisdictions)
  }

  if (filters.decision_date_from) {
    query = query.gte('decision_date', filters.decision_date_from)
  }

  if (filters.decision_date_to) {
    query = query.lte('decision_date', filters.decision_date_to)
  }

  // Only get cases since last check
  if (search.last_checked_at) {
    query = query.gt('decision_date', search.last_checked_at)
  }

  const { data: cases, error: casesError } = await query

  if (casesError) throw casesError

  // Create alerts for new cases
  const alerts: CaseAlert[] = []
  for (const tribunalCase of cases || []) {
    const relevanceScore = calculateRelevance(tribunalCase, filters)
    
    if (relevanceScore >= (filters.relevance_threshold || 0.5)) {
      alerts.push({
        id: '', // Will be generated on insert
        saved_search_id: searchId,
        tribunal_case_id: tribunalCase.id,
        alert_type: 'new_case',
        alert_title: `New Case: ${tribunalCase.case_title}`,
        alert_summary: tribunalCase.decision_summary || 'No summary available',
        case_title: tribunalCase.case_title,
        decision_date: tribunalCase.decision_date,
        relevance_score: relevanceScore,
        read: false,
        created_at: new Date().toISOString(),
      })
    }
  }

  // Update last checked timestamp
  await supabase
    .from('saved_searches')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', searchId)

  // Insert alerts if any
  if (alerts.length > 0) {
    const { error: alertsError } = await supabase
      .from('case_alerts')
      .insert(
        alerts.map(a => ({
          saved_search_id: a.saved_search_id,
          tribunal_case_id: a.tribunal_case_id,
          alert_type: a.alert_type,
          alert_title: a.alert_title,
          alert_summary: a.alert_summary,
          case_title: a.case_title,
          decision_date: a.decision_date,
          relevance_score: a.relevance_score,
        }))
      )

    if (alertsError) throw alertsError
  }

  return alerts
}

/**
 * Calculate relevance score based on filters and case content
 */
function calculateRelevance(tribunalCase: any, filters: SearchFilters): number {
  let score = 0.5 // Base score

  // Keyword matching
  if (filters.keywords && filters.keywords.length > 0) {
    const caseText = `${tribunalCase.case_title} ${tribunalCase.decision_summary || ''} ${tribunalCase.keywords?.join(' ') || ''}`.toLowerCase()
    const matchedKeywords = filters.keywords.filter(k => caseText.includes(k.toLowerCase()))
    score += (matchedKeywords.length / filters.keywords.length) * 0.3
  }

  // Jurisdiction match
  if (filters.jurisdictions && filters.jurisdictions.includes(tribunalCase.jurisdiction)) {
    score += 0.1
  }

  // Recent decision (higher relevance)
  const daysSinceDecision = (Date.now() - new Date(tribunalCase.decision_date).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceDecision < 7) score += 0.1
  else if (daysSinceDecision < 30) score += 0.05

  return Math.min(1.0, score)
}

/**
 * Get alerts for a user
 */
export async function getCaseAlerts(
  userId: string,
  unreadOnly: boolean = false,
  limit: number = 50
): Promise<CaseAlert[]> {
  const supabase = createClient()

  let query = supabase
    .from('case_alerts')
    .select(`
      *,
      saved_search:saved_searches(search_name)
    `)
    .eq('saved_searches.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('case_alerts')
    .update({ read: true })
    .eq('id', alertId)

  if (error) throw error
}

/**
 * Mark all alerts as read for a user
 */
export async function markAllAlertsRead(userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('case_alerts')
    .update({ read: true })
    .eq('saved_searches.user_id', userId)

  if (error) throw error
}

/**
 * Generate case digest for organization
 */
export async function generateCaseDigest(
  organizationId: string,
  periodStart: string,
  periodEnd: string
): Promise<CaseDigest> {
  const supabase = createClient()

  // Get all alerts in period
  const { data: alerts, error } = await supabase
    .from('case_alerts')
    .select(`
      *,
      saved_search:saved_searches!inner(organization_id)
    `)
    .eq('saved_searches.organization_id', organizationId)
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd)

  if (error) throw error

  const totalCases = alerts?.length || 0
  const highPriorityCases = alerts?.filter(a => a.relevance_score > 0.8).length || 0

  // Categorize cases
  const casesByCategory: Record<string, number> = {}
  alerts?.forEach(alert => {
    const category = alert.alert_type
    casesByCategory[category] = (casesByCategory[category] || 0) + 1
  })

  // Extract key findings (top 5 high-relevance cases)
  const keyFindings = alerts
    ?.filter(a => a.relevance_score > 0.7)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5)
    .map(a => a.alert_title) || []

  const summary = `${totalCases} new tribunal cases tracked during this period. ${highPriorityCases} cases flagged as high priority based on relevance to your saved searches.`

  const digest: CaseDigest = {
    id: '', // Will be generated
    organization_id: organizationId,
    digest_period_start: periodStart,
    digest_period_end: periodEnd,
    total_cases: totalCases,
    high_priority_cases: highPriorityCases,
    cases_by_category: casesByCategory,
    key_findings: keyFindings,
    summary,
    generated_at: new Date().toISOString(),
  }

  // Save digest
  const { data: savedDigest, error: digestError } = await supabase
    .from('case_digests')
    .insert(digest)
    .select()
    .single()

  if (digestError) throw digestError

  return savedDigest
}

/**
 * Get alert preferences for user
 */
export async function getAlertPreferences(userId: string): Promise<AlertPreferences | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Update alert preferences
 */
export async function updateAlertPreferences(
  userId: string,
  preferences: Partial<AlertPreferences>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('alert_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
    })

  if (error) throw error
}
