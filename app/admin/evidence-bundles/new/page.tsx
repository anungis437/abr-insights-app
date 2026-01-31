'use client'

/**
 * Evidence Bundle Builder
 * Create comprehensive compliance evidence packages
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createEvidenceBundle,
  addComponentToBundle,
  createPolicyMapping,
  generatePolicyMappings,
  buildEvidenceTimeline,
  updateBundleStatus,
  type EvidenceBundleMetadata,
  type PolicyMapping,
} from '@/lib/services/evidence-bundles'
import {
  Package,
  FileText,
  BookOpen,
  Shield,
  Award,
  ClipboardCheck,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react'

export default function EvidenceBundleBuilderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [bundleId, setBundleId] = useState<string | null>(null)

  // Step 1: Bundle metadata
  const [bundleName, setBundleName] = useState('')
  const [bundleType, setBundleType] =
    useState<EvidenceBundleMetadata['bundle_type']>('incident_response')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Step 2: Selected components
  const [selectedComponents, setSelectedComponents] = useState<
    Array<{
      type: string
      id: string
      title: string
    }>
  >([])

  // Step 3: Policy mappings
  const [policyMappings, setPolicyMappings] = useState<PolicyMapping[]>([])
  const [newMapping, setNewMapping] = useState<Partial<PolicyMapping>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bundleTypes = [
    { value: 'incident_response', label: 'Incident Response', icon: AlertCircle },
    { value: 'audit_compliance', label: 'Audit Compliance', icon: ClipboardCheck },
    { value: 'policy_review', label: 'Policy Review', icon: Shield },
    { value: 'training_validation', label: 'Training Validation', icon: BookOpen },
    { value: 'custom', label: 'Custom Bundle', icon: Package },
  ]

  const componentTypes = [
    { value: 'tribunal_case', label: 'Tribunal Case', icon: FileText },
    { value: 'training_record', label: 'Training Record', icon: BookOpen },
    { value: 'certificate', label: 'Certificate', icon: Award },
    { value: 'policy_document', label: 'Policy Document', icon: Shield },
    { value: 'audit_log', label: 'Audit Log', icon: ClipboardCheck },
    { value: 'quiz_result', label: 'Quiz Result', icon: CheckCircle },
  ]

  function addTag() {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleCreateBundle() {
    try {
      setLoading(true)
      setError(null)

      // Get user/org IDs from session
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        setError('No organization found')
        return
      }

      const userId = user.id
      const orgId = profile.organization_id

      const bundle = await createEvidenceBundle(
        orgId,
        bundleName,
        bundleType,
        userId,
        description,
        tags
      )

      setBundleId(bundle.id)
      setStep(2)
    } catch (err) {
      setError('Failed to create evidence bundle')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddComponents() {
    if (!bundleId) return

    try {
      setLoading(true)
      setError(null)

      for (const component of selectedComponents) {
        await addComponentToBundle(bundleId, component.type as any, component.id, component.title)
      }

      // Generate suggested policy mappings if tribunal case included
      const tribunalCases = selectedComponents.filter((c) => c.type === 'tribunal_case')
      if (tribunalCases.length > 0) {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

          if (profile?.organization_id) {
            const suggestions = await generatePolicyMappings(
              profile.organization_id,
              tribunalCases[0].id
            )
            setPolicyMappings(suggestions)
          }
        }
      }

      setStep(3)
    } catch (err) {
      setError('Failed to add components')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddPolicyMapping() {
    if (!bundleId || !newMapping.policy_reference || !newMapping.policy_title) return

    try {
      await createPolicyMapping(bundleId, newMapping as any)
      setPolicyMappings([...policyMappings, newMapping as PolicyMapping])
      setNewMapping({})
    } catch (err) {
      setError('Failed to add policy mapping')
      console.error(err)
    }
  }

  async function handleFinalizeBundle() {
    if (!bundleId) return

    try {
      setLoading(true)
      setError(null)

      // Build timeline
      await buildEvidenceTimeline(bundleId)

      // Finalize bundle
      await updateBundleStatus(bundleId, 'finalized')

      router.push(`/admin/evidence-bundles/${bundleId}`)
    } catch (err) {
      setError('Failed to finalize bundle')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function addComponent(type: string) {
    // In production, this would open a modal to select specific items
    const id = `${type}-${Date.now()}`
    const title = `Sample ${type.replace('_', ' ')}`
    setSelectedComponents([...selectedComponents, { type, id, title }])
  }

  function removeComponent(index: number) {
    setSelectedComponents(selectedComponents.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Evidence Bundle Builder</h1>
        <p className="text-gray-600">Create comprehensive compliance evidence packages</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              1
            </div>
            <span className="font-medium">Bundle Info</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div
            className={`flex items-center gap-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              2
            </div>
            <span className="font-medium">Add Components</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div
            className={`flex items-center gap-3 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              3
            </div>
            <span className="font-medium">Policy Mappings</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div
            className={`flex items-center gap-3 ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              4
            </div>
            <span className="font-medium">Review & Finalize</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Step 1: Bundle Metadata */}
      {step === 1 && (
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-6 text-xl font-semibold">Bundle Information</h2>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bundle Name *</label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="e.g., Q4 2025 Compliance Audit"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bundle Type *</label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {bundleTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBundleType(type.value as any)}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      bundleType === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon
                      className={`mx-auto mb-2 h-6 w-6 ${
                        bundleType === type.value ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this evidence bundle..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTag}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBundle}
              disabled={!bundleName || loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Next Step'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Components */}
      {step === 2 && (
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-6 text-xl font-semibold">Add Evidence Components</h2>

          <div className="mb-8">
            <p className="mb-4 text-sm text-gray-600">
              Select the types of evidence to include in this bundle:
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {componentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addComponent(type.value)}
                  className="rounded-lg border-2 border-dashed border-gray-300 p-4 transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  <Plus className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  <type.icon className="mx-auto mb-2 h-6 w-6 text-gray-600" />
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 font-semibold">
              Selected Components ({selectedComponents.length})
            </h3>
            {selectedComponents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No components added yet. Click above to add evidence.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedComponents.map((component, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      {componentTypes.find((t) => t.value === component.type)?.icon && (
                        <div className="rounded bg-blue-50 p-2">
                          {(() => {
                            const Icon = componentTypes.find(
                              (t) => t.value === component.type
                            )!.icon
                            return <Icon className="h-5 w-5 text-blue-600" />
                          })()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{component.title}</div>
                        <div className="text-sm capitalize text-gray-500">
                          {component.type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeComponent(index)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Remove component ${component.title}`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleAddComponents}
              disabled={selectedComponents.length === 0 || loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Next Step'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Policy Mappings */}
      {step === 3 && (
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-6 text-xl font-semibold">Policy Mappings</h2>

          <div className="mb-8">
            <p className="mb-4 text-sm text-gray-600">
              Link tribunal cases to relevant training and organizational policies:
            </p>

            {policyMappings.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Suggested Mappings</h3>
                <div className="space-y-3">
                  {policyMappings.map((mapping, index) => (
                    <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="mb-2 font-medium text-blue-900">{mapping.policy_title}</div>
                      <div className="mb-2 text-sm text-blue-700">{mapping.mapping_rationale}</div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Case: {mapping.tribunal_case_title}</span>
                        <span>Training: {mapping.related_training_title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
              <h3 className="mb-4 font-semibold">Add Custom Mapping</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Policy Reference"
                  value={newMapping.policy_reference || ''}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, policy_reference: e.target.value })
                  }
                  className="rounded-lg border px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Policy Title"
                  value={newMapping.policy_title || ''}
                  onChange={(e) => setNewMapping({ ...newMapping, policy_title: e.target.value })}
                  className="rounded-lg border px-4 py-2"
                />
                <textarea
                  placeholder="Mapping Rationale"
                  value={newMapping.mapping_rationale || ''}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, mapping_rationale: e.target.value })
                  }
                  className="col-span-2 rounded-lg border px-4 py-2"
                  rows={2}
                />
              </div>
              <button
                onClick={handleAddPolicyMapping}
                disabled={!newMapping.policy_reference || !newMapping.policy_title}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Mapping
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Finalize */}
      {step === 4 && (
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="mb-6 text-xl font-semibold">Review & Finalize</h2>

          <div className="mb-8 space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Bundle Name</h3>
              <p className="text-gray-700">{bundleName}</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Components</h3>
              <p className="text-gray-700">{selectedComponents.length} items included</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Policy Mappings</h3>
              <p className="text-gray-700">{policyMappings.length} mappings created</p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Ready to Finalize</span>
              </div>
              <p className="text-sm text-green-600">
                Your evidence bundle will be finalized and a chronological timeline will be
                generated automatically.
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleFinalizeBundle}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Finalizing...' : 'Finalize Bundle'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
