/**
 * Compliance Reports Service
 *
 * Generates compliance reports for audit logs
 * Supports scheduled and on-demand reporting
 * Multiple export formats (PDF, CSV, JSON, XLSX)
 *
 * @module lib/services/compliance-reports
 */

import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { parse } from 'papaparse'
import { createHash } from 'crypto'

// Report types
type ReportType =
  | 'audit_summary'
  | 'security_incidents'
  | 'data_access'
  | 'user_activity'
  | 'compliance_check'
  | 'custom'

// Report formats
type ReportFormat = 'pdf' | 'csv' | 'json' | 'xlsx'

// Report parameters
interface ReportParams {
  organizationId: string
  reportType: ReportType
  startDate: Date
  endDate: Date
  filters?: {
    eventCategory?: string[]
    complianceLevel?: string[]
    userId?: string
    resourceType?: string
    severity?: string[]
  }
  includeAnomalies?: boolean
}

// Report generation result
interface ReportResult {
  reportId: string
  reportUrl?: string
  statistics: {
    totalEvents: number
    eventsByCategory: Record<string, number>
    eventsBySeverity: Record<string, number>
    uniqueUsers: number
    anomaliesDetected: number
  }
}

/**
 * Generate compliance report
 *
 * Creates report in compliance_reports table
 * Returns statistics and report ID
 */
export async function generateReport(
  params: ReportParams,
  generatedBy: string,
  format: ReportFormat = 'pdf'
): Promise<ReportResult> {
  const supabase = await createClient()

  try {
    // Get audit log statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_audit_log_statistics', {
      p_organization_id: params.organizationId,
      p_start_date: params.startDate.toISOString(),
      p_end_date: params.endDate.toISOString(),
    })

    if (statsError) {
      throw new Error(`Failed to get statistics: ${statsError.message}`)
    }

    // Detect anomalies if requested
    let anomalies: unknown[] = []
    if (params.includeAnomalies) {
      const { data: anomalyData, error: anomalyError } = await supabase.rpc(
        'detect_audit_anomalies',
        {
          p_organization_id: params.organizationId,
          p_start_date: params.startDate.toISOString(),
          p_end_date: params.endDate.toISOString(),
        }
      )

      if (!anomalyError && anomalyData) {
        anomalies = anomalyData as unknown[]
      }
    }

    // Query audit logs based on filters
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', params.organizationId)
      .gte('created_at', params.startDate.toISOString())
      .lte('created_at', params.endDate.toISOString())

    if (params.filters?.eventCategory) {
      query = query.in('event_category', params.filters.eventCategory)
    }
    if (params.filters?.complianceLevel) {
      query = query.in('compliance_level', params.filters.complianceLevel)
    }
    if (params.filters?.userId) {
      query = query.eq('user_id', params.filters.userId)
    }
    if (params.filters?.resourceType) {
      query = query.eq('resource_type', params.filters.resourceType)
    }
    if (params.filters?.severity) {
      query = query.in('severity', params.filters.severity)
    }

    const { data: logs, error: logsError } = await query.order('created_at', {
      ascending: false,
    })

    if (logsError) {
      throw new Error(`Failed to fetch logs: ${logsError.message}`)
    }

    // Create report record
    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .insert({
        organization_id: params.organizationId,
        report_type: params.reportType,
        start_date: params.startDate.toISOString(),
        end_date: params.endDate.toISOString(),
        generated_by: generatedBy,
        format,
        filters: params.filters || {},
        event_count: logs?.length || 0,
        anomaly_count: anomalies.length,
        summary: stats || {},
        status: 'completed',
      })
      .select()
      .single()

    if (reportError) {
      throw new Error(`Failed to create report: ${reportError.message}`)
    }

    // Parse statistics
    const statistics = {
      totalEvents: logs?.length || 0,
      eventsByCategory: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      uniqueUsers: new Set(logs?.map((log) => log.user_id).filter(Boolean)).size,
      anomaliesDetected: anomalies.length,
    }

    // Count by category
    logs?.forEach((log) => {
      const category = log.event_category || 'unknown'
      statistics.eventsByCategory[category] = (statistics.eventsByCategory[category] || 0) + 1

      const severity = log.severity || 'info'
      statistics.eventsBySeverity[severity] = (statistics.eventsBySeverity[severity] || 0) + 1
    })

    return {
      reportId: report.id,
      statistics,
    }
  } catch (error) {
    console.error('[Compliance Reports] Generate error:', error)
    throw error
  }
}

/**
 * Schedule recurring report
 *
 * Creates compliance report with recurrence schedule
 */
