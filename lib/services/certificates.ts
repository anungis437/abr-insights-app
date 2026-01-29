/**
 * Certificate Service
 *
 * Handles certificate generation, verification, and digital badge issuance.
 * Supports Open Badges 2.0 standard for portable digital credentials.
 */

import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'

// ============================================================================
// TYPES
// ============================================================================

export type CertificateType =
  | 'completion'
  | 'certification'
  | 'ce_credit'
  | 'achievement'
  | 'participation'
export type CertificateStatus = 'active' | 'revoked' | 'expired' | 'pending'
export type BadgeStatus = 'issued' | 'revoked' | 'expired'

export interface CertificateTemplate {
  id: string
  name: string
  description?: string
  template_type: CertificateType
  layout_json: any
  styles_json: any
  background_image_url?: string
  logo_url?: string
  title_template: string
  body_template?: string
  signature_fields: any[]
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id?: string
  quiz_attempt_id?: string
  template_id?: string
  certificate_number: string
  certificate_type: CertificateType
  status: CertificateStatus
  title: string
  recipient_name: string
  description?: string
  issue_date: string
  expiry_date?: string
  ce_credits?: number
  ce_hours?: number
  regulatory_body?: string
  credit_category?: string
  qr_code_data?: string
  verification_url?: string
  blockchain_hash?: string
  pdf_url?: string
  pdf_file_path?: string
  thumbnail_url?: string
  badge_id?: string
  signatures?: any[]
  approved_by?: string
  approved_at?: string
  approval_notes?: string
  revoked_by?: string
  revoked_at?: string
  revocation_reason?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DigitalBadge {
  id: string
  certificate_id: string
  user_id: string
  badge_class_id: string
  assertion_id: string
  name: string
  description: string
  image_url: string
  criteria_url?: string
  issuer_name: string
  issuer_url: string
  issuer_email?: string
  issuer_image_url?: string
  recipient_identity: string
  recipient_type: string
  recipient_hashed: boolean
  status: BadgeStatus
  issued_on: string
  expires_on?: string
  evidence_url?: string
  verification_url?: string
  assertion_url?: string
  badge_assertion_json: any
  revoked_at?: string
  revocation_reason?: string
  tags?: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CertificateWithRelations extends Certificate {
  course?: {
    id: string
    title: string
    slug: string
  }
  quiz_attempt?: {
    id: string
    score: number
    passed: boolean
  }
  template?: CertificateTemplate
  badge?: DigitalBadge
}

// ============================================================================
// CERTIFICATE TEMPLATES
// ============================================================================

/**
 * Get all active certificate templates
 */
export async function getCertificateTemplates(
  type?: CertificateType
): Promise<CertificateTemplate[]> {
  const supabase = createClient()

  let query = supabase.from('certificate_templates').select('*').eq('is_active', true).order('name')

  if (type) {
    query = query.eq('template_type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as CertificateTemplate[]
}

/**
 * Get default template for a certificate type
 */
export async function getDefaultTemplate(
  type: CertificateType
): Promise<CertificateTemplate | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
    .eq('template_type', type)
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as CertificateTemplate
}

/**
 * Get template by ID
 */
export async function getTemplate(templateId: string): Promise<CertificateTemplate | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) return null
  return data as CertificateTemplate
}

// ============================================================================
// CERTIFICATE CREATION
// ============================================================================

export interface CreateCertificateInput {
  user_id: string
  course_id?: string
  quiz_attempt_id?: string
  template_id?: string
  certificate_type?: CertificateType
  title: string
  recipient_name: string
  description?: string
  issue_date?: string
  expiry_date?: string
  ce_credits?: number
  ce_hours?: number
  regulatory_body?: string
  credit_category?: string
  signatures?: any[]
  metadata?: Record<string, any>
}

/**
 * Create a new certificate
 */
export async function createCertificate(input: CreateCertificateInput): Promise<Certificate> {
  const supabase = createClient()

  // Generate certificate number
  const { data: certNumber, error: numberError } = await supabase.rpc(
    'generate_certificate_number',
    {
      cert_type: input.certificate_type || 'completion',
    }
  )

  if (numberError) throw numberError

  // Generate verification URL and QR code
  const verification_url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/certificates/verify/${certNumber}`

  let qr_code_data: string | undefined
  try {
    qr_code_data = await QRCode.toDataURL(verification_url, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }

  // Insert certificate
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      user_id: input.user_id,
      course_id: input.course_id,
      quiz_attempt_id: input.quiz_attempt_id,
      template_id: input.template_id,
      certificate_number: certNumber,
      certificate_type: input.certificate_type || 'completion',
      status: 'active',
      title: input.title,
      recipient_name: input.recipient_name,
      description: input.description,
      issue_date: input.issue_date || new Date().toISOString().split('T')[0],
      expiry_date: input.expiry_date,
      ce_credits: input.ce_credits,
      ce_hours: input.ce_hours,
      regulatory_body: input.regulatory_body,
      credit_category: input.credit_category,
      qr_code_data,
      verification_url,
      signatures: input.signatures || [],
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data as Certificate
}

/**
 * Create certificate from quiz completion
 */
export async function createCertificateFromQuiz(
  userId: string,
  quizAttemptId: string,
  recipientName: string,
  options?: {
    ce_credits?: number
    ce_hours?: number
    regulatory_body?: string
    credit_category?: string
  }
): Promise<Certificate> {
  const supabase = createClient()

  // Get quiz attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select(
      `
      *,
      quiz:quizzes(
        *,
        lesson:lessons(
          *,
          course:courses(*)
        )
      )
    `
    )
    .eq('id', quizAttemptId)
    .single()

  if (attemptError) throw attemptError
  if (!attempt.passed) {
    throw new Error('Cannot issue certificate for failed quiz attempt')
  }

  const quiz = attempt.quiz as any
  const course = quiz?.lesson?.course

  if (!course) {
    throw new Error('Course information not found for quiz')
  }

  // Determine certificate type
  const certificate_type: CertificateType =
    quiz.quiz_type === 'certification'
      ? 'certification'
      : options?.ce_credits
        ? 'ce_credit'
        : 'completion'

  // Get default template for this type
  const template = await getDefaultTemplate(certificate_type)

  return createCertificate({
    user_id: userId,
    course_id: course.id,
    quiz_attempt_id: quizAttemptId,
    template_id: template?.id,
    certificate_type,
    title: `Certificate of ${certificate_type === 'certification' ? 'Certification' : 'Completion'}`,
    recipient_name: recipientName,
    description: `Successfully completed ${course.title} with a score of ${attempt.score}%`,
    ce_credits: options?.ce_credits,
    ce_hours: options?.ce_hours,
    regulatory_body: options?.regulatory_body,
    credit_category: options?.credit_category,
    metadata: {
      quiz_title: quiz.title,
      quiz_type: quiz.quiz_type,
      score: attempt.score,
      passing_score: quiz.passing_score,
      completion_date: attempt.completed_at,
    },
  })
}

// ============================================================================
// CERTIFICATE RETRIEVAL
// ============================================================================

/**
 * Get certificate by ID
 */
export async function getCertificate(
  certificateId: string,
  includeRelations = false
): Promise<CertificateWithRelations | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(
      includeRelations
        ? `
      *,
      course:courses(id, title, slug),
      quiz_attempt:quiz_attempts(id, score, passed),
      template:certificate_templates(*),
      badge:digital_badges(*)
    `
        : '*'
    )
    .eq('id', certificateId)
    .single()

  if (error) return null
  return data as any as CertificateWithRelations
}

/**
 * Get certificate by number
 */
export async function getCertificateByNumber(
  certificateNumber: string
): Promise<CertificateWithRelations | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      *,
      course:courses(id, title, slug),
      template:certificate_templates(*)
    `
    )
    .eq('certificate_number', certificateNumber)
    .single()

