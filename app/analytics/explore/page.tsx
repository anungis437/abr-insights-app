'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database, Search, Filter, Download, RefreshCw, FileText } from 'lucide-react'
import Link from 'next/link'

interface DataSet {
  name: string
  records: string
  lastUpdated: string
}

interface TribunalCase {
  id: string
  case_number: string | null
  title: string
  tribunal: string
  decision_date: string | null
  outcome: string | null
  is_race_related: boolean
  key_themes: string[] | null
  created_at: string
}

interface FilterState {
  dataSource: string
  timeRange: string
  search: string
  tribunal: string
  outcome: string
  raceRelated: string
}

export default function DataExplorerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [dataSets, setDataSets] = useState<DataSet[]>([])
  const [cases, setCases] = useState<TribunalCase[]>([])
  const [filteredCases, setFilteredCases] = useState<TribunalCase[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    dataSource: 'tribunal_cases',
    timeRange: '30d',
    search: '',
    tribunal: '',
    outcome: '',
    raceRelated: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      await loadData()
    }

    checkAuth()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get counts for datasets
      const { count: casesCount } = await supabase
        .from('tribunal_cases')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setDataSets([
        { name: 'Tribunal Cases', records: casesCount?.toString() || '0', lastUpdated: 'Live' },
        { name: 'Courses', records: coursesCount?.toString() || '0', lastUpdated: 'Live' },
        { name: 'Users', records: usersCount?.toString() || '0', lastUpdated: 'Live' },
      ])

      // Load initial cases
      await runQuery()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runQuery = async () => {
    try {
      let query = supabase
        .from('tribunal_cases')
        .select('*')
        .is('deleted_at', null)
        .order('decision_date', { ascending: false })
        .limit(100)

      // Apply time range filter
      if (filters.timeRange !== 'all') {
        const now = new Date()
        let startDate: Date
        switch (filters.timeRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(0)
        }
        query = query.gte('created_at', startDate.toISOString())
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,case_number.ilike.%${filters.search}%`)
      }

      // Apply tribunal filter
      if (filters.tribunal) {
        query = query.eq('tribunal', filters.tribunal)
      }

      // Apply outcome filter
      if (filters.outcome) {
        query = query.eq('outcome', filters.outcome)
      }

      // Apply race-related filter
      if (filters.raceRelated === 'true') {
        query = query.eq('is_race_related', true)
      } else if (filters.raceRelated === 'false') {
        query = query.eq('is_race_related', false)
      }

      const { data, error, count } = await query

      if (error) throw error

      setCases(data || [])
      setFilteredCases(data || [])
      setTotalCount(data?.length || 0)
    } catch (error) {
      console.error('Error running query:', error)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleRunQuery = () => {
    runQuery()
  }

  const handleExport = () => {
    // Export filtered data as CSV
    const csvContent = [
      ['Case Number', 'Title', 'Tribunal', 'Decision Date', 'Outcome', 'Race Related'].join(','),
      ...filteredCases.map((c) =>
        [
          c.case_number || '',
          `"${c.title?.replace(/"/g, '""')}"`,
          c.tribunal,
          c.decision_date || '',
          c.outcome || '',
          c.is_race_related ? 'Yes' : 'No',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tribunal-cases-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
          <p className="mt-2 text-gray-600">Query and analyze tribunal case data</p>
        </div>
        <div className="flex gap-3">
          <button onClick={runQuery} className="btn-outline flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Data Sets */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        {dataSets.map((dataset) => (
          <div
            key={dataset.name}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-50 p-3">
                <Database className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dataset.name}</p>
                <p className="text-2xl font-bold text-gray-900">{dataset.records}</p>
                <p className="text-xs text-gray-500">Updated {dataset.lastUpdated}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Query Builder */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Query Builder</h2>

        <div className="space-y-4">
          {/* Data Source */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="dataSource" className="mb-2 block text-sm font-medium text-gray-700">
                Data Source
              </label>
              <select
                id="dataSource"
                className="input w-full"
                value={filters.dataSource}
                onChange={(e) => handleFilterChange('dataSource', e.target.value)}
              >
                <option value="tribunal_cases">Tribunal Cases</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeRange" className="mb-2 block text-sm font-medium text-gray-700">
                Time Range
              </label>
              <select
                id="timeRange"
                className="input w-full"
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="tribunal" className="mb-2 block text-sm font-medium text-gray-700">
                Tribunal
              </label>
              <select
                id="tribunal"
                className="input w-full"
                value={filters.tribunal}
                onChange={(e) => handleFilterChange('tribunal', e.target.value)}
              >
                <option value="">All Tribunals</option>
                <option value="HRTO">HRTO</option>
                <option value="CHRT">CHRT</option>
                <option value="BCHRT">BCHRT</option>
                <option value="AHRC">AHRC</option>
              </select>
            </div>
            <div>
              <label htmlFor="outcome" className="mb-2 block text-sm font-medium text-gray-700">
                Outcome
              </label>
              <select
                id="outcome"
                className="input w-full"
                value={filters.outcome}
                onChange={(e) => handleFilterChange('outcome', e.target.value)}
              >
                <option value="">All Outcomes</option>
                <option value="Upheld">Upheld</option>
                <option value="Dismissed">Dismissed</option>
                <option value="Settled">Settled</option>
                <option value="Partially Upheld">Partially Upheld</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label htmlFor="raceRelated" className="mb-2 block text-sm font-medium text-gray-700">
                Race Related
              </label>
              <select
                id="raceRelated"
                className="input w-full"
                value={filters.raceRelated}
                onChange={(e) => handleFilterChange('raceRelated', e.target.value)}
              >
                <option value="">All Cases</option>
                <option value="true">Race Related Only</option>
                <option value="false">Non-Race Related</option>
              </select>
            </div>
          </div>

          {/* Search and Run */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search case titles or numbers..."
                  className="input w-full pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <button onClick={handleRunQuery} className="btn-primary">
              Run Query
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Query Results</h2>
              <p className="text-sm text-gray-600">
                Showing {filteredCases.length} of {totalCount} results
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tribunal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Decision Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Race Related
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCases.length > 0 ? (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                      {caseItem.case_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {caseItem.title?.substring(0, 80)}
                      {caseItem.title && caseItem.title.length > 80 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.tribunal}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {caseItem.decision_date
                        ? new Date(caseItem.decision_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {caseItem.outcome || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {caseItem.is_race_related ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/tribunal-cases/${caseItem.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No results found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