export async function scheduleReport(
  params: ReportParams,
  scheduledBy: string,
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  format: ReportFormat = 'pdf'
): Promise<string> {
  const supabase = await createClient()

  try {
    // Create scheduled report
    const { data: report, error } = await supabase
      .from('compliance_reports')
      .insert({
        organization_id: params.organizationId,
        report_type: params.reportType,
        start_date: params.startDate.toISOString(),
        end_date: params.endDate.toISOString(),
        generated_by: scheduledBy,
        format,
        filters: params.filters || {},
        status: 'scheduled',
        // Store schedule in summary
        summary: {
          schedule,
          nextRun: getNextRunDate(schedule),
        },
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to schedule report: ${error.message}`)
    }

    return report.id
  } catch (error) {
    console.error('[Compliance Reports] Schedule error:', error)
    throw error
  }
}

/**
 * Export report to file
 *
 * Creates audit_log_exports record with approval workflow
 */
export async function exportReport(
  reportId: string,
  requestedBy: string,
  format: ReportFormat = 'pdf',
  reason?: string
): Promise<{ exportId: string; requiresApproval: boolean }> {
  const supabase = await createClient()

  try {
    // Get report
    const { data: report, error: reportError } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      throw new Error('Report not found')
    }

    // Determine if approval required (high/critical compliance events)
    const requiresApproval =
      report.filters?.complianceLevel?.some(
        (level: string) => level === 'high' || level === 'critical'
      ) ?? false

    // Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('audit_log_exports')
      .insert({
        organization_id: report.organization_id,
        requested_by: requestedBy,
        start_date: report.start_date,
        end_date: report.end_date,
        format,
        filters: report.filters || {},
        export_reason: reason,
        approval_status: requiresApproval ? 'pending' : 'approved',
        approved_by: requiresApproval ? null : requestedBy,
        approved_at: requiresApproval ? null : new Date().toISOString(),
        event_count: report.event_count,
      })
      .select()
      .single()

    if (exportError) {
      throw new Error(`Failed to create export: ${exportError.message}`)
    }

    return {
      exportId: exportRecord.id,
      requiresApproval,
    }
  } catch (error) {
    console.error('[Compliance Reports] Export error:', error)
    throw error
  }
}

/**
 * Approve export request
 *
 * Marks export as approved and generates download URL
 */
export async function approveExport(
  exportId: string,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Update export status
    const { error } = await supabase
      .from('audit_log_exports')
      .update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', exportId)

    if (error) {
      return {
        success: false,
        error: 'Failed to approve export',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Compliance Reports] Approve export error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get report details
 */
export async function getReport(reportId: string): Promise<unknown> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error) {
    throw new Error(`Failed to get report: ${error.message}`)
  }

  return data
}

/**
 * List reports for organization
 */
export async function listReports(organizationId: string, limit = 50): Promise<unknown[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to list reports: ${error.message}`)
  }

  return data || []
}

/**
 * Calculate next run date for scheduled reports
 */
function getNextRunDate(schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly'): Date {
  const now = new Date()

  switch (schedule) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
  }
}

/**
 * Export compliance report to PDF
 */
export async function exportReportToPDF(
  reportId: string
): Promise<Blob> {
  const supabase = await createClient()

  // Get report with audit logs
  const { data: report, error: reportError } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    throw new Error('Report not found')
  }

  // Get audit logs for report period
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', report.organization_id)
    .gte('created_at', report.start_date)
    .lte('created_at', report.end_date)
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  const doc = new jsPDF()
  let yPosition = 20

  // Title page
  doc.setFontSize(20)
  doc.text('Compliance Report', 105, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.text(`Report Type: ${report.report_type}`, 105, yPosition, { align: 'center' })
  yPosition += 7

  doc.setFontSize(10)
  doc.text(
    `Period: ${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}`,
    105,
    yPosition,
    { align: 'center' }
  )
  yPosition += 7
  doc.text(`Generated: ${new Date(report.created_at).toLocaleString()}`, 105, yPosition, {
    align: 'center',
  })
  yPosition += 15

  // Summary section
  doc.setFontSize(14)
  doc.text('Summary', 20, yPosition)
  yPosition += 10

  const summaryData = [
    ['Total Events', report.event_count.toString()],
    ['Anomalies Detected', report.anomaly_count.toString()],
    ['Report Status', report.status],
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
  })

  // Audit logs table
  if (logs && logs.length > 0) {
    doc.addPage()
    yPosition = 20
    doc.setFontSize(14)
    doc.text('Audit Log Events', 20, yPosition)
    yPosition += 10

    const logData = logs.slice(0, 100).map((log) => [
      new Date(log.created_at).toLocaleDateString(),
      log.event_category || 'N/A',
      log.severity || 'info',
      log.event_description?.substring(0, 40) || 'N/A',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Category', 'Severity', 'Description']],
      body: logData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 90 },
      },
      styles: { fontSize: 8 },
    })
  }

  // Add footer with hash
  const pageCount = doc.getNumberOfPages()
  const reportHash = createHash('sha256')
    .update(JSON.stringify(report))
    .digest('hex')

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
    doc.text(`Report ID: ${reportId}`, 20, 290)
    doc.text(`Hash: ${reportHash.substring(0, 16)}...`, 20, 295)
  }

  return doc.output('blob')
}

