'use client'

/**
 * Evidence Bundles List
 * View and manage all evidence bundles for the organization
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { listEvidenceBundles, type EvidenceBundleMetadata } from '@/lib/services/evidence-bundles'
import { Package, Plus, FileText, Calendar, Tag, Eye } from 'lucide-react'

export default function EvidenceBundlesPage() {
  const router = useRouter()
  const [bundles, setBundles] = useState<EvidenceBundleMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadBundles()
  }, [filterStatus])

  async function loadBundles() {
    try {
      setLoading(true)
      const orgId = 'demo-org-id' // TODO: Replace with session
      const status = filterStatus === 'all' ? undefined : (filterStatus as any)
      const data = await listEvidenceBundles(orgId, status)
      setBundles(data)
    } catch (error) {
      console.error('Error loading evidence bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      case 'finalized':
        return 'bg-green-100 text-green-700'
      case 'archived':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  function getBundleTypeLabel(type: string) {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Evidence Bundles</h1>
            <p className="text-gray-600">
              Comprehensive compliance evidence packages
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/evidence-bundles/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            New Bundle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <div className="flex gap-2">
            {['all', 'draft', 'finalized', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      {bundles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No evidence bundles yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first evidence bundle to package compliance documentation
          </p>
          <button
            onClick={() => router.push('/admin/evidence-bundles/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create Evidence Bundle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/admin/evidence-bundles/${bundle.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        bundle.status
                      )}`}
                    >
                      {bundle.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{bundle.bundle_name}</h3>
                
                <div className="text-sm text-gray-600 mb-4">
                  {getBundleTypeLabel(bundle.bundle_type)}
                </div>

                {bundle.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bundle.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(bundle.created_at).toLocaleDateString()}
                  </div>
                </div>

                {bundle.tags && bundle.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {bundle.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {bundle.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{bundle.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/admin/evidence-bundles/${bundle.id}`)
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
