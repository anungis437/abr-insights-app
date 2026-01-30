'use client'

/**
 * Evidence Bundle Detail View
 * Display bundle contents, timeline, and export options
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getEvidenceBundle,
  exportEvidenceBundle,
  type EvidenceBundle,
} from '@/lib/services/evidence-bundles'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Package,
  CheckCircle,
  Clock,
} from 'lucide-react'

export default function EvidenceBundleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bundleId = params.id as string

  const [bundle, setBundle] = useState<EvidenceBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadBundle()
  }, [bundleId])

  async function loadBundle() {
    try {
      setLoading(true)
      const data = await getEvidenceBundle(bundleId)
      setBundle(data)
    } catch (error) {
      console.error('Error loading evidence bundle:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(format: 'pdf' | 'zip' | 'json') {
    try {
      setExporting(true)
      const blob = await exportEvidenceBundle(bundleId, {
        format,
        include_attachments: true,
        include_raw_data: format === 'json',
        template: 'executive',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${bundle?.bundle_name || 'evidence-bundle'}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting bundle:', error)
    } finally {
      setExporting(false)
    }
  }

  function getEventIcon(eventType: string) {
    switch (eventType) {
      case 'tribunal_decision':
        return '⚖️'
      case 'training_completed':
        return '🎓'
      case 'policy_updated':
        return '📋'
      case 'audit_conducted':
        return '🔍'
      case 'remediation':
        return '🔧'
      case 'incident':
        return '⚠️'
      default:
        return '📌'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Evidence bundle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Evidence Bundles
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bundle.bundle_name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(bundle.created_at).toLocaleDateString()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                bundle.status === 'finalized'
                  ? 'bg-green-100 text-green-700'
                  : bundle.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {bundle.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'PDF'}
            </button>
            <button
              onClick={() => handleExport('zip')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'ZIP'}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'JSON'}
            </button>
          </div>
        </div>
      </div>

      {bundle.description && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{bundle.description}</p>
        </div>
      )}

      {/* Components */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Components ({bundle.components.length})
        </h2>
        <div className="space-y-3">
          {bundle.components.map((component) => (
            <div key={component.component_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-50 rounded">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{component.component_title}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {component.component_type.replace('_', ' ')}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(component.included_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {bundle.components.length === 0 && (
            <p className="text-center text-gray-500 py-4">No components added</p>
          )}
        </div>
      </div>

      {/* Policy Mappings */}
      {bundle.policy_mappings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Policy Mappings</h2>
          <div className="space-y-4">
            {bundle.policy_mappings.map((mapping, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-900 mb-2">{mapping.policy_title}</div>
                <div className="text-sm text-blue-700 mb-2">{mapping.mapping_rationale}</div>
                <div className="flex gap-4 text-xs text-gray-600">
                  {mapping.tribunal_case_title && (
                    <span>Case: {mapping.tribunal_case_title}</span>
                  )}
                  {mapping.related_training_title && (
                    <span>Training: {mapping.related_training_title}</span>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      mapping.compliance_status === 'compliant'
                        ? 'bg-green-100 text-green-700'
                        : mapping.compliance_status === 'non_compliant'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {mapping.compliance_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {bundle.timeline_events.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Evidence Timeline
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {bundle.timeline_events.map((event, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-2xl">
                      {getEventIcon(event.event_type)}
                    </div>
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.event_title}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.event_description}</p>
                      {event.related_component_type && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                            {event.related_component_type.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline end marker */}
            <div className="relative flex gap-4">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-white flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900">Bundle Finalized</h3>
                  <p className="text-sm text-green-700">
                    Evidence package ready for distribution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
