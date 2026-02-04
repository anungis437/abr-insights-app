'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart } from 'lucide-react'

interface YearlyTrend {
  year: number
  cases: number
  raceRelated: number
  upheld: number
  dismissed: number
}

interface MonthlyTrend {
  month: string
  cases: number
  raceRelated: number
}

interface TribunalTrend {
  tribunal: string
  totalCases: number
  yearOverYearChange: number
  successRate: number
}

interface OutcomeTrend {
  outcome: string
  count: number
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

export default function AnalyticsTrendsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [tribunalTrends, setTribunalTrends] = useState<TribunalTrend[]>([])
  const [outcomeTrends, setOutcomeTrends] = useState<OutcomeTrend[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      await loadTrends()
    }

    checkAuth()
  }, [])

  const loadTrends = async () => {
    setLoading(true)
    try {
      const { data: cases, error } = await supabase
        .from('tribunal_cases')
        .select('*')
        .is('deleted_at', null)

      if (error) throw error

      if (!cases || cases.length === 0) {
        setLoading(false)
        return
      }

      // Calculate yearly trends
      const yearlyData: Record<number, YearlyTrend> = {}
      cases.forEach((c: any) => {
        const date = new Date(c.decision_date || c.created_at)
        const year = date.getFullYear()

        if (!yearlyData[year]) {
          yearlyData[year] = { year, cases: 0, raceRelated: 0, upheld: 0, dismissed: 0 }
        }

        yearlyData[year].cases += 1
        if (c.is_race_related) yearlyData[year].raceRelated += 1
        if (c.outcome?.includes('Upheld')) yearlyData[year].upheld += 1
        if (c.outcome === 'Dismissed') yearlyData[year].dismissed += 1
      })

      const yearly = Object.values(yearlyData)
        .sort((a, b) => a.year - b.year)
        .slice(-5) // Last 5 years

      setYearlyTrends(yearly)

      // Calculate monthly trends (last 12 months)
      const now = new Date()
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          cases: 0,
          raceRelated: 0,
        }
      }).reverse()

      cases.forEach((c: any) => {
        const date = new Date(c.decision_date || c.created_at)
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const monthData = last12Months.find((m) => m.month === monthKey)
        if (monthData) {
          monthData.cases += 1
          if (c.is_race_related) monthData.raceRelated += 1
        }
      })

      setMonthlyTrends(last12Months)

      // Calculate tribunal trends
      const tribunalData: Record<
        string,
        { current: number; previous: number; upheld: number; total: number }
      > = {}
      const currentYear = now.getFullYear()
      const previousYear = currentYear - 1

      cases.forEach((c: any) => {
        const tribunal = c.tribunal || 'Unknown'
        const year = new Date(c.decision_date || c.created_at).getFullYear()

        if (!tribunalData[tribunal]) {
          tribunalData[tribunal] = { current: 0, previous: 0, upheld: 0, total: 0 }
        }

        tribunalData[tribunal].total += 1
        if (year === currentYear) tribunalData[tribunal].current += 1
        if (year === previousYear) tribunalData[tribunal].previous += 1
        if (c.outcome?.includes('Upheld')) tribunalData[tribunal].upheld += 1
      })

      const tribunalTrendsData = Object.entries(tribunalData)
        .map(([tribunal, data]) => {
          const change =
            data.previous > 0 ? ((data.current - data.previous) / data.previous) * 100 : 0
          const successRate = data.total > 0 ? (data.upheld / data.total) * 100 : 0
          return {
            tribunal,
            totalCases: data.total,
            yearOverYearChange: Math.round(change),
            successRate: Math.round(successRate),
          }
        })
        .sort((a, b) => b.totalCases - a.totalCases)
        .slice(0, 5)

      setTribunalTrends(tribunalTrendsData)

      // Calculate outcome trends
      const outcomeCounts: Record<string, { current: number; previous: number }> = {}
      cases.forEach((c: any) => {
        const outcome = c.outcome || 'Unknown'
        const year = new Date(c.decision_date || c.created_at).getFullYear()

        if (!outcomeCounts[outcome]) {
          outcomeCounts[outcome] = { current: 0, previous: 0 }
        }

        if (year === currentYear) outcomeCounts[outcome].current += 1
        if (year === previousYear) outcomeCounts[outcome].previous += 1
      })

      const outcomeData = Object.entries(outcomeCounts)
        .map(([outcome, data]) => {
          const change =
            data.previous > 0 ? ((data.current - data.previous) / data.previous) * 100 : 0
          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (Math.abs(change) > 5) trend = change > 0 ? 'up' : 'down'

          return {
            outcome,
            count: data.current,
            trend,
            changePercent: Math.round(change),
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setOutcomeTrends(outcomeData)
    } catch (error) {
      console.error('Error loading trends:', error)
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Trends Analysis</h1>
        <p className="mt-2 text-gray-600">
          Identify patterns and trends in tribunal case data over time
        </p>
      </div>

      {/* Yearly Trends */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Yearly Case Trends</h2>
        <div className="space-y-4">
          {yearlyTrends.length > 0 ? (
            yearlyTrends.map((trend) => (
              <div key={trend.year} className="flex items-center gap-6">
                <div className="w-20 text-lg font-semibold text-gray-900">{trend.year}</div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Cases: {trend.cases}</span>
                    <span className="text-gray-600">
                      Race-Related: {trend.raceRelated} (
                      {trend.cases > 0 ? Math.round((trend.raceRelated / trend.cases) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="relative h-8 rounded-full bg-gray-100">
                    <div
                      className="absolute h-8 rounded-full bg-primary-600"
                      style={{
                        width: `${trend.cases > 0 ? (trend.cases / Math.max(...yearlyTrends.map((t) => t.cases))) * 100 : 0}%`,
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                      Upheld: {trend.upheld} | Dismissed: {trend.dismissed}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No yearly trend data available</p>
          )}
        </div>
      </div>

      {/* Monthly Trends (Last 12 months) */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Monthly Filing Trends (Last 12 Months)
        </h2>
        <div className="grid gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {monthlyTrends.map((trend) => (
            <div key={trend.month} className="text-center">
              <div className="mb-2 text-xs text-gray-600">{trend.month.split(' ')[0]}</div>
              <div
                className="mx-auto w-12 rounded-t bg-primary-600"
                style={{ height: `${Math.max(trend.cases * 4, 20)}px` }}
              />
              <div className="mt-1 text-sm font-semibold text-gray-900">{trend.cases}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Tribunal Trends */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Tribunal Performance Trends</h2>
          <div className="space-y-4">
            {tribunalTrends.length > 0 ? (
              tribunalTrends.map((trend) => (
                <div key={trend.tribunal} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{trend.tribunal}</span>
                    <div className="flex items-center gap-2">
                      {trend.yearOverYearChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : trend.yearOverYearChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span
                        className={`text-sm ${
                          trend.yearOverYearChange > 0
                            ? 'text-green-600'
                            : trend.yearOverYearChange < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {trend.yearOverYearChange > 0 ? '+' : ''}
                        {trend.yearOverYearChange}% YoY
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{trend.totalCases} total cases</span>
                    <span>{trend.successRate}% success rate</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No tribunal trend data available</p>
            )}
          </div>
        </div>

        {/* Outcome Trends */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Outcome Trends</h2>
          <div className="space-y-4">
            {outcomeTrends.length > 0 ? (
              outcomeTrends.map((trend) => (
                <div key={trend.outcome} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{trend.outcome}</span>
                    <div className="flex items-center gap-2">
                      {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {trend.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      <span
                        className={`text-sm ${
                          trend.trend === 'up'
                            ? 'text-green-600'
                            : trend.trend === 'down'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {trend.changePercent > 0 ? '+' : ''}
                        {trend.changePercent}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{trend.count} cases this year</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No outcome trend data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-primary-900">
          <BarChart3 className="h-5 w-5" />
          Key Insights
        </h2>
        <ul className="space-y-2 text-sm text-primary-800">
          {yearlyTrends.length >= 2 && (
            <li>
              • Case volume{' '}
              {yearlyTrends[yearlyTrends.length - 1].cases >
              yearlyTrends[yearlyTrends.length - 2].cases
                ? 'increased'
                : 'decreased'}{' '}
              by{' '}
              {Math.abs(
                Math.round(
                  ((yearlyTrends[yearlyTrends.length - 1].cases -
                    yearlyTrends[yearlyTrends.length - 2].cases) /
                    yearlyTrends[yearlyTrends.length - 2].cases) *
                    100
                )
              )}
              % compared to last year
            </li>
          )}
          {tribunalTrends.length > 0 && (
            <li>
              • {tribunalTrends[0].tribunal} leads with {tribunalTrends[0].totalCases} total cases
            </li>
          )}
          {outcomeTrends.length > 0 && (
            <li>
              • Most common outcome: {outcomeTrends[0].outcome} ({outcomeTrends[0].count} cases this
              year)
            </li>
          )}
          <li>• Race-related cases represent a significant portion of tribunal decisions</li>
        </ul>
      </div>
    </div>
  )
}
