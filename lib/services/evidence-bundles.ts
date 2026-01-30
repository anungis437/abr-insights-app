/**
 * Evidence Bundle Service
 * Creates comprehensive compliance evidence packages combining
 * tribunal cases, training records, policies, and audit logs
 */

import { createClient } from '@/lib/supabase/client'

export interface EvidenceBundleMetadata {
  id: string
  organization_id: string
  bundle_name: string
  bundle_type: 'incident_response' | 'audit_compliance' | 'policy_review' | 'training_validation' | 'custom'
  created_by: string
  created_at: string
  description?: string
  tags: string[]
  status: 'draft' | 'finalized' | 'archived'
}

export interface EvidenceBundleComponent {
  component_type: 'tribunal_case' | 'training_record' | 'policy_document' | 'audit_log' | 'certificate' | 'quiz_result'
  component_id: string
  component_title: string
  included_at: string
  metadata?: Record<string, any>
}

export interface EvidenceBundle extends EvidenceBundleMetadata {
  components: EvidenceBundleComponent[]
  policy_mappings: PolicyMapping[]
  timeline_events: TimelineEvent[]
}

export interface PolicyMapping {
  tribunal_case_id?: string
  tribunal_case_title?: string
  related_training_id?: string
  related_training_title?: string
  policy_reference: string
  policy_title: string
  mapping_rationale: string
  compliance_status: 'compliant' | 'non_compliant' | 'under_review'
}

export interface TimelineEvent {
  event_date: string
  event_type: 'incident' | 'training_completed' | 'policy_updated' | 'audit_conducted' | 'tribunal_decision' | 'remediation'
  event_title: string
  event_description: string
  related_component_id?: string
  related_component_type?: string
}

export interface BundleExportFormat {
  format: 'pdf' | 'zip' | 'json'
  include_attachments: boolean
  include_raw_data: boolean
  template?: 'executive' | 'legal' | 'audit' | 'technical'
}

/**
 * Create a new evidence bundle
 */
