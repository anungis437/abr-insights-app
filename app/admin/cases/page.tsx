'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  TrendingUp
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
  const [filteredCases, setFilteredCases] = useState<TribunalCase[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTribunal, setFilterTribunal] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLanguage, setFilterLanguage] = useState('all')

  useEffect(() => {
    const checkAuthAndLoadCases = async () => {
      const supabase = createClient()
      // Check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      console.log('[Cases Page] Current user:', currentUser?.id, currentUser?.email)
      if (!currentUser) {
        console.log('[Cases Page] No user found, redirecting to login')
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

      console.log('[Cases Page] Profile data:', profileData)
      console.log('[Cases Page] Profile error:', profileError)

      const isAdmin = 
        profileData?.role === 'super_admin' ||
        profileData?.role === 'org_admin' ||
        profileData?.role === 'compliance_officer' ||
        profileData?.role === 'educator'

      console.log('[Cases Page] User role:', profileData?.role, 'isAdmin:', isAdmin)

      if (!isAdmin) {
        console.log('[Cases Page] Unauthorized, redirecting to dashboard')
        router.push('/')
        setIsLoading(false)
        return
      }

      console.log('[Cases Page] Authorization successful, loading cases')
      // Load cases
      const { data: casesData, error } = await supabase
        .from('tribunal_cases')
        .select('*')
        .order('decision_date', { ascending: false })
        .limit(100)

      if (!error && casesData) {
        setCases(casesData)
        setFilteredCases(casesData)
      }

      setIsLoading(false)
    }

    checkAuthAndLoadCases()
  }, [router])

  // Apply filters
  useEffect(() => {
    let filtered = [...cases]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tribunal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Tribunal filter
    if (filterTribunal !== 'all') {
      filtered = filtered.filter(c => c.tribunal_name === filterTribunal)
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.primary_category === filterCategory)
    }

    // Language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(c => c.language === filterLanguage)
    }

    setFilteredCases(filtered)
  }, [searchQuery, filterTribunal, filterCategory, filterLanguage, cases])

  const handleDelete = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('tribunal_cases')
      .delete()
      .eq('id', caseId)

    if (!error) {
      setCases(cases.filter(c => c.id !== caseId))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const tribunals = [...new Set(cases.map(c => c.tribunal_name))].filter(Boolean)
  const categories = [...new Set(cases.map(c => c.primary_category))].filter(Boolean)
  const stats = {
    total: cases.length,
    tribunals: tribunals.length,
    categories: categories.length,
    totalViews: cases.reduce((sum, c) => sum + (c.views_count || 0), 0),
    totalBookmarks: cases.reduce((sum, c) => sum + (c.bookmarks_count || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Scale className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
                  <p className="text-gray-600 mt-1">Manage tribunal cases and legal content</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/cases/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Case
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.tribunals}</div>
                    <div className="text-sm text-gray-600">Tribunals</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.categories}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BookmarkPlus className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
                    <div className="text-sm text-gray-600">Bookmarks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Tribunal Filter */}
                <select
                  value={filterTribunal}
                  onChange={(e) => setFilterTribunal(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter cases by tribunal"
                >
                  <option value="all">All Tribunals</option>
                  {tribunals.map(tribunal => (
                    <option key={tribunal} value={tribunal}>{tribunal}</option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter cases by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Language Filter */}
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No cases found</p>
              </div>
            ) : (
              filteredCases.map((tribunalCase) => (
                <div key={tribunalCase.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <Scale className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{tribunalCase.case_title}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {tribunalCase.case_number}
                            </span>
                            {tribunalCase.language && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full uppercase">
                                {tribunalCase.language}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{tribunalCase.summary}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Scale className="w-4 h-4" />
                          {tribunalCase.tribunal_name}
                        </span>
                        {tribunalCase.decision_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(tribunalCase.decision_date).toLocaleDateString()}
                          </span>
                        )}
                        {tribunalCase.primary_category && (
                          <span className="capitalize">{tribunalCase.primary_category}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {tribunalCase.views_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <BookmarkPlus className="w-4 h-4" />
                          {tribunalCase.bookmarks_count || 0} bookmarks
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/cases/${tribunalCase.id}`)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/cases/${tribunalCase.id}/edit`)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tribunalCase.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
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
      </main>    </div>
  )
}
