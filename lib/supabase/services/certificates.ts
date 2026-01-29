/**
 * Certificates Service
 * Replaces: base44.entities.Certificate
 * Table: certificates
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type CertificateType = 'course_completion' | 'achievement' | 'custom'

export type Certificate = {
  id: string
  user_id: string
  course_id: string | null
  type: CertificateType
  certificate_number: string
  title: string
  description: string | null
  issued_at: string
  expires_at: string | null
  pdf_url: string | null
  verification_code: string
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
  revoked_at: string | null
}

export type CertificateInsert = Omit<
  Certificate,
  'id' | 'created_at' | 'updated_at' | 'certificate_number' | 'verification_code'
>
export type CertificateUpdate = Partial<CertificateInsert>

export class CertificatesService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get user certificates
   * Replaces: base44.entities.Certificate.getUserCertificates()
   */
  async getUserCertificates(userId: string, options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('certificates')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('issued_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Certificate[], count: count || 0 }
  }

  /**
   * Get certificate by ID
   * Replaces: base44.entities.Certificate.get()
   */
  async get(id: string) {
    const { data, error } = await this.supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Get certificate by verification code
   */
  async getByVerificationCode(code: string) {
    const { data, error } = await this.supabase
      .from('certificates')
      .select('*')
      .eq('verification_code', code)
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Issue certificate
   * Replaces: base44.entities.Certificate.issue()
   */
  async issue(
    userId: string,
    title: string,
    options?: {
      courseId?: string
      type?: CertificateType
      description?: string
      expiresAt?: string
      metadata?: Record<string, any>
    }
  ) {
    // Generate unique certificate number and verification code
    const certificateNumber = await this.generateCertificateNumber()
    const verificationCode = await this.generateVerificationCode()

    const { data, error } = await this.supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: options?.courseId || null,
        type: options?.type || 'course_completion',
        certificate_number: certificateNumber,
        title,
        description: options?.description || null,
        issued_at: new Date().toISOString(),
        expires_at: options?.expiresAt || null,
        verification_code: verificationCode,
        metadata: options?.metadata || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Update certificate
   */
  async update(id: string, updates: CertificateUpdate) {
    const { data, error } = await this.supabase
      .from('certificates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Update certificate PDF URL
   */
  async updatePdfUrl(id: string, pdfUrl: string) {
    const { data, error } = await this.supabase
      .from('certificates')
      .update({
        pdf_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Revoke certificate
   * Replaces: base44.entities.Certificate.revoke()
   */
  async revoke(id: string) {
    const { data, error } = await this.supabase
      .from('certificates')
      .update({
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Certificate
  }

  /**
   * Verify certificate
   */
  async verify(verificationCode: string): Promise<{ valid: boolean; certificate?: Certificate }> {
    try {
      const certificate = await this.getByVerificationCode(verificationCode)

      // Check if revoked
      if (certificate.revoked_at) {
        return { valid: false }
      }

      // Check if expired
      if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
        return { valid: false }
      }

      return { valid: true, certificate }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Get certificate by course
   */
  async getByCourse(userId: string, courseId: string) {
    const { data, error } = await this.supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .is('revoked_at', null)
      .order('issued_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as Certificate | null
  }

  /**
   * Generate unique certificate number
   */
  private async generateCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    return `CERT-${year}-${random}`
  }

  /**
   * Generate verification code
   */
  private async generateVerificationCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Get certificate statistics for user
   */
  async getUserStats(userId: string) {
    const [totalCerts, validCerts, expiredCerts] = await Promise.all([
      this.supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      this.supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('revoked_at', null)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`),
      this.supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString()),
    ])

    return {
      total: totalCerts.count || 0,
      valid: validCerts.count || 0,
      expired: expiredCerts.count || 0,
    }
  }
}

// Export singleton instance
export const certificatesService = new CertificatesService()
