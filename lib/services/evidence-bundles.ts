/**
 * Evidence Bundle Service
 * Creates comprehensive compliance evidence packages combining
 * tribunal cases, training records, policies, and audit logs
 */

import { createClient } from '@/lib/supabase/client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import JSZip from 'jszip'
import { createHash } from 'crypto'

// Storage paths
const EVIDENCE_BUNDLES_PATH = 'evidence-bundles'
const COMPLIANCE_ARTIFACTS_PATH = 'compliance-artifacts'

export interface EvidenceBundleMetadata {
  id: string
  organization_id: string
  bundle_name: string
  bundle_type:
    | 'incident_response'
    | 'audit_compliance'
    | 'policy_review'
    | 'training_validation'
    | 'custom'
  created_by: string
  created_at: string
  description?: string
  tags: string[]
  status: 'draft' | 'finalized' | 'archived'
}

export interface EvidenceBundleComponent {
  component_type:
    | 'tribunal_case'
    | 'training_record'
    | 'policy_document'
    | 'audit_log'
    | 'certificate'
    | 'quiz_result'
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
  event_type:
    | 'incident'
    | 'training_completed'
    | 'policy_updated'
    | 'audit_conducted'
    | 'tribunal_decision'
    | 'remediation'
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

  const { error } = await supabase.from('evidence_bundles').update({ status }).eq('id', bundleId)

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
        const courseTitle = Array.isArray(courseData) ? courseData[0]?.title : courseData?.title
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
        const courseTitle = Array.isArray(courseData) ? courseData[0]?.title : courseData?.title
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
  return timeline.sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )
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

  if (exportFormat.format === 'pdf') {
    return await generateEvidencePDF(bundle, exportFormat)
  }

  if (exportFormat.format === 'zip') {
    return await generateEvidenceZIP(bundle, exportFormat)
  }

  throw new Error(`Unsupported export format: ${exportFormat.format}`)
}

/**
 * Generate PDF evidence bundle
 */
async function generateEvidencePDF(
  bundle: EvidenceBundle,
  exportFormat: BundleExportFormat
): Promise<Blob> {
  const doc = new jsPDF()
  const template = exportFormat.template || 'legal'
  let yPosition = 20

  // Title page
  doc.setFontSize(20)
  doc.text('Evidence Bundle', 105, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.text(bundle.bundle_name, 105, yPosition, { align: 'center' })
  yPosition += 7

  doc.setFontSize(10)
  doc.text(`Type: ${bundle.bundle_type}`, 105, yPosition, { align: 'center' })
  yPosition += 7
  doc.text(`Created: ${new Date(bundle.created_at).toLocaleDateString()}`, 105, yPosition, {
    align: 'center',
  })
  yPosition += 7
  doc.text(`Status: ${bundle.status}`, 105, yPosition, { align: 'center' })
  yPosition += 15

  if (bundle.description) {
    doc.setFontSize(9)
    const descLines = doc.splitTextToSize(bundle.description, 170)
    doc.text(descLines, 20, yPosition)
    yPosition += descLines.length * 5 + 10
  }

  // Add metadata section
  doc.addPage()
  yPosition = 20
  doc.setFontSize(14)
  doc.text('Bundle Metadata', 20, yPosition)
  yPosition += 10

  const metadata = [
    ['Bundle ID', bundle.id],
    ['Organization ID', bundle.organization_id],
    ['Created By', bundle.created_by],
    ['Tags', bundle.tags.join(', ')],
    ['Components', bundle.components.length.toString()],
    ['Policy Mappings', bundle.policy_mappings.length.toString()],
    ['Timeline Events', bundle.timeline_events.length.toString()],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Property', 'Value']],
    body: metadata,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
  })

  // Components section
  if (bundle.components.length > 0) {
    doc.addPage()
    yPosition = 20
    doc.setFontSize(14)
    doc.text('Bundle Components', 20, yPosition)
    yPosition += 10

    const componentData = bundle.components.map((c) => [
      c.component_type,
      c.component_title,
      new Date(c.included_at).toLocaleDateString(),
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Type', 'Title', 'Included At']],
      body: componentData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 100 },
        2: { cellWidth: 40 },
      },
    })
  }

  // Policy mappings section
  if (bundle.policy_mappings.length > 0) {
    doc.addPage()
    yPosition = 20
    doc.setFontSize(14)
    doc.text('Policy Mappings', 20, yPosition)
    yPosition += 10

    bundle.policy_mappings.forEach((mapping, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(11)
      doc.text(`${index + 1}. ${mapping.policy_title}`, 20, yPosition)
      yPosition += 7

      doc.setFontSize(9)
      doc.text(`Reference: ${mapping.policy_reference}`, 25, yPosition)
      yPosition += 5
      doc.text(`Status: ${mapping.compliance_status}`, 25, yPosition)
      yPosition += 5

      if (mapping.tribunal_case_title) {
        doc.text(`Case: ${mapping.tribunal_case_title}`, 25, yPosition)
        yPosition += 5
      }

      if (mapping.related_training_title) {
        doc.text(`Training: ${mapping.related_training_title}`, 25, yPosition)
        yPosition += 5
      }

      const rationaleLines = doc.splitTextToSize(mapping.mapping_rationale, 160)
      doc.text(`Rationale: ${rationaleLines[0]}`, 25, yPosition)
      yPosition += 5
      if (rationaleLines.length > 1) {
        doc.text(rationaleLines.slice(1), 25, yPosition)
        yPosition += (rationaleLines.length - 1) * 5
      }

      yPosition += 8
    })
  }

  // Timeline section
  if (bundle.timeline_events.length > 0) {
    doc.addPage()
    yPosition = 20
    doc.setFontSize(14)
    doc.text('Evidence Timeline', 20, yPosition)
    yPosition += 10

    const timelineData = bundle.timeline_events.map((event) => [
      new Date(event.event_date).toLocaleDateString(),
      event.event_type,
      event.event_title,
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Type', 'Event']],
      body: timelineData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 110 },
      },
    })
  }

  // Add footer with metadata and hash
  const pageCount = doc.getNumberOfPages()
  const exportDate = new Date().toISOString()
  const bundleData = JSON.stringify(bundle)
  const bundleHash = createHash('sha256').update(bundleData).digest('hex')

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
    doc.text(`Exported: ${exportDate}`, 20, 290)
    doc.text(`Hash: ${bundleHash.substring(0, 16)}...`, 20, 295)
  }

  return doc.output('blob')
}

