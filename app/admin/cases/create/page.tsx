'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Scale, Plus, X, Calendar } from 'lucide-react'

export default function CreateCasePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
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
    url: '',
    pdf_url: '',
    document_type: 'decision',
    language: 'en',
    tags: [''],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const checkAuth = useCallback(async () => {
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
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const addArrayItem = (
    field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }))
  }

  const removeArrayItem = (
    field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags',
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const updateArrayItem = (
    field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.case_number.trim()) newErrors.case_number = 'Case number is required'
    if (!formData.case_title.trim()) newErrors.case_title = 'Case title is required'
    if (!formData.tribunal_name.trim()) newErrors.tribunal_name = 'Tribunal name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const caseData = {
        ...formData,
        subcategories: formData.subcategories.filter((item) => item.trim()),
        key_issues: formData.key_issues.filter((item) => item.trim()),
        remedies: formData.remedies.filter((item) => item.trim()),
        outcomes: formData.outcomes.filter((item) => item.trim()),
        tags: formData.tags.filter((item) => item.trim()),
        decision_date: formData.decision_date || null,
        filing_date: formData.filing_date || null,
        ingestion_source: 'manual',
        ingestion_status: 'completed',
      }

      const { data, error } = await supabase
        .from('tribunal_cases')
        .insert([caseData])
        .select()
        .single()

      if (error) throw error

      alert('Case created successfully!')
      router.push('/admin/cases')
    } catch (error: any) {
      alert('Error creating case: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/cases')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </button>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Scale className="h-8 w-8 text-purple-600" />
            Add New Tribunal Case
          </h1>
          <p className="mt-2 text-gray-600">Enter the details of a tribunal decision or case</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Case Identification */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Case Identification</h2>

            <div className="space-y-4">
              {/* Case Number */}
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
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.case_number ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 2024 HRTO 123"
                />
                {errors.case_number && (
                  <p className="mt-1 text-sm text-red-500">{errors.case_number}</p>
                )}
              </div>

              {/* Case Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Case Title *</label>
                <input
                  type="text"
                  value={formData.case_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, case_title: e.target.value }))}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.case_title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Smith v. ABC Corporation"
                />
                {errors.case_title && (
                  <p className="mt-1 text-sm text-red-500">{errors.case_title}</p>
                )}
              </div>

              {/* Citation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Citation</label>
                <input
                  type="text"
                  value={formData.citation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, citation: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Legal citation reference"
                />
              </div>
            </div>
          </div>

          {/* Tribunal Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Tribunal Information</h2>

            <div className="space-y-4">
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
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.tribunal_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Human Rights Tribunal of Ontario"
                />
                {errors.tribunal_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.tribunal_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="create-tribunal-province"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Province
                  </label>
                  <select
                    id="create-tribunal-province"
                    value={formData.tribunal_province}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tribunal_province: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select province</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="YT">Yukon</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="FEDERAL">Federal</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="create-language"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Language
                  </label>
                  <select
                    id="create-language"
                    value={formData.language}
                    onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="create-filing-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Filing Date
                  </label>
                  <input
                    id="create-filing-date"
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, filing_date: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-decision-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Decision Date
                  </label>
                  <input
                    id="create-decision-date"
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, decision_date: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                  placeholder="Name of applicant"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Respondent</label>
                <input
                  type="text"
                  value={formData.respondent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, respondent: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Name of respondent"
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
                  placeholder="Brief summary of the case..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Text</label>
                <textarea
                  value={formData.full_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, full_text: e.target.value }))}
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Complete case text..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Decision</label>
                <textarea
                  value={formData.decision}
                  onChange={(e) => setFormData((prev) => ({ ...prev, decision: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Final decision or outcome..."
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
              {isSaving ? 'Saving...' : 'Save Case'}
            </button>
          </div>
        </div>
      </div>{' '}
    </div>
  )
}
