'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/production-logger'
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react'

interface AnalyticsReport {
  id: string
  title: string
  description: string
  type: 'course_completion' | 'user_activity' | 'learning_progress' | 'engagement'
  generated_at?: string
  format: 'pdf' | 'csv' | 'xlsx'
  status: 'pending' | 'completed' | 'failed'
}

export default function AnalyticsReportsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [reportType, setReportType] = useState<string>('course_completion')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function checkAuthAndLoadData() {
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

      // For now, show placeholder reports
      // TODO: Implement actual reporting system with database tables
      setReports([])
    } catch (error) {
      logger.error('Error loading analytics reports:', { error, context: 'AnalyticsReportsPage' })
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateReport() {
    setGenerating(true)
    try {
      // TODO: Implement report generation
      // This would create a report in a reports table and trigger background job
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate generation

      logger.info('Report generation requested', {
        reportType,
        dateRange,
        context: 'AnalyticsReportsPage',
      })

      // Refresh reports list
      await checkAuthAndLoadData()
    } catch (error) {
      logger.error('Error generating report:', { error, context: 'AnalyticsReportsPage' })
    } finally {
      setGenerating(false)
    }
  }

  const reportTypes = [
    {
      id: 'course_completion',
      title: 'Course Completion Report',
      description: 'Track completion rates across all courses',
      icon: BookOpen,
    },
    {
      id: 'user_activity',
      title: 'User Activity Report',
      description: 'Monitor user engagement and activity patterns',
      icon: Users,
    },
    {
      id: 'learning_progress',
      title: 'Learning Progress Report',
      description: 'Analyze individual and team learning progress',
      icon: TrendingUp,
    },
    {
      id: 'engagement',
      title: 'Engagement Metrics',
      description: 'Measure time spent and interaction quality',
      icon: Clock,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
            <p className="mt-2 text-gray-600">
              Generate and download detailed analytics reports for your organization
            </p>
          </div>
          <button
            onClick={() => router.push('/analytics')}
            className="btn-secondary flex items-center gap-2"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics Dashboard
          </button>
        </div>

        {/* Report Generator */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Generate New Report</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                aria-label="Report Type"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  aria-label="Start Date"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  aria-label="End Date"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-5 w-5" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Available Report Types */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Available Report Types</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary-50 p-3">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-900">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Reports</h2>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {reports.length === 0 ? (
              <div className="py-12 text-center">
                <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No reports generated yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Generate your first report using the form above
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="h-8 w-8 text-primary-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {report.generated_at
                            ? new Date(report.generated_at).toLocaleDateString()
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <button className="btn-secondary flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <Filter className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-blue-900">Report Generation Tips</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Reports are generated asynchronously and may take a few minutes</li>
                <li>• Choose appropriate date ranges to avoid overly large datasets</li>
                <li>• CSV format is best for importing into Excel or other tools</li>
                <li>• PDF format includes charts and visualizations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
