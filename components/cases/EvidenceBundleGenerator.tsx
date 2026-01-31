'use client'

/**
 * Evidence Bundle PDF Generator Component
 * Demonstrates server-side PDF generation with compliance-grade storage
 *
 * Usage: Add to tribunal case details page or admin interface
 * Example: <EvidenceBundleGenerator caseId={tribunalCase.id} caseTitle={tribunalCase.title} />
 */

import { useState } from 'react'
import { createEvidenceBundle } from '@/lib/actions/evidence-bundles'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface EvidenceBundleGeneratorProps {
  caseId: string
  caseTitle: string
  includeAttachments?: boolean
}

export function EvidenceBundleGenerator({
  caseId,
  caseTitle,
  includeAttachments = false,
}: EvidenceBundleGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateBundle = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await createEvidenceBundle(caseId, includeAttachments)

      if (!result.success) {
        setError(result.error || 'Failed to generate evidence bundle')
        return
      }

      // Download the PDF via signed URL
      if (result.url) {
        // Open in new tab or download
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.fileName || 'evidence-bundle.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setSuccess(true)

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err: any) {
      console.error('Evidence bundle generation error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-teal-100 p-2">
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Evidence Bundle</h3>
            <p className="mt-1 text-sm text-gray-600">
              Generate a compliance-grade PDF bundle with immutable storage and integrity
              verification.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-500">
              <li>• Server-side generation (deterministic)</li>
              <li>• SHA-256 checksum verification</li>
              <li>• Immutable Supabase Storage</li>
              <li>• Complete audit trail</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Case: <span className="font-medium text-gray-900">{caseTitle}</span>
          </div>
          <Button
            onClick={handleGenerateBundle}
            disabled={loading}
            variant={success ? 'outline' : 'default'}
            className={
              success ? 'border-green-500 text-green-600' : 'bg-teal-600 hover:bg-teal-700'
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success && <CheckCircle className="mr-2 h-4 w-4" />}
            {!loading && !success && <Download className="mr-2 h-4 w-4" />}
            {loading ? 'Generating...' : success ? 'Generated!' : 'Generate PDF Bundle'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-green-50 p-3">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <div className="text-sm text-green-800">
              Evidence bundle generated successfully! Download started automatically.
            </div>
          </div>
        )}
      </div>

      {/* Usage Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-900">📘 Compliance-Grade Features</h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>
            <strong>Immutable Storage:</strong> PDFs stored in Supabase Storage with unique paths
            (no overwrites)
          </li>
          <li>
            <strong>Integrity Verification:</strong> SHA-256 checksums calculated server-side
          </li>
          <li>
            <strong>Audit Trail:</strong> Full tracking of generation, access, and downloads
          </li>
          <li>
            <strong>Deterministic Output:</strong> Same input always produces identical PDF
            (reproducible evidence)
          </li>
          <li>
            <strong>Access Control:</strong> Organization-based RLS with signed URLs (1-hour expiry)
          </li>
        </ul>
      </div>
    </div>
  )
}
