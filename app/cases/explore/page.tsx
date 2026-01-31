'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Tribunal Cases Data Explorer
 * Migrated from: legacy/src/pages/DataExplorer.jsx
 *
 * Features:
 * - Comprehensive tribunal case search and filtering
 * - Statistics overview (total, upheld, dismissed, avg award)
 * - Saved searches for authenticated users
 * - Enhanced filtering on tribunal, outcome, protected grounds, etc.
 * - Load more pagination
 * - Card grid layout with detailed information
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

interface TribunalCase {
  id: string
  title: string
  case_number: string | null
  decision_date: string | null
  tribunal: string
  decision_type: string | null
  jurisdiction: string | null
  summary: string | null
  full_text: string | null
  url: string | null
  outcome: string | null
  remedies: string[] | null
  key_themes: string[] | null
  parties_involved: string[] | null
  legal_issues: string[] | null
  created_at: string
  updated_at: string
}

interface SavedSearch {
  id: string
  user_id: string
  name: string
  search_type: string
  query_text: string | null
  filters: Record<string, any> | null
  is_favorite: boolean
  last_used_at: string | null
  use_count: number
  created_at: string
}

interface FilterState {
  searchTerm: string
  selectedTribunal: string
  selectedOutcome: string
  yearMin: number | null
  yearMax: number | null
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DataExplorer() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<any>(null)
  const [cases, setCases] = useState<TribunalCase[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedTribunal: 'all',
    selectedOutcome: 'all',
    yearMin: null,
    yearMax: null,
  })
  const [visibleCount, setVisibleCount] = useState(12)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [supabase.auth])

  // Load tribunal cases
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('tribunal_cases')
          .select('*')
          .is('deleted_at', null)
          .order('decision_date', { ascending: false })

        if (error) throw error
        setCases(data || [])
      } catch (error) {
        logger.error('Error fetching cases:', { error: error, context: 'DataExplorer' })
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [supabase])

  // Load saved searches for authenticated user
  useEffect(() => {
    if (!user) return

    const fetchSavedSearches = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id)
          .eq('search_type', 'tribunal_cases')
          .is('deleted_at', null)
          .order('last_used_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        setSavedSearches(data || [])
      } catch (error) {
        logger.error('Error fetching saved searches:', { error: error, context: 'DataExplorer' })
      }
    }

    fetchSavedSearches()
  }, [user, supabase])

  // Filter cases based on current filters
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Text search
      const matchesSearch =
        !filters.searchTerm ||
        c.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.case_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.summary?.toLowerCase().includes(filters.searchTerm.toLowerCase())

      // Tribunal filter
      const matchesTribunal =
        filters.selectedTribunal === 'all' || c.tribunal === filters.selectedTribunal

      // Outcome filter
      const matchesOutcome =
        filters.selectedOutcome === 'all' || c.outcome === filters.selectedOutcome

      // Year range
      const year = c.decision_date ? new Date(c.decision_date).getFullYear() : null
      const matchesYearMin = !filters.yearMin || (year && year >= filters.yearMin)
      const matchesYearMax = !filters.yearMax || (year && year <= filters.yearMax)

      return matchesSearch && matchesTribunal && matchesOutcome && matchesYearMin && matchesYearMax
    })
  }, [cases, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredCases.length
    const byOutcome = filteredCases.reduce(
      (acc, c) => {
        const outcome = c.outcome || 'Unknown'
        acc[outcome] = (acc[outcome] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return { total, byOutcome }
  }, [filteredCases])

  // Get unique tribunals and years for filters
  const tribunals = useMemo(() => {
    const unique = [...new Set(cases.map((c) => c.tribunal).filter(Boolean))]
    return unique.sort()
  }, [cases])

  const years = useMemo(() => {
    const unique = [
      ...new Set(
        cases
          .map((c) => {
            if (!c.decision_date) return null
            return new Date(c.decision_date).getFullYear()
          })
          .filter(Boolean)
      ),
    ]
    return (unique as number[]).sort((a, b) => b - a)
  }, [cases])

  // Displayed cases (with pagination)
  const displayedCases = filteredCases.slice(0, visibleCount)

  // Handlers
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
    setVisibleCount(12) // Reset pagination
  }

  const handleClearAll = () => {
    setFilters({
      searchTerm: '',
      selectedTribunal: 'all',
      selectedOutcome: 'all',
      yearMin: null,
      yearMax: null,
    })
    setVisibleCount(12)
  }

  const handleSaveSearch = async () => {
    if (!user || !searchName.trim()) return

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        name: searchName,
        search_type: 'tribunal_cases',
        query_text: filters.searchTerm || null,
        filters: filters,
        is_favorite: false,
        use_count: 1,
        last_used_at: new Date().toISOString(),
      })

      if (error) throw error

      // Reload saved searches
      const { data } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .eq('search_type', 'tribunal_cases')
        .is('deleted_at', null)
        .order('last_used_at', { ascending: false, nullsFirst: false })

      setSavedSearches(data || [])
      setSearchName('')
      setShowSaveDialog(false)
    } catch (error) {
      logger.error('Error saving search:', { error: error, context: 'DataExplorer' })
      alert('Failed to save search. Please try again.')
    }
  }

  const handleLoadSearch = async (search: SavedSearch) => {
    if (search.filters) {
      setFilters(search.filters as FilterState)
      setVisibleCount(12)

      // Update last_used_at and use_count
      if (user) {
        await supabase
          .from('saved_searches')
          .update({
            last_used_at: new Date().toISOString(),
            use_count: search.use_count + 1,
          })
          .eq('id', search.id)
      }
    }
  }

  const handleDeleteSearch = async (searchId: string) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) return

    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', searchId)

      if (error) throw error

      setSavedSearches(savedSearches.filter((s) => s.id !== searchId))
    } catch (error) {
      logger.error('Error deleting search:', { error: error, context: 'DataExplorer' })
      alert('Failed to delete search. Please try again.')
    }
  }

  const handleToggleFavorite = async (searchId: string) => {
    const search = savedSearches.find((s) => s.id === searchId)
    if (!search) return

    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ is_favorite: !search.is_favorite })
        .eq('id', searchId)

      if (error) throw error

      // Update local state
      setSavedSearches(
        savedSearches.map((s) => (s.id === searchId ? { ...s, is_favorite: !s.is_favorite } : s))
      )
    } catch (error) {
      logger.error('Error toggling favorite:', { error: error, context: 'DataExplorer' })
    }
  }

  // Helper: Get outcome color
  const getOutcomeColor = (outcome: string | null) => {
    if (!outcome) return 'bg-gray-100 text-gray-800'
    if (outcome.includes('Upheld')) return 'bg-green-100 text-green-800'
    if (outcome === 'Dismissed') return 'bg-red-100 text-red-800'
    if (outcome === 'Withdrawn') return 'bg-gray-100 text-gray-800'
    if (outcome === 'Settled') return 'bg-purple-100 text-purple-800'
    return 'bg-blue-100 text-blue-800'
  }

  // Render
  return (
    <>
      {' '}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Tribunal Cases Explorer</h1>
                <p className="text-gray-600">
                  Analyze tribunal decisions with advanced filtering and insights
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border-l-4 border-l-teal-500 bg-white p-6 shadow-md">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="mt-1 text-sm text-gray-600">Filtered Cases</div>
            </div>
            <div className="rounded-lg border-l-4 border-l-green-500 bg-white p-6 shadow-md">
              <div className="text-3xl font-bold text-green-700">
                {stats.byOutcome['Upheld - Full'] || 0}
              </div>
              <div className="mt-1 text-sm text-gray-600">Cases Upheld</div>
            </div>
            <div className="rounded-lg border-l-4 border-l-red-500 bg-white p-6 shadow-md">
              <div className="text-3xl font-bold text-red-700">
                {stats.byOutcome['Dismissed'] || 0}
              </div>
              <div className="mt-1 text-sm text-gray-600">Cases Dismissed</div>
            </div>
            <div className="rounded-lg border-l-4 border-l-purple-500 bg-white p-6 shadow-md">
              <div className="text-3xl font-bold text-purple-700">
                {stats.byOutcome['Settled'] || 0}
              </div>
              <div className="mt-1 text-sm text-gray-600">Cases Settled</div>
            </div>
          </div>

          {/* Layout with Sidebar */}
          <div className="mb-8 grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              {/* Search Filter */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Search</h3>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Basic Filters */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>

                <div className="space-y-4">
                  {/* Tribunal */}
                  <div>
                    <label
                      htmlFor="tribunal-filter"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Tribunal
                    </label>
                    <select
                      id="tribunal-filter"
                      value={filters.selectedTribunal}
                      onChange={(e) => handleFilterChange({ selectedTribunal: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Tribunals</option>
                      {tribunals.map((tribunal) => (
                        <option key={tribunal} value={tribunal}>
                          {tribunal}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Outcome */}
                  <div>
                    <label
                      htmlFor="outcome-filter"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Outcome
                    </label>
                    <select
                      id="outcome-filter"
                      value={filters.selectedOutcome}
                      onChange={(e) => handleFilterChange({ selectedOutcome: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Outcomes</option>
                      <option value="Upheld - Full">Upheld - Full</option>
                      <option value="Upheld - Partial">Upheld - Partial</option>
                      <option value="Dismissed">Dismissed</option>
                      <option value="Withdrawn">Withdrawn</option>
                      <option value="Settled">Settled</option>
                    </select>
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Year Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={filters.yearMin || ''}
                        onChange={(e) =>
                          handleFilterChange({
                            yearMin: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        aria-label="Year from"
                      >
                        <option value="">From</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filters.yearMax || ''}
                        onChange={(e) =>
                          handleFilterChange({
                            yearMax: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        aria-label="Year to"
                      >
                        <option value="">To</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={handleClearAll}
                    className="w-full rounded-md border border-red-600 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Saved Searches */}
              {user && (
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Saved Searches</h3>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      + Save
                    </button>
                  </div>

                  {savedSearches.length === 0 ? (
                    <p className="text-sm text-gray-500">No saved searches yet</p>
                  ) : (
                    <div className="space-y-2">
                      {savedSearches.slice(0, 5).map((search) => (
                        <div key={search.id} className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => handleToggleFavorite(search.id)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            {search.is_favorite ? 'â˜…' : 'â˜†'}
                          </button>
                          <button
                            onClick={() => handleLoadSearch(search)}
                            className="flex-1 truncate text-left text-teal-600 hover:text-teal-700"
                          >
                            {search.name}
                          </button>
                          <button
                            onClick={() => handleDeleteSearch(search.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            Ã—
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600"></div>
                  <p className="mt-4 text-gray-600">Loading cases...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-md">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="mb-2 text-gray-600">No cases found matching your filters.</p>
                  <p className="mb-4 text-sm text-gray-500">Try adjusting your search criteria</p>
                  <button
                    onClick={handleClearAll}
                    className="rounded-md border border-teal-600 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Case Cards */}
                  <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedCases.map((tribunalCase) => (
                      <div
                        key={tribunalCase.id}
                        className="rounded-lg border-2 border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-teal-500 hover:shadow-xl"
                      >
                        <Link href={`/tribunal-cases/${tribunalCase.id}`}>
                          <div className="p-6">
                            {/* Header */}
                            <div className="mb-3 flex items-start justify-between">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOutcomeColor(tribunalCase.outcome)}`}
                              >
                                {tribunalCase.outcome || 'Unknown'}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors hover:text-teal-600">
                              {tribunalCase.title}
                            </h3>

                            {/* Summary */}
                            <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                              {tribunalCase.summary || 'No summary available'}
                            </p>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {tribunalCase.case_number || 'N/A'}
                              </span>
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                {tribunalCase.tribunal}
                              </span>
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {tribunalCase.decision_date
                                  ? new Date(tribunalCase.decision_date).getFullYear()
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleCount < filteredCases.length && (
                    <div className="text-center">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        className="rounded-md bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
                      >
                        Load More Cases ({filteredCases.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Save Search Dialog */}
          {showSaveDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Save Search</h3>
                <input
                  type="text"
                  placeholder="Enter search name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSearch}
                    disabled={!searchName.trim()}
                    className="flex-1 rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false)
                      setSearchName('')
                    }}
                    className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
