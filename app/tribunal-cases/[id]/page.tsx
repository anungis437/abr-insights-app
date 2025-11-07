'use client';

/**
 * Tribunal Case Details Page
 * Migrated from: legacy/src/pages/CaseDetails.jsx
 * 
 * Features:
 * - Complete tribunal case information
 * - AI-generated summary display
 * - Tabs: Overview, AI Insights
 * - Similar cases sidebar
 * - Remedies and key details
 * - Protected grounds and discrimination types
 * - Case statistics
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/shared/Navigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================================================
// TYPES
// ============================================================================

interface TribunalCase {
  id: string;
  title: string;
  case_number: string | null;
  decision_date: string | null;
  tribunal: string;
  decision_type: string | null;
  jurisdiction: string | null;
  summary: string | null;
  full_text: string | null;
  url: string | null;
  outcome: string | null;
  remedies: string[] | null;
  key_themes: string[] | null;
  parties_involved: string[] | null;
  legal_issues: string[] | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TribunalCaseDetails() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const supabase = createClient();

  const [tribunalCase, setTribunalCase] = useState<TribunalCase | null>(null);
  const [similarCases, setSimilarCases] = useState<TribunalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load case details
  useEffect(() => {
    const fetchCase = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('tribunal_cases')
          .select('*')
          .eq('id', caseId)
          .is('deleted_at', null)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Case not found');
          return;
        }

        setTribunalCase(data);

        // Fetch similar cases based on themes
        if (data.key_themes && data.key_themes.length > 0) {
          const { data: similar } = await supabase
            .from('tribunal_cases')
            .select('*')
            .neq('id', caseId)
            .is('deleted_at', null)
            .overlaps('key_themes', data.key_themes)
            .limit(3);

          setSimilarCases(similar || []);
        }
      } catch (err: any) {
        console.error('Error fetching case:', err);
        setError(err.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId, supabase]);

  // Helper: Get outcome color
  const getOutcomeColor = (outcome: string | null) => {
    if (!outcome) return 'bg-gray-100 text-gray-800';
    if (outcome.includes('Upheld')) return 'bg-green-100 text-green-800';
    if (outcome === 'Dismissed') return 'bg-red-100 text-red-800';
    if (outcome === 'Withdrawn') return 'bg-gray-100 text-gray-800';
    if (outcome === 'Settled') return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Helper: Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tribunalCase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested case could not be found.'}</p>
          <Link href="/cases/explore" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700">
            Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  // Render
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOutcomeColor(tribunalCase.outcome)}`}>
                  {tribunalCase.outcome || 'Unknown'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tribunalCase.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{tribunalCase.case_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{tribunalCase.tribunal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(tribunalCase.decision_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Key Details</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Case Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Case Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {tribunalCase.summary || 'No summary available for this case.'}
                  </p>
                </div>

                {/* Remedies */}
                {tribunalCase.remedies && tribunalCase.remedies.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Remedies Awarded</h3>
                    <div className="space-y-2">
                      {tribunalCase.remedies.map((remedy, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{remedy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Decision Link */}
                {tribunalCase.url && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Read Full Decision</h4>
                        <p className="text-sm text-gray-600">
                          Access the complete tribunal decision document
                        </p>
                      </div>
                      <a
                        href={tribunalCase.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                  {/* Key Themes */}
                  {tribunalCase.key_themes && tribunalCase.key_themes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Key Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {tribunalCase.key_themes.map(theme => (
                          <span key={theme} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal Issues */}
                  {tribunalCase.legal_issues && tribunalCase.legal_issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Legal Issues</h4>
                      <div className="flex flex-wrap gap-2">
                        {tribunalCase.legal_issues.map(issue => (
                          <span key={issue} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parties Involved */}
                  {tribunalCase.parties_involved && tribunalCase.parties_involved.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Parties Involved</h4>
                      <div className="space-y-2">
                        {tribunalCase.parties_involved.map((party, index) => (
                          <div key={index} className="text-gray-700">{party}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jurisdiction & Type */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">Jurisdiction</h4>
                      <p className="text-gray-900">{tribunalCase.jurisdiction || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">Decision Type</h4>
                      <p className="text-gray-900">{tribunalCase.decision_type || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Outcome</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOutcomeColor(tribunalCase.outcome)}`}>
                    {tribunalCase.outcome || 'Unknown'}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tribunal</div>
                  <div className="font-semibold text-gray-900">{tribunalCase.tribunal}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Decision Date</div>
                  <div className="text-gray-900">{formatDate(tribunalCase.decision_date)}</div>
                </div>
              </div>
            </div>

            {/* Similar Cases */}
            {similarCases.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Similar Cases</h3>
                </div>
                <div className="space-y-3">
                  {similarCases.map((similarCase) => (
                    <Link key={similarCase.id} href={`/tribunal-cases/${similarCase.id}`}>
                      <div className="p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all cursor-pointer">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                          {similarCase.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">
                            {similarCase.decision_date ? new Date(similarCase.decision_date).getFullYear() : 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">
                            {similarCase.tribunal}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Learning */}
            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Related Learning</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Deepen your understanding with related courses
              </p>
              <Link href="/courses" className="block">
                <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium">
                  Browse Courses
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
