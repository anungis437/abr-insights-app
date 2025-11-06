'use client';

export const dynamic = 'force-dynamic';

/**
 * Case Detail Page - Full Case View
 * Dynamic route for viewing individual tribunal case details
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface IngestionJob {
  id: string;
  job_type: string;
  source_system: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  cases_stored: number;
  avg_confidence_score: number | null;
}

interface CaseDetail {
  id: string;
  case_title: string | null;
  case_number: string | null;
  citation: string | null;
  tribunal_name: string | null;
  decision_date: string | null;
  filing_date: string | null;
  hearing_date: string | null;
  applicant: string | null;
  respondent: string | null;
  adjudicator: string | null;
  source_system: string;
  source_url: string | null;
  document_type: string;
  language: string;
  full_text: string;
  rule_based_classification?: {
    category: string;
    confidence: number;
    reasoning?: string;
    signals?: string[];
  };
  ai_classification?: {
    category: string;
    confidence: number;
    reasoning?: string;
    keyPhrases?: string[];
  } | null;
  combined_confidence: number;
  discrimination_grounds?: string[];
  key_issues?: string[];
  remedies?: string[];
  is_intersectional?: boolean;
  extraction_quality?: string;
  extraction_warnings?: string[];
  needs_review: boolean;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  ingestion_job?: IngestionJob;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analysis' | 'metadata'>('overview');

  const fetchCaseDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cases/${caseId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Case not found');
        }
        throw new Error(`Failed to fetch case: ${response.statusText}`);
      }

      const data = await response.json();
      setCaseDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case');
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId, fetchCaseDetail]);

  // Helper functions
  const getClassificationColor = (category: string): string => {
    if (category === 'anti_black_racism') return 'bg-red-100 text-red-800 border-red-300';
    if (category === 'other_discrimination') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getClassificationLabel = (category: string): string => {
    if (category === 'anti_black_racism') return 'Anti-Black Racism';
    if (category === 'other_discrimination') return 'Other Discrimination';
    return 'Non-Discrimination';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getQualityColor = (quality: string): string => {
    if (quality === 'high') return 'bg-green-100 text-green-800';
    if (quality === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Case</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={fetchCaseDetail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Retry
              </button>
              <Link
                href="/cases/browse"
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center font-medium"
              >
                Back to Cases
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseDetail) return null;

  const category = caseDetail.ai_classification?.category || caseDetail.rule_based_classification?.category || 'non_discrimination';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Link
          href="/cases/browse"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cases
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {caseDetail.case_title || 'Untitled Case'}
              </h1>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getClassificationColor(category)}`}>
                  {getClassificationLabel(category)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(caseDetail.combined_confidence)}`}>
                  {(caseDetail.combined_confidence * 100).toFixed(1)}% Confidence
                </span>
                {caseDetail.is_intersectional && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                    Intersectional
                  </span>
                )}
                {caseDetail.needs_review && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    Needs Review
                  </span>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Citation</span>
                  <p className="font-medium text-gray-900">{caseDetail.citation || caseDetail.case_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tribunal</span>
                  <p className="font-medium text-gray-900">{caseDetail.tribunal_name || caseDetail.source_system}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Decision Date</span>
                  <p className="font-medium text-gray-900">{formatDate(caseDetail.decision_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Document Type</span>
                  <p className="font-medium text-gray-900 capitalize">{caseDetail.document_type.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-4">
              {caseDetail.source_url && (
                <a
                  href={caseDetail.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                >
                  View Source
                </a>
              )}
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">
                Bookmark
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'content', 'analysis', 'metadata'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Parties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Parties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Applicant</p>
                      <p className="font-medium text-gray-900">{caseDetail.applicant || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Respondent</p>
                      <p className="font-medium text-gray-900">{caseDetail.respondent || 'Not specified'}</p>
                    </div>
                  </div>
                  {caseDetail.adjudicator && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Adjudicator</p>
                      <p className="font-medium text-gray-900">{caseDetail.adjudicator}</p>
                    </div>
                  )}
                </div>

                {/* Key Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Filing Date', value: caseDetail.filing_date },
                      { label: 'Hearing Date', value: caseDetail.hearing_date },
                      { label: 'Decision Date', value: caseDetail.decision_date }
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">{label}</p>
                        <p className="font-medium text-gray-900">{formatDate(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discrimination Grounds */}
                {caseDetail.discrimination_grounds && caseDetail.discrimination_grounds.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Discrimination Grounds</h3>
                    <div className="flex flex-wrap gap-2">
                      {caseDetail.discrimination_grounds.map((ground, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {ground}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Issues */}
                {caseDetail.key_issues && caseDetail.key_issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Issues</h3>
                    <ul className="space-y-2">
                      {caseDetail.key_issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Remedies */}
                {caseDetail.remedies && caseDetail.remedies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Remedies</h3>
                    <ul className="space-y-2">
                      {caseDetail.remedies.map((remedy, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Case Text</h3>
                <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {caseDetail.full_text}
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Rule-Based Classification */}
                {caseDetail.rule_based_classification && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rule-Based Classification</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(caseDetail.rule_based_classification.category)}`}>
                          {getClassificationLabel(caseDetail.rule_based_classification.category)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(caseDetail.rule_based_classification.confidence)}`}>
                          {(caseDetail.rule_based_classification.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      </div>
                      {caseDetail.rule_based_classification.reasoning && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Reasoning</p>
                          <p className="text-gray-800">{caseDetail.rule_based_classification.reasoning}</p>
                        </div>
                      )}
                      {caseDetail.rule_based_classification.signals && caseDetail.rule_based_classification.signals.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Detected Signals</p>
                          <div className="flex flex-wrap gap-2">
                            {caseDetail.rule_based_classification.signals.map((signal, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700">
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Classification */}
                {caseDetail.ai_classification && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Classification</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(caseDetail.ai_classification.category)}`}>
                          {getClassificationLabel(caseDetail.ai_classification.category)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(caseDetail.ai_classification.confidence)}`}>
                          {(caseDetail.ai_classification.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Reasoning</p>
                        <p className="text-gray-800">{caseDetail.ai_classification.reasoning}</p>
                      </div>
                      {caseDetail.ai_classification.keyPhrases && caseDetail.ai_classification.keyPhrases.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Key Phrases</p>
                          <div className="flex flex-wrap gap-2">
                            {caseDetail.ai_classification.keyPhrases.map((phrase, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700">
                                {phrase}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Extraction Quality */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Extraction Quality</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(caseDetail.extraction_quality || 'medium')}`}>
                      {caseDetail.extraction_quality?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    {caseDetail.extraction_warnings && caseDetail.extraction_warnings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Warnings</p>
                        <ul className="space-y-1">
                          {caseDetail.extraction_warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Notes */}
                {caseDetail.review_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Notes</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-800">{caseDetail.review_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <div className="space-y-6">
                {/* Case Metadata */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Case ID', value: caseDetail.id, mono: true },
                      { label: 'Source System', value: caseDetail.source_system },
                      { label: 'Document Type', value: caseDetail.document_type.replace('_', ' '), capitalize: true },
                      { label: 'Language', value: caseDetail.language.toUpperCase() },
                      { label: 'Created At', value: formatDate(caseDetail.created_at) },
                      { label: 'Updated At', value: formatDate(caseDetail.updated_at) }
                    ].map(({ label, value, mono, capitalize }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">{label}</p>
                        <p className={`font-medium ${mono ? 'font-mono text-sm' : ''} ${capitalize ? 'capitalize' : ''}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {caseDetail.source_url && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Source URL</p>
                      <a
                        href={caseDetail.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-sm"
                      >
                        {caseDetail.source_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Ingestion Job */}
                {caseDetail.ingestion_job && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingestion Job</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Job ID</p>
                        <p className="font-mono text-sm">{caseDetail.ingestion_job.id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Job Type</p>
                        <p className="font-medium capitalize">{caseDetail.ingestion_job.job_type.replace('_', ' ')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                          caseDetail.ingestion_job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {caseDetail.ingestion_job.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Cases Stored</p>
                        <p className="font-medium">{caseDetail.ingestion_job.cases_stored}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Started At</p>
                        <p className="font-medium">{formatDate(caseDetail.ingestion_job.started_at)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Completed At</p>
                        <p className="font-medium">{formatDate(caseDetail.ingestion_job.completed_at)}</p>
                      </div>
                      {caseDetail.ingestion_job.avg_confidence_score && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Avg Confidence Score</p>
                          <p className="font-medium">
                            {(caseDetail.ingestion_job.avg_confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
