/**
 * Evidence Bundle Test Page
 * Demonstrates server-side PDF generation with compliance-grade storage
 *
 * Access: /test-evidence-bundles
 *
 * Features:
 * - Live demonstration of server-side PDF generation
 * - Compliance-grade storage with immutable files
 * - SHA-256 checksums for integrity verification
 * - Complete audit trail
 */

import { createClient } from '@/lib/supabase/server'
import { EvidenceBundleGenerator } from '@/components/cases/EvidenceBundleGenerator'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TestEvidenceBundlesPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/test-evidence-bundles')
  }

  // Get a sample tribunal case for testing
  const { data: sampleCases } = await supabase
    .from('tribunal_cases')
    .select('id, title, case_number, tribunal, decision_date')
    .is('deleted_at', null)
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Evidence Bundle Generator</h1>
          <p className="mt-2 text-gray-600">
            Test server-side PDF generation with compliance-grade storage
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="mb-8 rounded-lg border border-teal-200 bg-teal-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-teal-900">🏗️ Server-Side Architecture</h2>
          <div className="space-y-3 text-sm text-teal-800">
            <div className="flex gap-3">
              <div className="font-semibold">1. User Request →</div>
              <div>Button click triggers server action</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">2. Authentication →</div>
              <div>Verify user via Supabase (RLS applied)</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">3. Data Fetch →</div>
              <div>Query tribunal case with organization isolation</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">4. PDF Generation →</div>
              <div>Create deterministic PDF with pdf-lib (server-side)</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">5. Checksum →</div>
              <div>Calculate SHA-256 for integrity verification</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">6. Storage →</div>
              <div>Upload to Supabase Storage (immutable, no overwrites)</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">7. Database →</div>
              <div>Create evidence_bundle_pdfs record with metadata</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">8. Audit Log →</div>
              <div>Record generation event with full context</div>
            </div>
            <div className="flex gap-3">
              <div className="font-semibold">9. Signed URL →</div>
              <div>Return time-limited download link (1-hour expiry)</div>
            </div>
          </div>
        </div>

        {/* Sample Cases */}
        {sampleCases && sampleCases.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Test with Sample Cases</h2>
            {sampleCases.map((tribunalCase) => (
              <EvidenceBundleGenerator
                key={tribunalCase.id}
                caseId={tribunalCase.id}
                caseTitle={
                  tribunalCase.title ||
                  tribunalCase.case_number ||
                  `Case ${tribunalCase.id.substring(0, 8)}`
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No Cases Found</h3>
            <p className="mt-2 text-gray-600">
              No tribunal cases available for testing. Import some cases first.
            </p>
            <Link
              href="/admin/ingestion"
              className="mt-4 inline-block rounded-md bg-teal-600 px-6 py-2 text-white hover:bg-teal-700"
            >
              Go to Ingestion
            </Link>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Technical Implementation</h2>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Database Schema</h3>
            <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">
              {`CREATE TABLE evidence_bundle_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES tribunal_cases(id),
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT NOT NULL,          -- SHA-256
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);`}
            </pre>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Storage Bucket</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>Name:</strong> evidence-bundle-pdfs
              </li>
              <li>
                <strong>Access:</strong> Private (requires authentication)
              </li>
              <li>
                <strong>Size Limit:</strong> 50 MB per file
              </li>
              <li>
                <strong>MIME Types:</strong> application/pdf, application/zip
              </li>
              <li>
                <strong>RLS Policies:</strong> Organization-based access control
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Compliance Standards</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ NIST SP 800-86 (Guide to Integrating Forensic Techniques)</li>
              <li>✅ ISO/IEC 27037:2012 (Digital Evidence Guidelines)</li>
              <li>✅ Chain of custody via audit logs</li>
              <li>✅ Integrity verification via SHA-256 checksums</li>
              <li>✅ Immutable storage (no file overwrites)</li>
              <li>✅ Deterministic generation (reproducible evidence)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Files Created</h3>
            <ul className="space-y-2 font-mono text-sm text-gray-700">
              <li>• supabase/migrations/020_evidence_bundles_tracking.sql</li>
              <li>• lib/services/pdf-generator-server.ts</li>
              <li>• lib/actions/evidence-bundles.ts</li>
              <li>• components/cases/EvidenceBundleGenerator.tsx</li>
              <li>• docs/deployment/EVIDENCE_BUNDLES_STORAGE_SETUP.md</li>
            </ul>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Documentation</h3>
          <div className="space-y-2">
            <Link
              href="/docs/architecture/EVIDENCE_BUNDLES_TECHNICAL_DEBT.md"
              className="block text-sm text-teal-600 hover:text-teal-700 hover:underline"
            >
              → Technical Debt Documentation
            </Link>
            <Link
              href="/docs/deployment/EVIDENCE_BUNDLES_STORAGE_SETUP.md"
              className="block text-sm text-teal-600 hover:text-teal-700 hover:underline"
            >
              → Storage Setup Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