export async function createEvidenceBundle(
  organizationId: string,
  bundleName: string,
  bundleType: EvidenceBundleMetadata['bundle_type'],
  createdBy: string,
  description?: string,
  tags: string[] = []
): Promise<EvidenceBundleMetadata> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('evidence_bundles')
    .insert({
      organization_id: organizationId,
      bundle_name: bundleName,
      bundle_type: bundleType,
      created_by: createdBy,
      description,
      tags,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Add component to evidence bundle
 */
export async function addComponentToBundle(
  bundleId: string,
  componentType: EvidenceBundleComponent['component_type'],
  componentId: string,
  componentTitle: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('evidence_bundle_components').insert({
    bundle_id: bundleId,
    component_type: componentType,
    component_id: componentId,
    component_title: componentTitle,
    metadata,
  })

  if (error) throw error
}

/**
 * Create policy mapping
 */
export async function createPolicyMapping(
  bundleId: string,
  mapping: Omit<PolicyMapping, 'id'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('evidence_bundle_policy_mappings').insert({
    bundle_id: bundleId,
    ...mapping,
  })

  if (error) throw error
}

/**
 * Add timeline event to bundle
 */
export async function addTimelineEvent(
  bundleId: string,
  event: Omit<TimelineEvent, 'id'>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('evidence_bundle_timeline').insert({
    bundle_id: bundleId,
    ...event,
  })

  if (error) throw error
}

/**
 * Get full evidence bundle with all components
 */
export async function getEvidenceBundle(bundleId: string): Promise<EvidenceBundle> {
  const supabase = createClient()

  // Get bundle metadata
  const { data: bundle, error: bundleError } = await supabase
    .from('evidence_bundles')
    .select('*')
    .eq('id', bundleId)
    .single()

  if (bundleError) throw bundleError

  // Get components
  const { data: components, error: componentsError } = await supabase
    .from('evidence_bundle_components')
    .select('*')
    .eq('bundle_id', bundleId)
    .order('included_at', { ascending: true })

  if (componentsError) throw componentsError

  // Get policy mappings
  const { data: policyMappings, error: mappingsError } = await supabase
    .from('evidence_bundle_policy_mappings')
    .select('*')
    .eq('bundle_id', bundleId)

  if (mappingsError) throw mappingsError

  // Get timeline events
  const { data: timeline, error: timelineError } = await supabase
    .from('evidence_bundle_timeline')
    .select('*')
    .eq('bundle_id', bundleId)
    .order('event_date', { ascending: true })

  if (timelineError) throw timelineError

  return {
    ...bundle,
    components: components || [],
    policy_mappings: policyMappings || [],
    timeline_events: timeline || [],
  }
}

/**
 * List evidence bundles for organization
 */
export async function listEvidenceBundles(
  organizationId: string,
  status?: EvidenceBundleMetadata['status']
): Promise<EvidenceBundleMetadata[]> {
  const supabase = createClient()

  let query = supabase
    .from('evidence_bundles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Update bundle status
 */
export async function updateBundleStatus(
  bundleId: string,
  status: EvidenceBundleMetadata['status']
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('evidence_bundles')
    .update({ status })
    .eq('id', bundleId)

  if (error) throw error
}

/**
 * Generate suggested policy mappings based on tribunal case
 */
export async function generatePolicyMappings(
  organizationId: string,
  tribunalCaseId: string
): Promise<PolicyMapping[]> {
  const supabase = createClient()

  // Get tribunal case details
  const { data: tribunalCase, error: caseError } = await supabase
    .from('tribunal_cases')
    .select('*')
    .eq('id', tribunalCaseId)
    .single()

  if (caseError) throw caseError

  // Get organization's training courses
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, description, category')
    .eq('organization_id', organizationId)

  if (coursesError) throw coursesError

  const mappings: PolicyMapping[] = []

  // Simple keyword matching for suggestions
  const caseKeywords = [
    ...(tribunalCase.case_title?.toLowerCase().split(' ') || []),
    ...(tribunalCase.decision_summary?.toLowerCase().split(' ') || []),
    ...(tribunalCase.keywords || []).map((k: string) => k.toLowerCase()),
  ]

  courses?.forEach((course) => {
    const courseKeywords = [
      ...(course.title?.toLowerCase().split(' ') || []),
      ...(course.description?.toLowerCase().split(' ') || []),
      course.category?.toLowerCase(),
    ]

    // Check for keyword overlap
    const overlap = caseKeywords.filter((k) => courseKeywords.some((ck) => ck?.includes(k)))

    if (overlap.length > 2) {
      mappings.push({
        tribunal_case_id: tribunalCaseId,
        tribunal_case_title: tribunalCase.case_title,
        related_training_id: course.id,
        related_training_title: course.title,
        policy_reference: `${course.category}-POLICY`,
        policy_title: `${course.category} Compliance Policy`,
        mapping_rationale: `Training addresses key issues identified in tribunal case: ${overlap.slice(0, 3).join(', ')}`,
        compliance_status: 'under_review',
      })
    }
  })

  return mappings
}

/**
 * Build timeline from bundle components
 */
export async function buildEvidenceTimeline(bundleId: string): Promise<TimelineEvent[]> {
  const supabase = createClient()

  const { data: components, error } = await supabase
    .from('evidence_bundle_components')
    .select('*')
    .eq('bundle_id', bundleId)

  if (error) throw error

  const timeline: TimelineEvent[] = []

  // Fetch details for each component and create timeline events
  for (const component of components || []) {
    if (component.component_type === 'tribunal_case') {
      const { data: tribunalCase } = await supabase
        .from('tribunal_cases')
        .select('decision_date, case_title, decision_summary')
        .eq('id', component.component_id)
        .single()

      if (tribunalCase) {
        timeline.push({
          event_date: tribunalCase.decision_date,
          event_type: 'tribunal_decision',
          event_title: `Tribunal Decision: ${tribunalCase.case_title}`,
          event_description: tribunalCase.decision_summary || 'Tribunal case decision issued',
          related_component_id: component.component_id,
          related_component_type: 'tribunal_case',
        })
      }
    } else if (component.component_type === 'training_record') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('completed_at, course:courses(title)')
        .eq('id', component.component_id)
        .single()

      if (enrollment?.completed_at) {
        const courseData = enrollment.course as any
        const courseTitle = Array.isArray(courseData) 
          ? courseData[0]?.title 
          : courseData?.title
        timeline.push({
          event_date: enrollment.completed_at,
          event_type: 'training_completed',
          event_title: `Training Completed: ${courseTitle || 'Unknown Course'}`,
          event_description: 'Employee completed required training',
          related_component_id: component.component_id,
          related_component_type: 'training_record',
        })
      }
    } else if (component.component_type === 'certificate') {
      const { data: certificate } = await supabase
        .from('certificates')
        .select('issued_at, course:courses(title)')
        .eq('id', component.component_id)
        .single()

      if (certificate?.issued_at) {
        const courseData = certificate.course as any
        const courseTitle = Array.isArray(courseData)
          ? courseData[0]?.title
          : courseData?.title
        timeline.push({
          event_date: certificate.issued_at,
          event_type: 'training_completed',
          event_title: `Certificate Issued: ${courseTitle || 'Unknown Course'}`,
          event_description: 'Completion certificate issued',
          related_component_id: component.component_id,
          related_component_type: 'certificate',
        })
      }
    }
  }

  // Sort by date
  return timeline.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
}

/**
 * Export evidence bundle in specified format
 */
export async function exportEvidenceBundle(
  bundleId: string,
  exportFormat: BundleExportFormat
): Promise<Blob> {
  const bundle = await getEvidenceBundle(bundleId)

  if (exportFormat.format === 'json') {
    const json = JSON.stringify(bundle, null, 2)
    return new Blob([json], { type: 'application/json' })
  }

  // For PDF/ZIP, return a structured data blob
  // In production, this would use a PDF library or zip utility
  const data = {
    ...bundle,
    export_format: exportFormat,
    exported_at: new Date().toISOString(),
  }

  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
}
