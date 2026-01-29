'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react'

interface ComplianceReport {
  id: string
  organization_id: string
  report_type: string
  generated_by: string
  generated_by_email?: string
  format: string
  filters: Record<string, unknown>
  event_count: number
  anomaly_count: number
  summary: Record<string, unknown>
  status: string
  created_at: string
}

interface AuditLogExport {
  id: string
  report_id: string
  requested_by: string
  requested_by_email?: string
  export_reason: string
  approval_status: string
  approved_by?: string
  approved_at?: string
  created_at: string
  download_url?: string
}

interface Anomaly {
  type: string
  severity: string
  description: string
  affected_entities: string[]
}

export default function CompliancePage() {
  const router = useRouter()
  const supabase = createClient()
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [exports, setExports] = useState<AuditLogExport[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [approvingExport, setApprovingExport] = useState<string | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [reportType, setReportType] = useState('audit_summary')
  const [reportFormat, setReportFormat] = useState('pdf')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const checkAuthAndLoadData = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        router.push('/dashboard')
        return
      }

      // Only allow super_admin and compliance_officer roles
      const hasAccess =
        profile.role === 'super_admin' ||
        profile.role === 'compliance_officer' ||
        profile.role === 'org_admin'

      if (!hasAccess) {
        router.push('/dashboard')
        return
      }

      await loadData()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/dashboard')
    }
  }, [router])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      const { data: reportsData } = await supabase
        .from('compliance_reports')
        .select('*, profiles(email)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20)

      const flattenedReports = reportsData?.map((r: any) => ({
        ...r,
        generated_by_email: (r.profiles as unknown as { email: string })?.email || 'Unknown',
        profiles: undefined,
      })) as ComplianceReport[]

      setReports(flattenedReports || [])

      const { data: exportsData } = await supabase
        .from('audit_log_exports')
        .select('*, profiles(email)')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      const flattenedExports = exportsData?.map((e: any) => ({
        ...e,
        requested_by_email: (e.profiles as unknown as { email: string })?.email || 'Unknown',
        profiles: undefined,
      })) as AuditLogExport[]

      setExports(flattenedExports || [])

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const { data: anomaliesData } = await supabase.rpc('detect_audit_anomalies', {
        p_organization_id: profile.organization_id,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      })

      if (anomaliesData) {
        setAnomalies(anomaliesData as unknown as Anomaly[])
      }
    } catch (error) {
      console.error('Error loading compliance data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [checkAuthAndLoadData])

  async function handleGenerateReport() {
    setGenerating(true)
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

      const { error } = await supabase.from('compliance_reports').insert({
        organization_id: profile.organization_id,
        report_type: reportType,
        generated_by: user.id,
        format: reportFormat,
        filters: { startDate: dateRange.start, endDate: dateRange.end },
        status: 'completed',
        event_count: 0,
        anomaly_count: 0,
        summary: {},
      })

      if (error) throw error

      setShowGenerateModal(false)
      await loadData()
      alert('Report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  async function handleApproveExport(exportId: string) {
    setApprovingExport(exportId)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('audit_log_exports')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', exportId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error approving export:', error)
      alert('Failed to approve export')
    } finally {
      setApprovingExport(null)
    }
  }

  async function handleRejectExport(exportId: string) {
    setApprovingExport(exportId)
    try {
      const { error } = await supabase
        .from('audit_log_exports')
        .update({ approval_status: 'rejected' })
        .eq('id', exportId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error rejecting export:', error)
      alert('Failed to reject export')
    } finally {
      setApprovingExport(null)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="mt-2 text-gray-600">Monitor compliance standards and generate reports</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {anomalies.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-red-900">
                {anomalies.length} Anomal{anomalies.length === 1 ? 'y' : 'ies'} Detected (Last 7
                Days)
              </h3>
              <div className="space-y-2">
                {anomalies.slice(0, 5).map((anomaly, index) => (
                  <div key={index} className="rounded bg-white p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{anomaly.type}</p>
                        <p className="mt-1 text-sm text-gray-600">{anomaly.description}</p>
                        {anomaly.affected_entities.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Affected: {anomaly.affected_entities.join(', ')}
                          </p>
                        )}
                      </div>
                      <span
                        className={`ml-4 rounded px-2 py-1 text-xs font-semibold ${
                          anomaly.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : anomaly.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {exports.length > 0 && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="mb-3 font-semibold text-blue-900">
                {exports.length} Export Request{exports.length === 1 ? '' : 's'} Awaiting Approval
              </h3>
              <div className="space-y-3">
                {exports.map((exp) => (
                  <div key={exp.id} className="rounded-lg bg-white p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{exp.requested_by_email}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {exp.export_reason}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Requested: {new Date(exp.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleApproveExport(exp.id)}
                          disabled={approvingExport === exp.id}
                          className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {approvingExport === exp.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectExport(exp.id)}
                          disabled={approvingExport === exp.id}
                          className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Reports</p>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{reports.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Anomalies (7d)</p>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{anomalies.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{exports.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Compliance Status</p>
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">Active</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Compliance Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Report Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Generated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Anomalies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No compliance reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{report.report_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.generated_by_email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {report.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.event_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          report.anomaly_count === 0
                            ? 'bg-green-100 text-green-700'
                            : report.anomaly_count <= 5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {report.anomaly_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : report.status === 'generating'
                              ? 'bg-blue-100 text-blue-700'
                              : report.status === 'scheduled'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Download report"
                        title="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Generate Compliance Report</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  aria-label="Select report type"
                >
                  <option value="audit_summary">Audit Summary</option>
                  <option value="security_incidents">Security Incidents</option>
                  <option value="data_access">Data Access</option>
                  <option value="user_activity">User Activity</option>
                  <option value="compliance_check">Compliance Check</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  aria-label="Select report format"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  aria-label="Select start date"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  aria-label="Select end date"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
