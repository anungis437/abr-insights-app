'use client'

/**
 * Evidence Bundle Detail View
 * Display bundle contents, timeline, and export options
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFeatureAccess } from '@/hooks/use-entitlements'
import {
  getEvidenceBundle,
  exportEvidenceBundle,
  type EvidenceBundle,
} from '@/lib/services/evidence-bundles'
import { ArrowLeft, FileText, Calendar, Download, Package, CheckCircle, Clock } from 'lucide-react'

export default function EvidenceBundleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bundleId = params.id as string
  const canExport = useFeatureAccess('exportCapabilities')

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
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
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Evidence Bundles
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{bundle.bundle_name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(bundle.created_at).toLocaleDateString()}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  bundle.status === 'finalized'
                    ? 'bg-green-100 text-green-700'
                    : bundle.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                {bundle.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting || !canExport}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
              title={canExport ? 'Export to PDF' : 'Upgrade to Professional for export features'}
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'PDF'}
            </button>
            <button
              onClick={() => handleExport('zip')}
              disabled={exporting || !canExport}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
              title={canExport ? 'Export to ZIP' : 'Upgrade to Professional for export features'}
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'ZIP'}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting || !canExport}
              className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
              title={canExport ? 'Export to JSON' : 'Upgrade to Professional for export features'}
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'JSON'}
            </button>
          </div>
        </div>
      </div>

      {bundle.description && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <p className="text-gray-700">{bundle.description}</p>
        </div>
      )}

      {/* Components */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5" />
          Components ({bundle.components.length})
        </h2>
        <div className="space-y-3">
          {bundle.components.map((component) => (
            <div
              key={component.component_id}
              className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
            >
              <div className="rounded bg-blue-50 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{component.component_title}</div>
                <div className="text-sm capitalize text-gray-500">
                  {component.component_type.replace('_', ' ')}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(component.included_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {bundle.components.length === 0 && (
            <p className="py-4 text-center text-gray-500">No components added</p>
          )}
        </div>
      </div>

      {/* Policy Mappings */}
      {bundle.policy_mappings.length > 0 && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Policy Mappings</h2>
          <div className="space-y-4">
            {bundle.policy_mappings.map((mapping, index) => (
              <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 font-medium text-blue-900">{mapping.policy_title}</div>
                <div className="mb-2 text-sm text-blue-700">{mapping.mapping_rationale}</div>
                <div className="flex gap-4 text-xs text-gray-600">
                  {mapping.tribunal_case_title && <span>Case: {mapping.tribunal_case_title}</span>}
                  {mapping.related_training_title && (
                    <span>Training: {mapping.related_training_title}</span>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
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
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            Evidence Timeline
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {bundle.timeline_events.map((event, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-2xl">
                      {getEventIcon(event.event_type)}
                    </div>
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-6">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{event.event_title}</h3>
                        <span className="ml-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.event_description}</p>
                      {event.related_component_type && (
                        <div className="mt-2">
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs capitalize text-blue-700">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="font-semibold text-green-900">Bundle Finalized</h3>
                  <p className="text-sm text-green-700">Evidence package ready for distribution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
