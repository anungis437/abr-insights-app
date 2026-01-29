'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import {
  Scale,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Calendar,
  BookmarkPlus,
  TrendingUp,
} from 'lucide-react'

interface TribunalCase {
  id: string
  case_number: string
  case_title: string
  tribunal_name: string
  decision_date: string
  primary_category: string
  summary: string
  views_count: number
  bookmarks_count: number
  language: string
  created_at: string
  updated_at: string
}

export default function AdminCasesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState<TribunalCase[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTribunal, setFilterTribunal] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLanguage, setFilterLanguage] = useState('all')

  useEffect(() => {
    const checkAuthAndLoadCases = async () => {
      const supabase = createClient()
      // Check auth
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      logger.auth('Current user check', { userId: currentUser?.id, email: currentUser?.email })
      if (!currentUser) {
        logger.auth('No user found, redirecting to login')
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Check admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

      logger.db('Profile lookup', 'profiles', { userId: currentUser.id, hasData: !!profileData })
      if (profileError) {
        logger.error('Profile fetch error', profileError)
      }

      const isAdmin =
        profileData?.role === 'super_admin' ||
        profileData?.role === 'org_admin' ||
        profileData?.role === 'compliance_officer' ||
        profileData?.role === 'educator'

      logger.auth('User role check', { role: profileData?.role, isAdmin })

      if (!isAdmin) {
        logger.warn('Unauthorized, redirecting to home', { role: profileData?.role })
        router.push('/')
        setIsLoading(false)
        return
      }

      logger.auth('Authorization successful, loading cases')
      // Load cases
      const { data: casesData, error } = await supabase
        .from('tribunal_cases')
        .select('*')
        .order('decision_date', { ascending: false })
        .limit(100)

      if (!error && casesData) {
        setCases(casesData)
      }

      setIsLoading(false)
    }

    checkAuthAndLoadCases()
  }, [router])

  // Apply filters with useMemo (derived state)
  const filteredCases = useMemo(() => {
    let filtered = [...cases]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.tribunal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Tribunal filter
    if (filterTribunal !== 'all') {
      filtered = filtered.filter((c) => c.tribunal_name === filterTribunal)
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((c) => c.primary_category === filterCategory)
    }

    // Language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter((c) => c.language === filterLanguage)
    }

    return filtered
  }, [searchQuery, filterTribunal, filterCategory, filterLanguage, cases])

  const handleDelete = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('tribunal_cases').delete().eq('id', caseId)

    if (!error) {
      setCases(cases.filter((c) => c.id !== caseId))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const tribunals = [...new Set(cases.map((c) => c.tribunal_name))].filter(Boolean)
  const categories = [...new Set(cases.map((c) => c.primary_category))].filter(Boolean)
  const stats = {
    total: cases.length,
    tribunals: tribunals.length,
    categories: categories.length,
    totalViews: cases.reduce((sum, c) => sum + (c.views_count || 0), 0),
    totalBookmarks: cases.reduce((sum, c) => sum + (c.bookmarks_count || 0), 0),
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <Scale className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
                  <p className="mt-1 text-gray-600">Manage tribunal cases and legal content</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/cases/create')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white transition-all hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add Case
              </button>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.tribunals}</div>
                    <div className="text-sm text-gray-600">Tribunals</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Filter className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <Eye className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <BookmarkPlus className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
                    <div className="text-sm text-gray-600">Bookmarks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="min-w-[300px] flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Tribunal Filter */}
                <select
                  value={filterTribunal}
                  onChange={(e) => setFilterTribunal(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter cases by tribunal"
                >
                  <option value="all">All Tribunals</option>
                  {tribunals.map((tribunal) => (
                    <option key={tribunal} value={tribunal}>
                      {tribunal}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter cases by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Language Filter */}
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter cases by language"
                >
                  <option value="all">All Languages</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {filteredCases.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Scale className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No cases found</p>
              </div>
            ) : (
              filteredCases.map((tribunalCase) => (
                <div
                  key={tribunalCase.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                        <Scale className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {tribunalCase.case_title}
                            </h3>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              {tribunalCase.case_number}
                            </span>
                            {tribunalCase.language && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase text-gray-800">
                                {tribunalCase.language}
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {tribunalCase.summary}
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Scale className="h-4 w-4" />
                          {tribunalCase.tribunal_name}
                        </span>
                        {tribunalCase.decision_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(tribunalCase.decision_date).toLocaleDateString()}
                          </span>
                        )}
                        {tribunalCase.primary_category && (
                          <span className="capitalize">{tribunalCase.primary_category}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {tribunalCase.views_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <BookmarkPlus className="h-4 w-4" />
                          {tribunalCase.bookmarks_count || 0} bookmarks
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/cases/${tribunalCase.id}`)}
                          className="flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2 text-purple-700 transition-colors hover:bg-purple-200"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cases/${tribunalCase.id}/edit`)}
                          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tribunalCase.id)}
                          className="ml-auto flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>{' '}
    </div>
  )
}
