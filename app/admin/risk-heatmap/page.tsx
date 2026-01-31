'use client'

/**
 * Risk Heatmap Dashboard
 * Visualizes organizational compliance risk by department/location
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFeatureAccess } from '@/hooks/use-entitlements'
import { createClient } from '@/lib/supabase/client'
import {
  getDepartmentRiskScores,
  getOrganizationRiskSummary,
  type DepartmentRiskScore,
  type OrganizationRiskSummary,
} from '@/lib/services/risk-analytics'
import {
  generateDepartmentRiskCSV,
  generateDepartmentRiskHTML,
  generateExecutiveSummary,
  downloadCSV,
  printHTMLReport,
} from '@/lib/services/risk-report-export'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Download,
  Printer,
  Mail,
} from 'lucide-react'
import RiskTrendChart from '@/components/dashboard/RiskTrendChart'

export default function RiskHeatmapPage() {
  const router = useRouter()
  const canExport = useFeatureAccess('exportCapabilities')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<OrganizationRiskSummary | null>(null)
  const [departmentScores, setDepartmentScores] = useState<DepartmentRiskScore[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentRiskScore | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    loadRiskData()
  }, [])

  async function loadRiskData() {
    try {
      setLoading(true)

      // Get organization ID from user session
      const supabase = createClient()
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

      const orgId = profile.organization_id
      setOrganizationId(orgId)

      const [summaryData, scoresData] = await Promise.all([
        getOrganizationRiskSummary(orgId),
        getDepartmentRiskScores(orgId),
      ])

      setSummary(summaryData)
      setDepartmentScores(scoresData)
    } catch (error) {
      console.error('Error loading risk data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getRiskColor(level: string): string {
    switch (level) {
      case 'low':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'high':
        return 'bg-orange-500'
      case 'critical':
        return 'bg-red-600'
      default:
        return 'bg-gray-400'
    }
  }

  function getRiskTextColor(level: string): string {
    switch (level) {
      case 'low':
        return 'text-green-700'
      case 'medium':
        return 'text-yellow-700'
      case 'high':
        return 'text-orange-700'
      case 'critical':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  function handleExportCSV() {
    if (!summary || departmentScores.length === 0) return
    const csv = generateDepartmentRiskCSV(summary, departmentScores)
    const filename = `risk-assessment-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(filename, csv)
  }

  function handleExportPDF() {
    if (!summary || departmentScores.length === 0) return
    const html = generateDepartmentRiskHTML(summary, departmentScores, 'ABR Insights Organization')
    printHTMLReport(html)
  }

  function handleExportExecutiveSummary() {
    if (!summary || departmentScores.length === 0) return
    const summary_text = generateExecutiveSummary(summary, departmentScores)

    // Copy to clipboard
    navigator.clipboard.writeText(summary_text).then(() => {
      alert('Executive summary copied to clipboard! Ready to paste into email.')
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Risk Heatmap</h1>
            <p className="text-gray-600">
              Visualize compliance risk across departments and locations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={!canExport}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-60"
              title={canExport ? 'Export to CSV' : 'Upgrade to Professional for export features'}
            >
              <Download className="h-5 w-5" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!canExport}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-60"
              title={canExport ? 'Print to PDF' : 'Upgrade to Professional for export features'}
            >
              <Printer className="h-5 w-5" />
              PDF
            </button>
            <button
              onClick={handleExportExecutiveSummary}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              title="Copy executive summary"
            >
              <Mail className="h-5 w-5" />
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* Organization Summary */}
      {summary && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Overall Risk Level</h3>
              <AlertTriangle
                className={`h-5 w-5 ${getRiskTextColor(summary.overall_risk_level)}`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold capitalize">{summary.overall_risk_level}</p>
              <span className="text-sm text-gray-500">
                {summary.overall_risk_score.toFixed(0)}/100
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full ${getRiskColor(summary.overall_risk_level)}`}
                style={
                  {
                    ['--progress-width' as string]: `${summary.overall_risk_score}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">High-Risk Departments</h3>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{summary.high_risk_departments}</p>
              <span className="text-sm text-gray-500">of {summary.total_departments}</span>
            </div>
            {summary.high_risk_departments > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
                <TrendingUp className="h-4 w-4" />
                <span>Requires attention</span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Compliant Users</h3>
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{summary.compliant_users}</p>
              <span className="text-sm text-gray-500">of {summary.total_users}</span>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {((summary.compliant_users / summary.total_users) * 100).toFixed(1)}% compliance rate
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">At-Risk Users</h3>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{summary.at_risk_users}</p>
              <span className="text-sm text-gray-500">need intervention</span>
            </div>
            {summary.at_risk_users > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span>Action required</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Trend Chart */}
      {organizationId && (
        <div className="mb-8">
          <RiskTrendChart
            organizationId={organizationId}
            department={selectedDepartment?.department}
            days={90}
            title={
              selectedDepartment
                ? `${selectedDepartment.department} Risk Trend`
                : 'Organization Risk Trend'
            }
          />
        </div>
      )}

      {/* Department Heatmap */}
      <div className="mb-8 rounded-lg bg-white shadow">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Department Risk Overview</h2>
          <p className="mt-1 text-sm text-gray-600">
            Click on a department to view detailed breakdown
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentScores.map((dept) => (
              <button
                key={dept.department}
                onClick={() => {
                  // Navigate to department drill-down
                  router.push(`/admin/risk-heatmap/${encodeURIComponent(dept.department)}`)
                }}
                className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                  selectedDepartment?.department === dept.department
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{dept.department}</h3>
                    {dept.location && <p className="text-sm text-gray-500">{dept.location}</p>}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${getRiskColor(
                      dept.risk_level
                    )} text-white`}
                  >
                    {dept.risk_level}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Risk Score</span>
                    <span className="font-semibold">{dept.risk_score.toFixed(0)}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold">{dept.total_users}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold">
                      {(dept.training_completion_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">At Risk</span>
                    <span className="font-semibold text-red-600">{dept.at_risk_users}</span>
                  </div>
                </div>

                {dept.factors.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-medium text-gray-600">Key Risk Factors:</p>
                    <div className="flex flex-wrap gap-1">
                      {dept.factors.map((factor, idx) => (
                        <span
                          key={idx}
                          className={`rounded px-2 py-1 text-xs ${getRiskColor(
                            factor.severity
                          )} text-white`}
                        >
                          {factor.category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {departmentScores.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">No department data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Department Details */}
      {selectedDepartment && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedDepartment.department}</h2>
                <p className="mt-1 text-sm text-gray-600">Detailed risk analysis</p>
              </div>
              <button
                onClick={() => setSelectedDepartment(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close department details"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">Completion Rate</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {(selectedDepartment.training_completion_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-500"
                    style={
                      {
                        ['--progress-width' as string]: `${selectedDepartment.training_completion_rate * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">Average Quiz Score</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {selectedDepartment.avg_quiz_score.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-500"
                    style={
                      {
                        ['--progress-width' as string]: `${selectedDepartment.avg_quiz_score}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">Training Recency</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {selectedDepartment.days_since_last_training}
                  </span>
                  <span className="text-sm text-gray-500">days ago</span>
                </div>
              </div>
            </div>

            {selectedDepartment.factors.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Risk Factors</h3>
                <div className="space-y-4">
                  {selectedDepartment.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-lg border p-4">
                      <div className={`mt-1 rounded-full p-2 ${getRiskColor(factor.severity)}`}>
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h4 className="font-semibold">{factor.category}</h4>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium uppercase ${getRiskColor(
                              factor.severity
                            )} text-white`}
                          >
                            {factor.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-xs text-gray-500">
                            <span>Impact Score</span>
                            <span>{factor.impact_score.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full ${getRiskColor(factor.severity)}`}
                              style={
                                {
                                  ['--progress-width' as string]: `${(factor.impact_score / 30) * 100}%`,
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Recommended Actions</h3>
              <ul className="space-y-3">
                {selectedDepartment.pending_users > 0 && (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm">
                      Enroll {selectedDepartment.pending_users} pending users in required training
                      courses
                    </p>
                  </li>
                )}
                {selectedDepartment.training_completion_rate < 0.8 && (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                    <p className="text-sm">
                      Send reminder notifications to users with incomplete training
                    </p>
                  </li>
                )}
                {selectedDepartment.avg_quiz_score < 75 && (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500" />
                    <p className="text-sm">
                      Review training materials - low quiz scores indicate comprehension issues
                    </p>
                  </li>
                )}
                {selectedDepartment.days_since_last_training > 180 && (
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <p className="text-sm">
                      Schedule refresher training - last training was{' '}
                      {Math.floor(selectedDepartment.days_since_last_training / 30)} months ago
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
