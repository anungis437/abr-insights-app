/**
 * Tribunal Cases Service
 * Replaces: base44.entities.TribunalCase
 * Table: tribunal_cases
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type TribunalCase = {
  id: string
  title: string
  case_number: string | null
  decision_date: string | null
  tribunal: string
  decision_type: string | null
  jurisdiction: string | null
  
  // Content
  summary: string | null
  full_text: string | null
  url: string | null
  pdf_url: string | null
  
  // Classification
  is_race_related: boolean
  classification_score: number | null
  classification_method: string | null
  key_themes: string[] | null
  
  // Metadata
  parties_involved: string[] | null
  legal_issues: string[] | null
  outcome: string | null
  remedies: string[] | null
  
  // Relationships
  source_id: string | null
  raw_case_id: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type TribunalCaseInsert = Omit<TribunalCase, 'id' | 'created_at' | 'updated_at'>
export type TribunalCaseUpdate = Partial<TribunalCaseInsert>

export type TribunalCaseFilters = {
  tribunal?: string
  decision_type?: string
  jurisdiction?: string
  is_race_related?: boolean
  year?: number
  search?: string
  themes?: string[]
}

export class TribunalCasesService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * List tribunal cases with optional filters
   * Replaces: base44.entities.TribunalCase.list()
   */
  async list(filters?: TribunalCaseFilters, options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('tribunal_cases')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('decision_date', { ascending: false })

    // Apply filters
    if (filters?.tribunal) {
      query = query.eq('tribunal', filters.tribunal)
    }
    if (filters?.decision_type) {
      query = query.eq('decision_type', filters.decision_type)
    }
    if (filters?.jurisdiction) {
      query = query.eq('jurisdiction', filters.jurisdiction)
    }
    if (filters?.is_race_related !== undefined) {
      query = query.eq('is_race_related', filters.is_race_related)
    }
    if (filters?.year) {
      const startDate = `${filters.year}-01-01`
      const endDate = `${filters.year}-12-31`
      query = query.gte('decision_date', startDate).lte('decision_date', endDate)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`)
    }
    if (filters?.themes && filters.themes.length > 0) {
      query = query.overlaps('key_themes', filters.themes)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as TribunalCase[], count: count || 0 }
  }

  /**
   * Get a single tribunal case by ID
   * Replaces: base44.entities.TribunalCase.get()
   */
  async get(id: string) {
    const { data, error } = await this.supabase
      .from('tribunal_cases')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as TribunalCase
  }

  /**
   * Get a tribunal case by case number
   */
  async getByCaseNumber(caseNumber: string) {
    const { data, error } = await this.supabase
      .from('tribunal_cases')
      .select('*')
      .eq('case_number', caseNumber)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as TribunalCase
  }

  /**
   * Create a new tribunal case
   * Replaces: base44.entities.TribunalCase.create()
   */
  async create(caseData: TribunalCaseInsert) {
    const { data, error } = await this.supabase
      .from('tribunal_cases')
      .insert(caseData)
      .select()
      .single()

    if (error) throw error
    return data as TribunalCase
  }

  /**
   * Update a tribunal case
   * Replaces: base44.entities.TribunalCase.update()
   */
  async update(id: string, updates: TribunalCaseUpdate) {
    const { data, error } = await this.supabase
      .from('tribunal_cases')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as TribunalCase
  }

  /**
   * Soft delete a tribunal case
   * Replaces: base44.entities.TribunalCase.delete()
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('tribunal_cases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Get statistics for dashboard
   */
  async getStats() {
    const { data, error } = await this.supabase.rpc('get_tribunal_case_stats')

    if (error) throw error
    return data
  }

  /**
   * Search tribunal cases with full-text search
   */
  async search(query: string, options?: { limit?: number }) {
    const { data, error } = await this.supabase
      .from('tribunal_cases')
      .select('*')
      .textSearch('fts', query)
      .is('deleted_at', null)
      .limit(options?.limit || 20)

    if (error) throw error
    return data as TribunalCase[]
  }

  /**
   * Get unique values for filters
   */
  async getFilterOptions() {
    const [tribunals, decisionTypes, jurisdictions] = await Promise.all([
      this.supabase.from('tribunal_cases').select('tribunal').is('deleted_at', null),
      this.supabase.from('tribunal_cases').select('decision_type').is('deleted_at', null),
      this.supabase.from('tribunal_cases').select('jurisdiction').is('deleted_at', null),
    ])

    return {
      tribunals: [...new Set(tribunals.data?.map(t => t.tribunal).filter(Boolean))],
      decisionTypes: [...new Set(decisionTypes.data?.map(t => t.decision_type).filter(Boolean))],
      jurisdictions: [...new Set(jurisdictions.data?.map(t => t.jurisdiction).filter(Boolean))],
    }
  }
}

// Export singleton instance
export const tribunalCasesService = new TribunalCasesService()
