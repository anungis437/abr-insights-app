'use client'

/**
 * Department User Risk Drill-Down
 * Shows individual user compliance status within a department
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDepartmentUserRiskDetails, type UserRiskDetail } from '@/lib/services/risk-analytics'
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle, Download } from 'lucide-react'

export default function DepartmentUserRiskPage() {
  const params = useParams()
  const router = useRouter()
  const department = decodeURIComponent(params.department as string)

  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<UserRiskDetail[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserRiskDetail[]>([])
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all')
  const [filterTrainingStatus, setFilterTrainingStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUserDetails()
  }, [department])

  useEffect(() => {
    applyFilters()
  }, [userDetails, filterRiskLevel, filterTrainingStatus, searchQuery])

  async function loadUserDetails() {
    try {
      setLoading(true)
      const orgId = 'demo-org-id' // TODO: Replace with actual session management
      const details = await getDepartmentUserRiskDetails(orgId, department)
      setUserDetails(details)
      setFilteredUsers(details)
    } catch (error) {
      console.error('Error loading user details:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...userDetails]

    // Risk level filter
    if (filterRiskLevel !== 'all') {
      filtered = filtered.filter((u) => u.risk_level === filterRiskLevel)
    }

    // Training status filter
    if (filterTrainingStatus !== 'all') {
      filtered = filtered.filter((u) => u.training_status === filterTrainingStatus)
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.user_name.toLowerCase().includes(query) || u.user_email.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'not_started':
        return <XCircle className="h-5 w-5 text-gray-400" />
      default:
        return null
    }
  }

  function exportToCSV() {
    const headers = [
      'Name',
      'Email',
      'Risk Level',
      'Risk Score',
      'Training Status',
      'Completion %',
      'Quiz Score',
      'Days Since Training',
      'Issues',
    ]
    const rows = filteredUsers.map((u) => [
      u.user_name,
      u.user_email,
      u.risk_level,
      u.risk_score.toFixed(0),
      u.training_status,
      u.completion_percentage.toFixed(0) + '%',
      u.quiz_score ? u.quiz_score.toFixed(0) + '%' : 'N/A',
      u.days_since_last_training?.toString() || 'N/A',
      u.issues.join('; '),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${department}-user-risk-report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const riskStats = {
    critical: filteredUsers.filter((u) => u.risk_level === 'critical').length,
    high: filteredUsers.filter((u) => u.risk_level === 'high').length,
    medium: filteredUsers.filter((u) => u.risk_level === 'medium').length,
    low: filteredUsers.filter((u) => u.risk_level === 'low').length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Risk Heatmap
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{department}</h1>
            <p className="text-gray-600">Individual user compliance status</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border-l-4 border-red-600 bg-red-50 p-6 shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Critical Risk</h3>
          <p className="text-3xl font-bold text-red-700">{riskStats.critical}</p>
        </div>
        <div className="rounded-lg border-l-4 border-orange-600 bg-orange-50 p-6 shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-600">High Risk</h3>
          <p className="text-3xl font-bold text-orange-700">{riskStats.high}</p>
        </div>
        <div className="rounded-lg border-l-4 border-yellow-600 bg-yellow-50 p-6 shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Medium Risk</h3>
          <p className="text-3xl font-bold text-yellow-700">{riskStats.medium}</p>
        </div>
        <div className="rounded-lg border-l-4 border-green-600 bg-green-50 p-6 shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-600">Low Risk</h3>
          <p className="text-3xl font-bold text-green-700">{riskStats.low}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Search User</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Risk Level</label>
            <select
              value={filterRiskLevel}
              onChange={(e) => setFilterRiskLevel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by risk level"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Training Status</label>
            <select
              value={filterTrainingStatus}
              onChange={(e) => setFilterTrainingStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by training status"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {userDetails.length} users
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Training Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Completion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Quiz Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Issues
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                    <div className="text-sm text-gray-500">{user.user_email}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${getRiskColor(
                        user.risk_level
                      )} text-white`}
                    >
                      {user.risk_level}
                    </span>
                    <span className="text-sm text-gray-600">{user.risk_score.toFixed(0)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.training_status)}
                    <span className="text-sm capitalize">
                      {user.training_status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="w-24">
                    <div className="mb-1 text-sm font-medium">
                      {user.completion_percentage.toFixed(0)}%
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${user.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {user.quiz_score !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          user.quiz_score >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {user.quiz_score.toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        ({user.quiz_attempts} {user.quiz_attempts === 1 ? 'attempt' : 'attempts'})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No attempts</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.issues.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {user.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          <span className="text-sm text-gray-700">{issue}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">No issues</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No users match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
