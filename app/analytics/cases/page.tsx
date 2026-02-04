'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, TrendingUp, Clock, Users, AlertCircle, CheckCircle, Scale } from 'lucide-react'

interface CaseStats {
  totalCases: number
  raceRelatedCases: number
  antiBlackCases: number
  avgResolutionDays: number
  upheldRate: number
  activeInvestigations: number
}

interface OutcomeData {
  outcome: string
  count: number
  percentage: number
  color: string
}

interface TribunalData {
  tribunal: string
  cases: number
  upheld: number
  percentage: number
}

interface ProtectedGroundData {
  ground: string
  count: number
  percentage: number
}

interface RecentActivity {
  id: string
  caseNumber: string
  title: string
  tribunal: string
  action: string
  time: string
  status: string
}

export default function CaseAnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CaseStats>({
    totalCases: 0,
    raceRelatedCases: 0,
    antiBlackCases: 0,
    avgResolutionDays: 0,
    upheldRate: 0,
    activeInvestigations: 0,
  })
  const [outcomesByStatus, setOutcomesByStatus] = useState<OutcomeData[]>([])
  const [topTribunals, setTopTribunals] = useState<TribunalData[]>([])
  const [protectedGrounds, setProtectedGrounds] = useState<ProtectedGroundData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      await loadAnalytics()
    }

    checkAuth()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch all non-deleted cases
      const { data: cases, error } = await supabase
        .from('tribunal_cases')
        .select('*')
        .is('deleted_at', null)

      if (error) throw error

      if (!cases || cases.length === 0) {
        setLoading(false)
        return
      }

      // Calculate stats
      const totalCases = cases.length
      const raceRelatedCases = cases.filter((c: any) => c.is_race_related === true).length

      // Count anti-Black cases from summary/title
      const antiBlackCases = cases.filter(
        (c: any) =>
          c.summary?.toLowerCase().includes('anti-black') ||
          c.summary?.toLowerCase().includes('anti black') ||
          c.title?.toLowerCase().includes('anti-black') ||
          c.title?.toLowerCase().includes('anti black')
      ).length

      // Calculate average resolution time (using created_at and decision_date as proxy)
      const casesWithDates = cases.filter((c: any) => c.decision_date && c.created_at)
      let avgResolutionDays = 0
      if (casesWithDates.length > 0) {
        const totalDays = casesWithDates.reduce((sum: number, c: any) => {
          const start = new Date(c.created_at)
          const end = new Date(c.decision_date)
          const days = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0)
        avgResolutionDays = Math.round(totalDays / casesWithDates.length)
      }

      // Calculate upheld rate
      const casesWithOutcome = cases.filter((c: any) => c.outcome)
      const upheldCases = casesWithOutcome.filter((c: any) => c.outcome?.includes('Upheld')).length
      const upheldRate =
        casesWithOutcome.length > 0 ? Math.round((upheldCases / casesWithOutcome.length) * 100) : 0

      setStats({
        totalCases,
        raceRelatedCases,
        antiBlackCases,
        avgResolutionDays,
        upheldRate,
        activeInvestigations: 0, // Would need separate tracking
      })

      // Outcomes by status
      const outcomeCounts: Record<string, number> = {}
      cases.forEach((c: any) => {
        const outcome = c.outcome || 'Unknown'
        outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1
      })

      const outcomeData: OutcomeData[] = Object.entries(outcomeCounts)
        .map(([outcome, count]) => ({
          outcome,
          count,
          percentage: Math.round((count / totalCases) * 100),
          color: getOutcomeColor(outcome),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setOutcomesByStatus(outcomeData)

      // Top tribunals
      const tribunalCounts: Record<string, { total: number; upheld: number }> = {}
      cases.forEach((c: any) => {
        const tribunal = c.tribunal || 'Unknown'
        if (!tribunalCounts[tribunal]) {
          tribunalCounts[tribunal] = { total: 0, upheld: 0 }
        }
        tribunalCounts[tribunal].total += 1
        if (c.outcome?.includes('Upheld')) {
          tribunalCounts[tribunal].upheld += 1
        }
      })

      const tribunalData: TribunalData[] = Object.entries(tribunalCounts)
        .map(([tribunal, data]) => ({
          tribunal,
          cases: data.total,
          upheld: data.upheld,
          percentage: Math.round((data.total / totalCases) * 100),
        }))
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 5)

      setTopTribunals(tribunalData)

      // Protected grounds analysis (from key_themes)
      const groundCounts: Record<string, number> = {}
      cases.forEach((c: any) => {
        if (c.key_themes && Array.isArray(c.key_themes)) {
          c.key_themes.forEach((theme: string) => {
            groundCounts[theme] = (groundCounts[theme] || 0) + 1
          })
        }
      })

      const groundData: ProtectedGroundData[] = Object.entries(groundCounts)
        .map(([ground, count]) => ({
          ground,
          count,
          percentage: Math.round((count / totalCases) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setProtectedGrounds(groundData)

      // Recent activity (last 10 cases)
      const recent = cases
        .sort((a: any, b: any) => {
          const dateA = new Date(a.decision_date || a.created_at)
          const dateB = new Date(b.decision_date || b.created_at)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 10)
        .map((c: any) => ({
          id: c.id,
          caseNumber: c.case_number || 'N/A',
          title: c.title?.substring(0, 60) + '...' || 'Untitled',
          tribunal: c.tribunal || 'Unknown',
          action: c.outcome ? `Decision: ${c.outcome}` : 'Case filed',
          time: formatTimeAgo(c.decision_date || c.created_at),
          status: c.outcome?.includes('Upheld') ? 'success' : 'progress',
        }))

      setRecentActivity(recent)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeColor = (outcome: string): string => {
    if (outcome.includes('Upheld')) return 'bg-green-500'
    if (outcome === 'Dismissed') return 'bg-red-500'
    if (outcome === 'Withdrawn') return 'bg-gray-500'
    if (outcome === 'Settled') return 'bg-purple-500'
    return 'bg-blue-500'
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Case Analytics</h1>
        <p className="mt-2 text-gray-600">Analyze tribunal case processing, trends, and outcomes</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCases}</p>
              <p className="mt-1 text-sm text-green-600">All tribunal cases</p>
            </div>
            <div className="rounded-full bg-gray-50 p-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Race-Related</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.raceRelatedCases}</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.totalCases > 0
                  ? Math.round((stats.raceRelatedCases / stats.totalCases) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="rounded-full bg-gray-50 p-3">
              <Scale className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anti-Black Specific</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.antiBlackCases}</p>
              <p className="mt-1 text-sm text-gray-600">
                {stats.totalCases > 0
                  ? Math.round((stats.antiBlackCases / stats.totalCases) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="rounded-full bg-gray-50 p-3">
              <AlertCircle className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upheld Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.upheldRate}%</p>
              <p className="mt-1 text-sm text-green-600">Success rate</p>
            </div>
            <div className="rounded-full bg-gray-50 p-3">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Outcomes by Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Cases by Outcome</h2>
          <div className="space-y-4">
            {outcomesByStatus.length > 0 ? (
              outcomesByStatus.map((item) => (
                <div key={item.outcome}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{item.outcome}</span>
                    <span className="text-gray-600">
                      {item.count} cases ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-3 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No outcome data available</p>
            )}
          </div>
        </div>

        {/* Top Tribunals */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Top Tribunals</h2>
          <div className="space-y-4">
            {topTribunals.length > 0 ? (
              topTribunals.map((item) => (
                <div key={item.tribunal} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{item.tribunal}</span>
                      <span className="text-gray-600">
                        {item.cases} cases ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${item.percentage * 3}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.upheld} upheld (
                      {item.cases > 0 ? Math.round((item.upheld / item.cases) * 100) : 0}% success)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No tribunal data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Protected Grounds */}
      {protectedGrounds.length > 0 && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Key Themes & Protected Grounds
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {protectedGrounds.map((item) => (
              <div key={item.ground} className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600">{item.ground}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="mt-1 text-xs text-gray-500">{item.percentage}% of cases</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Case Activity</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full p-2 ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <FileText
                      className={`h-5 w-5 ${
                        activity.status === 'success' ? 'text-green-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-primary-600">
                        {activity.caseNumber}
                      </span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{activity.tribunal}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{activity.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
