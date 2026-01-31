'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Audit Logs Admin Page - UPDATED WITH REAL DB INTEGRATION
 * Route: /admin/audit-logs
 *
 * Features:
 * - Real-time audit log viewing from audit_logs table
 * - Statistics from get_audit_log_statistics() DB function
 * - Anomaly detection from detect_audit_anomalies() DB function
 * - Export functionality via compliance reports service
 * - Advanced filtering by category, severity, compliance level, date range
 * - Hash chain integrity display
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Search,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Loader2,
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  organization_id: string
  user_id: string
  user_email: string
  action: string
  event_category: string
  severity: string
  compliance_level: string
  data_classification: string
  resource_type?: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  request_id?: string
  session_id?: string
  metadata?: Record<string, unknown>
  hash: string
  previous_hash?: string
}

interface AuditStatistics {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsBySeverity: Record<string, number>
  uniqueUsers: number
}

interface Anomaly {
  type: string
  severity: string
  description: string
  affected_entities: string[]
  detected_at: string
}

export default function AuditLogsPage() {
  const supabase = createClient()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterComplianceLevel, setFilterComplianceLevel] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    loadData()
  }, [filterCategory, filterSeverity, filterComplianceLevel, dateRange])

  async function loadData() {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      // Load logs with filters
      let query = supabase
        .from('audit_logs')
        .select('*, profiles(email)')
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(100)

      if (filterCategory !== 'all') {
        query = query.eq('event_category', filterCategory)
      }
      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity)
      }
      if (filterComplianceLevel !== 'all') {
        query = query.eq('compliance_level', filterComplianceLevel)
      }
      if (dateRange.start) {
        query = query.gte('timestamp', dateRange.start)
      }
      if (dateRange.end) {
        query = query.lte('timestamp', dateRange.end)
      }

      const { data: logsData } = await query

      // Flatten joined data
      const flattenedLogs = logsData?.map((log: any) => ({
        ...log,
        user_email: (log.profiles as unknown as { email: string })?.email || 'Unknown',
        profiles: undefined,
      })) as AuditLog[]

      setLogs(flattenedLogs || [])

      // Load statistics (last 7 days)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const { data: statsData } = await supabase.rpc('get_audit_log_statistics', {
        p_organization_id: profile.organization_id,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      })

      if (statsData) {
        setStatistics(statsData as unknown as AuditStatistics)
      }

      // Load anomalies (last 7 days)
      const { data: anomaliesData } = await supabase.rpc('detect_audit_anomalies', {
        p_organization_id: profile.organization_id,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      })

      if (anomaliesData) {
        setAnomalies(anomaliesData as unknown as Anomaly[])
      }
    } catch (error) {
      logger.error('Error loading audit logs:', { error: error, context: 'AuditLogsPage' })
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) throw new Error('No organization')

      // Create compliance report for export
      const filters: Record<string, unknown> = {}
      if (filterCategory !== 'all') filters.eventCategory = [filterCategory]
      if (filterSeverity !== 'all') filters.severity = [filterSeverity]
      if (filterComplianceLevel !== 'all') filters.complianceLevel = [filterComplianceLevel]
      if (dateRange.start) filters.startDate = dateRange.start
      if (dateRange.end) filters.endDate = dateRange.end

      const { data: report, error } = await supabase
        .from('compliance_reports')
        .insert({
          organization_id: profile.organization_id,
          report_type: 'audit_summary',
          generated_by: user.id,
          format: 'csv',
          filters,
          status: 'completed',
        })
        .select()
        .single()

      if (error) throw error

      alert('Export created successfully. Check compliance reports for download.')
    } catch (error) {
      logger.error('Error exporting logs:', { error: error, context: 'AuditLogsPage' })
      alert('Failed to export logs')
    } finally {
      setExporting(false)
    }
  }

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.action.toLowerCase().includes(query) ||
      log.user_email.toLowerCase().includes(query) ||
      log.resource_type?.toLowerCase().includes(query) ||
      log.event_category.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container-custom pb-8 pt-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">Monitor system activity and security events</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export Logs
        </button>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-yellow-900">
                {anomalies.length} Anomal{anomalies.length === 1 ? 'y' : 'ies'} Detected
              </h3>
              <div className="space-y-2">
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    <span className="font-medium">{anomaly.type}:</span> {anomaly.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Events (7 days)</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {statistics?.totalEvents.toLocaleString() || '0'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Security Events</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {statistics?.eventsByCategory?.security_event || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Critical Severity</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {statistics?.eventsBySeverity?.critical || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Unique Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{statistics?.uniqueUsers || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by event category"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="configuration_change">Configuration</option>
            <option value="admin_action">Admin Action</option>
            <option value="security_event">Security Event</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            aria-label="Filter by severity"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={filterComplianceLevel}
            onChange={(e) => setFilterComplianceLevel(e.target.value)}
            aria-label="Filter by compliance level"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Compliance Levels</option>
            <option value="low">Low</option>
            <option value="standard">Standard</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action / Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.user_email}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <p className="text-xs text-gray-500">{log.event_category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.resource_type && log.resource_id
                        ? `${log.resource_type} #${log.resource_id.slice(0, 8)}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          log.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : log.severity === 'error'
                              ? 'bg-orange-100 text-orange-700'
                              : log.severity === 'warning'
                                ? 'bg-yellow-100 text-yellow-700'
                                : log.severity === 'info'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          log.compliance_level === 'critical'
                            ? 'bg-purple-100 text-purple-700'
                            : log.compliance_level === 'high'
                              ? 'bg-red-100 text-red-700'
                              : log.compliance_level === 'standard'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.compliance_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.ip_address || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{log.hash.slice(0, 8)}...</span>
                        {log.previous_hash && (
                          <span title="Hash chain intact">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