/**
 * Export compliance report to CSV
 */
export async function exportReportToCSV(
  reportId: string
): Promise<Blob> {
  const supabase = await createClient()

  // Get report with audit logs
  const { data: report, error: reportError } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    throw new Error('Report not found')
  }

  // Get audit logs for report period
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', report.organization_id)
    .gte('created_at', report.start_date)
    .lte('created_at', report.end_date)
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  // Build CSV content
  const headers = [
    'Timestamp',
    'Event Category',
    'Event Type',
    'Event Description',
    'Severity',
    'User ID',
    'Resource Type',
    'Resource ID',
    'Compliance Level',
    'IP Address',
  ]

  const rows = (logs || []).map((log) => [
    log.created_at,
    log.event_category || '',
    log.event_type || '',
    log.event_description || '',
    log.severity || 'info',
    log.user_id || '',
    log.resource_type || '',
    log.resource_id || '',
    log.compliance_level || '',
    log.ip_address || '',
  ])

  // Generate CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Export compliance report to Excel (XLSX)
 */
export async function exportReportToXLSX(
  reportId: string
): Promise<Buffer> {
  const supabase = await createClient()

  // Get report with audit logs
  const { data: report, error: reportError } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (reportError || !report) {
    throw new Error('Report not found')
  }

  // Get audit logs for report period
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', report.organization_id)
    .gte('created_at', report.start_date)
    .lte('created_at', report.end_date)
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  // Create workbook
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'ABR Insights'
  workbook.created = new Date()

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary')
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 40 },
  ]

  summarySheet.addRows([
    { metric: 'Report ID', value: reportId },
    { metric: 'Report Type', value: report.report_type },
    { metric: 'Start Date', value: new Date(report.start_date).toLocaleString() },
    { metric: 'End Date', value: new Date(report.end_date).toLocaleString() },
    { metric: 'Generated At', value: new Date(report.created_at).toLocaleString() },
    { metric: 'Total Events', value: report.event_count },
    { metric: 'Anomalies Detected', value: report.anomaly_count },
    { metric: 'Status', value: report.status },
  ])

  // Style header row
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF424242' },
  }
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Audit logs sheet
  const logsSheet = workbook.addWorksheet('Audit Logs')
  logsSheet.columns = [
    { header: 'Timestamp', key: 'created_at', width: 20 },
    { header: 'Category', key: 'event_category', width: 20 },
    { header: 'Event Type', key: 'event_type', width: 20 },
    { header: 'Description', key: 'event_description', width: 40 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'User ID', key: 'user_id', width: 30 },
    { header: 'Resource Type', key: 'resource_type', width: 20 },
    { header: 'Resource ID', key: 'resource_id', width: 30 },
    { header: 'Compliance Level', key: 'compliance_level', width: 20 },
  ]

  if (logs) {
    logsSheet.addRows(logs)
  }

  // Style header row
  logsSheet.getRow(1).font = { bold: true }
  logsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF424242' },
  }
  logsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as unknown as Buffer
}

/**
 * Export report in requested format and upload to storage
 */
export async function exportAndUploadReport(
  reportId: string,
  format: ReportFormat
): Promise<{ blob: Blob | Buffer; path: string; url: string }> {
  const supabase = await createClient()

  // Get report to determine org ID
  const { data: report } = await supabase
    .from('compliance_reports')
    .select('organization_id')
    .eq('id', reportId)
    .single()

  if (!report) throw new Error('Report not found')

  // Generate export based on format
  let blob: Blob | Buffer
  let contentType: string

  switch (format) {
    case 'pdf':
      blob = await exportReportToPDF(reportId)
      contentType = 'application/pdf'
      break
    case 'csv':
      blob = await exportReportToCSV(reportId)
      contentType = 'text/csv'
      break
    case 'xlsx':
      blob = await exportReportToXLSX(reportId)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    case 'json': {
      const { data: reportData } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('id', reportId)
        .single()
      blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      contentType = 'application/json'
      break
    }
    default:
      throw new Error(`Unsupported format: ${format}`)
  }

  // Upload to Supabase Storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `compliance-report-${reportId}-${timestamp}.${format}`
  const filePath = `compliance-reports/${report.organization_id}/${fileName}`

  const { data, error } = await supabase.storage
    .from('compliance-artifacts')
    .upload(filePath, blob, {
      contentType,
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('compliance-artifacts')
    .getPublicUrl(filePath)

  // Update export record with storage info
  await supabase
    .from('audit_log_exports')
    .update({
      download_url: urlData.publicUrl,
      file_size: blob instanceof Blob ? blob.size : blob.length,
    })
    .eq('id', reportId)

  return {
    blob,
    path: data.path,
    url: urlData.publicUrl,
  }
}
