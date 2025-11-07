'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
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
    tags: ['']
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
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
      profileData?.role === 'admin' ||
      profileData?.role === 'super_admin' ||
      profileData?.role === 'org_admin' ||
      profileData?.role === 'compliance_officer'

    if (!isAdmin) {
      router.push('/')
      return
    }

    setUser(currentUser)
    setIsLoading(false)
  }

  const addArrayItem = (field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'subcategories' | 'key_issues' | 'remedies' | 'outcomes' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
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
        subcategories: formData.subcategories.filter(item => item.trim()),
        key_issues: formData.key_issues.filter(item => item.trim()),
        remedies: formData.remedies.filter(item => item.trim()),
        outcomes: formData.outcomes.filter(item => item.trim()),
        tags: formData.tags.filter(item => item.trim()),
        decision_date: formData.decision_date || null,
        filing_date: formData.filing_date || null,
        ingestion_source: 'manual',
        ingestion_status: 'completed'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/cases')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-600" />
            Add New Tribunal Case
          </h1>
          <p className="text-gray-600 mt-2">Enter the details of a tribunal decision or case</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Case Identification */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Identification</h2>
            
            <div className="space-y-4">
              {/* Case Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Number *
                </label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.case_number ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 2024 HRTO 123"
                />
                {errors.case_number && <p className="text-red-500 text-sm mt-1">{errors.case_number}</p>}
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  value={formData.case_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, case_title: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.case_title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Smith v. ABC Corporation"
                />
                {errors.case_title && <p className="text-red-500 text-sm mt-1">{errors.case_title}</p>}
              </div>

              {/* Citation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citation
                </label>
                <input
                  type="text"
                  value={formData.citation}
                  onChange={(e) => setFormData(prev => ({ ...prev, citation: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Legal citation reference"
                />
              </div>
            </div>
          </div>

          {/* Tribunal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tribunal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tribunal Name *
                </label>
                <input
                  type="text"
                  value={formData.tribunal_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, tribunal_name: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.tribunal_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Human Rights Tribunal of Ontario"
                />
                {errors.tribunal_name && <p className="text-red-500 text-sm mt-1">{errors.tribunal_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={formData.tribunal_province}
                    onChange={(e) => setFormData(prev => ({ ...prev, tribunal_province: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    value={formData.filing_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, filing_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Date
                  </label>
                  <input
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, decision_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicant
                </label>
                <input
                  type="text"
                  value={formData.applicant}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicant: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Name of applicant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respondent
                </label>
                <input
                  type="text"
                  value={formData.respondent}
                  onChange={(e) => setFormData(prev => ({ ...prev, respondent: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Name of respondent"
                />
              </div>
            </div>
          </div>

          {/* Case Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief summary of the case..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Text
                </label>
                <textarea
                  value={formData.full_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_text: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Complete case text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision
                </label>
                <textarea
                  value={formData.decision}
                  onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Final decision or outcome..."
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Classification</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Category
                </label>
                <input
                  type="text"
                  value={formData.primary_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Human Rights, Labour Relations"
                />
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategories
                </label>
                <div className="space-y-2">
                  {formData.subcategories.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('subcategories', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Subcategory"
                      />
                      {formData.subcategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('subcategories', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('subcategories')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subcategory
                  </button>
                </div>
              </div>

              {/* Key Issues */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Issues
                </label>
                <div className="space-y-2">
                  {formData.key_issues.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('key_issues', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Key issue or legal question"
                      />
                      {formData.key_issues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('key_issues', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('key_issues')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Key Issue
                  </button>
                </div>
              </div>

              {/* Remedies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remedies
                </label>
                <div className="space-y-2">
                  {formData.remedies.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('remedies', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Remedy granted"
                      />
                      {formData.remedies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('remedies', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('remedies')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Remedy
                  </button>
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcomes
                </label>
                <div className="space-y-2">
                  {formData.outcomes.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem('outcomes', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Case outcome"
                      />
                      {formData.outcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('outcomes', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('outcomes')}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Outcome
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tag"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>
          </div>

          {/* URLs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cases/123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cases/123.pdf"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/cases')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Case'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