  if (error) return null
  return data as any as CertificateWithRelations
}

/**
 * Get user certificates
 */
export async function getUserCertificates(
  userId: string,
  filters?: {
    course_id?: string
    certificate_type?: CertificateType
    status?: CertificateStatus
  }
): Promise<CertificateWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('certificates')
    .select(
      `
      *,
      course:courses(id, title, slug),
      template:certificate_templates(name)
    `
    )
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })

  if (filters?.course_id) {
    query = query.eq('course_id', filters.course_id)
  }
  if (filters?.certificate_type) {
    query = query.eq('certificate_type', filters.certificate_type)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as any as CertificateWithRelations[]
}

/**
 * Get course certificates
 */
export async function getCourseCertificates(
  courseId: string,
  filters?: {
    status?: CertificateStatus
    limit?: number
  }
): Promise<Certificate[]> {
  const supabase = createClient()

  let query = supabase
    .from('certificates')
    .select('*')
    .eq('course_id', courseId)
    .order('issue_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as Certificate[]
}

// ============================================================================
// CERTIFICATE VERIFICATION
// ============================================================================

export interface VerificationResult {
  valid: boolean
  certificate?: CertificateWithRelations
  reason?: string
  warnings?: string[]
}

/**
 * Verify certificate by number
 */
export async function verifyCertificate(certificateNumber: string): Promise<VerificationResult> {
  const certificate = await getCertificateByNumber(certificateNumber)

  if (!certificate) {
    return {
      valid: false,
      reason: 'Certificate not found',
    }
  }

  const warnings: string[] = []

  // Check status
  if (certificate.status === 'revoked') {
    return {
      valid: false,
      certificate,
      reason: `Certificate revoked${certificate.revocation_reason ? `: ${certificate.revocation_reason}` : ''}`,
    }
  }

  if (certificate.status === 'expired') {
    return {
      valid: false,
      certificate,
      reason: 'Certificate has expired',
    }
  }

  if (certificate.status === 'pending') {
    return {
      valid: false,
      certificate,
      reason: 'Certificate is pending approval',
    }
  }

  // Check expiry date
  if (certificate.expiry_date) {
    const expiryDate = new Date(certificate.expiry_date)
    const now = new Date()

    if (expiryDate < now) {
      return {
        valid: false,
        certificate,
        reason: `Certificate expired on ${expiryDate.toLocaleDateString()}`,
      }
    }

    // Warn if expiring soon (within 30 days)
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilExpiry <= 30) {
      warnings.push(`Certificate expires in ${daysUntilExpiry} days`)
    }
  }

  return {
    valid: true,
    certificate,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

// ============================================================================
// CERTIFICATE MANAGEMENT
// ============================================================================

/**
 * Revoke certificate
 */
export async function revokeCertificate(
  certificateId: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('certificates')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      revocation_reason: reason,
    })
    .eq('id', certificateId)

  if (error) throw error

  // Also revoke associated badge if exists
  await supabase
    .from('digital_badges')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revocation_reason: reason,
    })
    .eq('certificate_id', certificateId)
}