/**
 * Generate ZIP evidence bundle with all artifacts
 */
async function generateEvidenceZIP(
  bundle: EvidenceBundle,
  exportFormat: BundleExportFormat
): Promise<Blob> {
  const zip = new JSZip()

  // Add bundle metadata as JSON
  const metadata = {
    ...bundle,
    export_metadata: {
      exported_at: new Date().toISOString(),
      export_format: exportFormat,
      version: '1.0',
    },
  }
  zip.file('bundle-metadata.json', JSON.stringify(metadata, null, 2))

  // Add PDF version
  const pdfBlob = await generateEvidencePDF(bundle, exportFormat)
  zip.file('evidence-bundle.pdf', pdfBlob)

  // Add components manifest
  const componentsManifest = bundle.components.map((c) => ({
    id: c.component_id,
    type: c.component_type,
    title: c.component_title,
    included_at: c.included_at,
    metadata: c.metadata,
  }))
  zip.file('components-manifest.json', JSON.stringify(componentsManifest, null, 2))

  // Add policy mappings
  if (bundle.policy_mappings.length > 0) {
    zip.file('policy-mappings.json', JSON.stringify(bundle.policy_mappings, null, 2))
  }

  // Add timeline
  if (bundle.timeline_events.length > 0) {
    zip.file('timeline.json', JSON.stringify(bundle.timeline_events, null, 2))
  }

  // Add verification file with cryptographic hash
  const bundleData = JSON.stringify(bundle)
  const bundleHash = createHash('sha256').update(bundleData).digest('hex')
  const verification = {
    bundle_id: bundle.id,
    bundle_hash: bundleHash,
    exported_at: new Date().toISOString(),
    component_count: bundle.components.length,
    policy_mapping_count: bundle.policy_mappings.length,
    timeline_event_count: bundle.timeline_events.length,
    verification_instructions:
      'Verify this bundle by recomputing SHA-256 hash of bundle-metadata.json',
  }
  zip.file('verification.json', JSON.stringify(verification, null, 2))

  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

/**
 * Upload evidence bundle to Supabase Storage
 */
export async function uploadEvidenceBundle(
  organizationId: string,
  bundleId: string,
  blob: Blob,
  format: 'pdf' | 'zip' | 'json'
): Promise<{ path: string; url: string }> {
  const supabase = createClient()

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `${bundleId}-${timestamp}.${format}`
  const filePath = `${EVIDENCE_BUNDLES_PATH}/${organizationId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('compliance-artifacts')
    .upload(filePath, blob, {
      contentType:
        format === 'pdf'
          ? 'application/pdf'
          : format === 'zip'
            ? 'application/zip'
            : 'application/json',
      upsert: false,
    })

  if (error) throw error

  // Get public URL (or signed URL for private buckets)
  const { data: urlData } = supabase.storage.from('compliance-artifacts').getPublicUrl(filePath)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Generate and upload evidence bundle
 */
export async function exportAndUploadEvidenceBundle(
  bundleId: string,
  exportFormat: BundleExportFormat
): Promise<{ blob: Blob; storage: { path: string; url: string } }> {
  const bundle = await getEvidenceBundle(bundleId)
  const blob = await exportEvidenceBundle(bundleId, exportFormat)

  const storage = await uploadEvidenceBundle(
    bundle.organization_id,
    bundleId,
    blob,
    exportFormat.format
  )

  // Update bundle metadata with storage reference
  const supabase = createClient()
  await supabase
    .from('evidence_bundles')
    .update({
      metadata: {
        last_export: {
          format: exportFormat.format,
          exported_at: new Date().toISOString(),
          storage_path: storage.path,
          storage_url: storage.url,
        },
      },
    })
    .eq('id', bundleId)

  return { blob, storage }
}
