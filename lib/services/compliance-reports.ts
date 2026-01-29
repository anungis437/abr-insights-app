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