/**
 * Update certificate PDF URL
 */
export async function updateCertificatePDF(
  certificateId: string,
  pdf_url: string,
  pdf_file_path: string,
  thumbnail_url?: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('certificates')
    .update({
      pdf_url,
      pdf_file_path,
      thumbnail_url,
    })
    .eq('id', certificateId)

  if (error) throw error
}

// ============================================================================
// DIGITAL BADGES (Open Badges 2.0)
// ============================================================================

export interface CreateBadgeInput {
  certificate_id: string
  user_id: string
  badge_class_id: string
  name: string
  description: string
  image_url: string
  criteria_url?: string
  issuer_name: string
  issuer_url: string
  issuer_email?: string
  issuer_image_url?: string
  recipient_identity: string
  recipient_type?: string
  recipient_hashed?: boolean
  evidence_url?: string
  expires_on?: string
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * Create digital badge (Open Badges 2.0)
 */
export async function createDigitalBadge(input: CreateBadgeInput): Promise<DigitalBadge> {
  const supabase = createClient()

  // Generate assertion ID
  const { data: assertionId, error: assertionError } = await supabase.rpc(
    'generate_badge_assertion_id'
  )

  if (assertionError) throw assertionError

  const assertion_url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/badges/${assertionId}`
  const verification_url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/badges/verify/${assertionId}`

  // Build Open Badges 2.0 assertion
  const badge_assertion_json = {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Assertion',
    id: assertion_url,
    badge: {
      type: 'BadgeClass',
      id: input.badge_class_id,
      name: input.name,
      description: input.description,
      image: input.image_url,
      criteria:
        input.criteria_url ||
        `${process.env.NEXT_PUBLIC_APP_URL}/badges/criteria/${input.badge_class_id}`,
      issuer: {
        type: 'Profile',
        id: input.issuer_url,
        name: input.issuer_name,
        email: input.issuer_email,
        image: input.issuer_image_url,
      },
    },
    recipient: {
      type: input.recipient_type || 'email',
      identity: input.recipient_identity,
      hashed: input.recipient_hashed !== false,
    },
    issuedOn: new Date().toISOString(),
    expires: input.expires_on,
    evidence: input.evidence_url,
    verification: {
      type: 'hosted',
      url: verification_url,
    },
  }

  // Insert badge
  const { data, error } = await supabase
    .from('digital_badges')
    .insert({
      certificate_id: input.certificate_id,
      user_id: input.user_id,
      badge_class_id: input.badge_class_id,
      assertion_id: assertionId,
      name: input.name,
      description: input.description,
      image_url: input.image_url,
      criteria_url: input.criteria_url,
      issuer_name: input.issuer_name,
      issuer_url: input.issuer_url,
      issuer_email: input.issuer_email,
      issuer_image_url: input.issuer_image_url,
      recipient_identity: input.recipient_identity,
      recipient_type: input.recipient_type || 'email',
      recipient_hashed: input.recipient_hashed !== false,
      status: 'issued',
      evidence_url: input.evidence_url,
      verification_url,
      assertion_url,
      badge_assertion_json,
      expires_on: input.expires_on,
      tags: input.tags || [],
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data as DigitalBadge
}

/**
 * Get badge by assertion ID
 */
export async function getBadgeByAssertion(assertionId: string): Promise<DigitalBadge | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('digital_badges')
    .select('*')
    .eq('assertion_id', assertionId)
    .single()

  if (error) return null
  return data as DigitalBadge
}

/**
 * Get certificate badges
 */
export async function getCertificateBadges(certificateId: string): Promise<DigitalBadge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('digital_badges')
    .select('*')
    .eq('certificate_id', certificateId)
    .order('issued_on', { ascending: false })

  if (error) throw error
  return (data || []) as DigitalBadge[]
}

/**
 * Get user badges
 */
export async function getUserBadges(
  userId: string,
  filters?: {
    status?: BadgeStatus
  }
): Promise<DigitalBadge[]> {
  const supabase = createClient()

  let query = supabase
    .from('digital_badges')
    .select('*')
    .eq('user_id', userId)
    .order('issued_on', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error
  return (data || []) as DigitalBadge[]
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get certificate statistics for a user
 */
export async function getUserCertificateStats(userId: string): Promise<{
  total: number
  by_type: Record<CertificateType, number>
  by_status: Record<CertificateStatus, number>
  total_ce_credits: number
  total_ce_hours: number
}> {
  const certificates = await getUserCertificates(userId)

  const stats = {
    total: certificates.length,
    by_type: {
      completion: 0,
      certification: 0,
      ce_credit: 0,
      achievement: 0,
      participation: 0,
    } as Record<CertificateType, number>,
    by_status: {
      active: 0,
      revoked: 0,
      expired: 0,
      pending: 0,
    } as Record<CertificateStatus, number>,
    total_ce_credits: 0,
    total_ce_hours: 0,
  }

  certificates.forEach((cert) => {
    stats.by_type[cert.certificate_type] = (stats.by_type[cert.certificate_type] || 0) + 1
    stats.by_status[cert.status] = (stats.by_status[cert.status] || 0) + 1

    if (cert.ce_credits) {
      stats.total_ce_credits += Number(cert.ce_credits)
    }
    if (cert.ce_hours) {
      stats.total_ce_hours += Number(cert.ce_hours)
    }
  })

  return stats
}
