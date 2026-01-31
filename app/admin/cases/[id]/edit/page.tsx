'use client'

import { logger } from '@/lib/utils/production-logger'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CaseFormData {
  case_number: string
  case_title: string
  citation: string
  tribunal_name: string
  tribunal_province: string
  decision_date: string
  filing_date: string
  applicant: string
  respondent: string
  summary: string
  full_text: string
  decision: string
  primary_category: string
  subcategories: string[]
  key_issues: string[]
  remedies: string[]
  outcomes: string[]
  tags: string[]
  url: string
  pdf_url: string
}

const initialFormData: CaseFormData = {
  case_number: '',
  case_title: '',
  citation: '',
  tribunal_name: '',
  tribunal_province: '',
  decision_date: '',
  filing_date: '',
  applicant: '',
  respondent: '',
  summary: '',
  full_text: '',
  decision: '',
  primary_category: '',
  subcategories: [''],
  key_issues: [''],
  remedies: [''],
  outcomes: [''],
  tags: [''],
  url: '',
  pdf_url: '',
}

const PROVINCES = [
  { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'AB', label: 'Alberta' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'YT', label: 'Yukon' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'Federal', label: 'Federal' },
]

export default function EditCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CaseFormData>(initialFormData)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    const isAdmin =
      profileData?.role === 'super_admin' ||
      profileData?.role === 'org_admin' ||
      profileData?.role === 'compliance_officer' ||
      profileData?.role === 'educator'

    if (!isAdmin) {
      router.push('/')
      return
    }

    setUser(currentUser)
    await loadCase()
  }

  const loadCase = async () => {
    try {
      setIsLoading(true)
      const { data: caseData, error: fetchError } = await supabase
        .from('tribunal_cases')
        .select('*')
        .eq('id', caseId)
        .single()

      if (fetchError) throw fetchError
      if (!caseData) {
        setError('Case not found')
        return
      }

      setFormData({
        case_number: caseData.case_number || '',
        case_title: caseData.case_title || '',
        citation: caseData.citation || '',
        tribunal_name: caseData.tribunal_name || '',
        tribunal_province: caseData.tribunal_province || '',
        decision_date: caseData.decision_date || '',
        filing_date: caseData.filing_date || '',
        applicant: caseData.applicant || '',
        respondent: caseData.respondent || '',
        summary: caseData.summary || '',
        full_text: caseData.full_text || '',
        decision: caseData.decision || '',
        primary_category: caseData.primary_category || '',
        subcategories:
          Array.isArray(caseData.subcategories) && caseData.subcategories.length > 0
            ? caseData.subcategories
            : [''],
        key_issues:
          Array.isArray(caseData.key_issues) && caseData.key_issues.length > 0
            ? caseData.key_issues
            : [''],
        remedies:
          Array.isArray(caseData.remedies) && caseData.remedies.length > 0
            ? caseData.remedies
            : [''],
        outcomes:
          Array.isArray(caseData.outcomes) && caseData.outcomes.length > 0
            ? caseData.outcomes
            : [''],
        tags: Array.isArray(caseData.tags) && caseData.tags.length > 0 ? caseData.tags : [''],
        url: caseData.url || '',
        pdf_url: caseData.pdf_url || '',
      })
    } catch (err) {
      logger.error('Error loading case:', { error: err, context: 'EditCasePage' })
      setError('Failed to load case')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.case_number.trim()) {
      return 'Case number is required'
    }
    if (!formData.case_title.trim()) {
      return 'Case title is required'
    }
    if (!formData.tribunal_name.trim()) {
      return 'Tribunal name is required'
    }
    if (!formData.decision_date) {
      return 'Decision date is required'
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Clean up array fields - remove empty strings
      const cleanedData = {
        case_number: formData.case_number,
        case_title: formData.case_title,
        citation: formData.citation,
        tribunal_name: formData.tribunal_name,
        tribunal_province: formData.tribunal_province,
        decision_date: formData.decision_date,
        filing_date: formData.filing_date,
        applicant: formData.applicant,
        respondent: formData.respondent,
        summary: formData.summary,
        full_text: formData.full_text,
        decision: formData.decision,
        primary_category: formData.primary_category,
        subcategories: formData.subcategories.filter((item) => item.trim() !== ''),
        key_issues: formData.key_issues.filter((item) => item.trim() !== ''),
        remedies: formData.remedies.filter((item) => item.trim() !== ''),
        outcomes: formData.outcomes.filter((item) => item.trim() !== ''),
        tags: formData.tags.filter((item) => item.trim() !== ''),
        url: formData.url,
        pdf_url: formData.pdf_url,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('tribunal_cases')
        .update(cleanedData)
        .eq('id', caseId)

      if (updateError) throw updateError

      router.push('/admin/cases')
    } catch (err) {
      logger.error('Error updating case:', { error: err, context: 'EditCasePage' })
      setError('Failed to update case. Please try again.')
      setIsSaving(false)
    }
  }

  const addArrayItem = (field: keyof CaseFormData) => {
    const value = formData[field]
    if (Array.isArray(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...value, ''],
      }))
    }
  }

  const removeArrayItem = (field: keyof CaseFormData, index: number) => {
    const value = formData[field]
    if (Array.isArray(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value.filter((_, i) => i !== index),
      }))
    }
  }

  const updateArrayItem = (field: keyof CaseFormData, index: number, newValue: string) => {
    const value = formData[field]
    if (Array.isArray(value)) {
      const updated = [...value]
      updated[index] = newValue
      setFormData((prev) => ({
        ...prev,
        [field]: updated,
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading case...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/cases"
            className="mb-4 inline-flex items-center text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tribunal Case</h1>
          <p className="mt-2 text-gray-600">Update case information</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Basic Information</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Case Number *
                </label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, case_number: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 2023 HRTO 456"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Citation</label>
                <input
                  type="text"
                  value={formData.citation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, citation: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Full case citation"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Case Title *</label>
                <input
                  type="text"
                  value={formData.case_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, case_title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Smith v. ABC Corporation"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tribunal Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Tribunal Information</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tribunal Name *
                </label>
                <input
                  type="text"
                  value={formData.tribunal_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tribunal_name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Human Rights Tribunal of Ontario"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="tribunal-province"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Province/Territory
                </label>
                <select
                  id="tribunal-province"
                  value={formData.tribunal_province}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tribunal_province: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Province/Territory</option>
                  {PROVINCES.map((province) => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="decision-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Decision Date *
                </label>
                <input
                  id="decision-date"
                  type="date"
                  value={formData.decision_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, decision_date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="filing-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Filing Date
                </label>
                <input
                  id="filing-date"
                  type="date"
                  value={formData.filing_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, filing_date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Parties</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Applicant</label>
                <input
                  type="text"
                  value={formData.applicant}
                  onChange={(e) => setFormData((prev) => ({ ...prev, applicant: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Applicant name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Respondent</label>
                <input
                  type="text"
                  value={formData.respondent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, respondent: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Respondent name"
                />
              </div>
            </div>
          </div>

          {/* Case Content */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Case Content</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief summary of the case"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Text</label>
                <textarea
                  value={formData.full_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, full_text: e.target.value }))}
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Complete case text"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Decision</label>
                <textarea
                  value={formData.decision}
                  onChange={(e) => setFormData((prev) => ({ ...prev, decision: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tribunal's decision"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Classification</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Primary Category
                </label>
                <input
                  type="text"
                  value={formData.primary_category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, primary_category: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Human Rights, Labour Relations"
                />
              </div>

              {/* Subcategories */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subcategories
                </label>
                <div className="space-y-2">
                  {formData.subcategories.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('subcategories', index, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Subcategory"
                      />
                      {formData.subcategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('subcategories', index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Remove subcategory"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('subcategories')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Subcategory
                  </button>
                </div>
              </div>

              {/* Key Issues */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Key Issues</label>
                <div className="space-y-2">
                  {formData.key_issues.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('key_issues', index, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Key issue or legal question"
                      />
                      {formData.key_issues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('key_issues', index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Remove key issue"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('key_issues')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Key Issue
                  </button>
                </div>
              </div>

              {/* Remedies */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Remedies</label>
                <div className="space-y-2">
                  {formData.remedies.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('remedies', index, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Remedy granted"
                      />
                      {formData.remedies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('remedies', index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Remove remedy"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('remedies')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Remedy
                  </button>
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Outcomes</label>
                <div className="space-y-2">
                  {formData.outcomes.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('outcomes', index, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Case outcome"
                      />
                      {formData.outcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('outcomes', index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Remove outcome"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('outcomes')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Outcome
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Tags</h2>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tag"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', index)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      aria-label="Remove tag"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </button>
            </div>
          </div>

          {/* URLs */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Resources</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Case URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cases/123"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">PDF URL</label>
                <input
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pdf_url: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cases/123.pdf"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="button"
              onClick={() => router.push('/admin/cases')}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Updating...' : 'Update Case'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
