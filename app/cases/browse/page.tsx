'use client';

/**
 * Cases Browser - Functional Case List
 * 
 * Features:
 * - Real data from database via API
 * - Table and card view toggle
 * - Pagination
 * - Filtering and sorting
 * - Case detail modal
 */

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

interface Case {
  id: string;
  case_title: string | null;
  case_number: string | null;
  citation: string | null;
  tribunal_name: string | null;
  decision_date: string | null;
  source_system: string;
  document_type: string;
  combined_confidence: number;
  rule_based_classification: {
    category: string;
    confidence: number;
  };
  ai_classification?: {
    category: string;
    confidence: number;
  } | null;
  full_text: string;
  needs_review: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CasesResponse {
  data: Case[];
  pagination: PaginationInfo;
  filters: Record<string, any>;
  sort: {
    field: string;
    order: string;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

function CasesBrowserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Get current query params
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const classification = searchParams.get('classification') || '';
  const source = searchParams.get('source_system') || '';
  const sort = searchParams.get('sort') || 'decision_date';
  const order = searchParams.get('order') || 'desc';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const docType = searchParams.get('document_type') || '';
  const minConfidence = searchParams.get('min_confidence') || '0';
  const needsReview = searchParams.get('needs_review') || '';
  const isIntersectional = searchParams.get('is_intersectional') || '';
  const language = searchParams.get('language') || '';
  
  // UI state for expanded filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch cases
  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('cases')
        .select('*', { count: 'exact' });

      // Apply filters
      if (classification) {
        query = query.or(`rule_based_classification->>category.eq.${classification},ai_classification->>category.eq.${classification}`);
      }
      if (source) {
        query = query.eq('source_system', source);
      }
      if (docType) {
        query = query.eq('document_type', docType);
      }
      if (dateFrom) {
        query = query.gte('decision_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('decision_date', dateTo);
      }
      if (minConfidence !== '0') {
        query = query.gte('combined_confidence', parseFloat(minConfidence));
      }
      if (needsReview) {
        query = query.eq('needs_review', needsReview === 'true');
      }

      // Apply sorting
      query = query.order(sort as any, { ascending: order === 'asc' });

      // Apply pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to);

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) throw supabaseError;

      setCases(data || []);
      setPagination({
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
        hasNextPage: (count || 0) > pageNum * limitNum,
        hasPreviousPage: pageNum > 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, classification, source, docType, dateFrom, dateTo, minConfidence, needsReview, sort, order]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Update URL params
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/cases/browse?${params.toString()}`);
  };

  // Get classification badge color
  const getClassificationColor = (caseItem: Case): string => {
    const category = caseItem.ai_classification?.category || caseItem.rule_based_classification.category;
    
    if (category === 'anti_black_racism') return 'bg-red-100 text-red-800';
    if (category === 'other_discrimination') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get classification label
  const getClassificationLabel = (caseItem: Case): string => {
    const category = caseItem.ai_classification?.category || caseItem.rule_based_classification.category;
    
    if (category === 'anti_black_racism') return 'Anti-Black Racism';
    if (category === 'other_discrimination') return 'Other Discrimination';
    return 'Non-Discrimination';
  };

  // Get confidence badge color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCases}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Browser</h1>
            <p className="text-gray-600 mt-1">
              {pagination ? `${pagination.total} cases found` : 'Loading...'}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Classification Filter */}
            <div>
              <label htmlFor="classification-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Classification
              </label>
              <select
                id="classification-filter"
                value={classification}
                onChange={(e) => updateParams({ classification: e.target.value, page: '1' })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                aria-label="Filter by classification"
              >
                <option value="">All</option>
                <option value="anti_black_racism">Anti-Black Racism</option>
                <option value="other_discrimination">Other Discrimination</option>
                <option value="non_discrimination">Non-Discrimination</option>
              </select>
            </div>

            {/* Source System Filter */}
            <div>
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                id="source-filter"
                value={source}
                onChange={(e) => updateParams({ source_system: e.target.value, page: '1' })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                aria-label="Filter by source system"
              >
                <option value="">All Sources</option>
                <option value="canlii_hrto">HRTO</option>
                <option value="canlii_chrt">CHRT</option>
                <option value="canlii_bchrt">BCHRT</option>
              </select>
            </div>

            {/* Sort Field */}
            <div>
              <label htmlFor="sort-field" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-field"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                aria-label="Sort cases by field"
              >
                <option value="decision_date">Decision Date</option>
                <option value="confidence">Confidence</option>
                <option value="created_at">Recently Added</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                id="sort-order"
                value={order}
                onChange={(e) => updateParams({ order: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                aria-label="Sort order"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            aria-label="Toggle advanced filters"
          >
            {showAdvancedFilters ? '▲ Hide' : '▼ Show'} Advanced Filters
          </button>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                    Date From
                  </label>
                  <input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => updateParams({ date_from: e.target.value, page: '1' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                    Date To
                  </label>
                  <input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => updateParams({ date_to: e.target.value, page: '1' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    id="doc-type"
                    value={docType}
                    onChange={(e) => updateParams({ document_type: e.target.value, page: '1' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">All Types</option>
                    <option value="decision">Decision</option>
                    <option value="order">Order</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="min-conf" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Confidence: {minConfidence}%
                  </label>
                  <input
                    id="min-conf"
                    type="range"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => updateParams({ min_confidence: e.target.value, page: '1' })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="lang" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    id="lang"
                    value={language}
                    onChange={(e) => updateParams({ language: e.target.value, page: '1' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">All</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="space-y-2 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={needsReview === 'true'}
                      onChange={(e) => updateParams({ needs_review: e.target.checked ? 'true' : '', page: '1' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Needs Review</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isIntersectional === 'true'}
                      onChange={(e) => updateParams({ is_intersectional: e.target.checked ? 'true' : '', page: '1' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Intersectional</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(classification || source || dateFrom || dateTo || docType || minConfidence !== '0' || needsReview || isIntersectional || language) && (
            <button
              onClick={() => updateParams({ 
                classification: '', 
                source_system: '', 
                date_from: '', 
                date_to: '', 
                document_type: '', 
                min_confidence: '0', 
                needs_review: '', 
                is_intersectional: '',
                language: '',
                page: '1' 
              })}
              className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading cases...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && cases.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No cases found matching your criteria.</p>
            <button
              onClick={() => updateParams({ classification: '', source_system: '', page: '1' })}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Cases Display */}
        {!loading && cases.length > 0 && (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tribunal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {caseItem.case_title || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {caseItem.case_number || caseItem.citation || 'No citation'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {caseItem.tribunal_name || caseItem.source_system}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {caseItem.decision_date
                            ? new Date(caseItem.decision_date).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(
                              caseItem
                            )}`}
                          >
                            {getClassificationLabel(caseItem)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                              caseItem.combined_confidence
                            )}`}
                          >
                            {(caseItem.combined_confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedCase(caseItem)}
                            className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                          >
                            View
                          </button>
                          <Link
                            href={`/cases/${caseItem.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card View */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {truncate(caseItem.case_title || 'Untitled', 50)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getConfidenceColor(
                            caseItem.combined_confidence
                          )}`}
                        >
                          {(caseItem.combined_confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tribunal:</span>{' '}
                          {caseItem.tribunal_name || caseItem.source_system}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{' '}
                          {caseItem.decision_date
                            ? new Date(caseItem.decision_date).toLocaleDateString()
                            : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Citation:</span>{' '}
                          {caseItem.citation || caseItem.case_number || 'N/A'}
                        </p>
                      </div>

                      {/* Classification Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(
                            caseItem
                          )}`}
                        >
                          {getClassificationLabel(caseItem)}
                        </span>
                      </div>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-700 mb-4">
                        {truncate(caseItem.full_text, 150)}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCase(caseItem)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        >
                          Quick View
                        </button>
                        <Link
                          href={`/cases/${caseItem.id}`}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center text-sm font-medium"
                        >
                          Full Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateParams({ page: String(pagination.page - 1) })}
                    disabled={!pagination.hasPreviousPage}
                    className={`px-4 py-2 rounded font-medium ${
                      pagination.hasPreviousPage
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-gray-700 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => updateParams({ page: String(pagination.page + 1) })}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded font-medium ${
                      pagination.hasNextPage
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick View Modal */}
        {selectedCase && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCase.case_title || 'Untitled Case'}
                  </h2>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close case details"
                    title="Close case details"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Case Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Case Number</p>
                    <p className="font-medium">{selectedCase.case_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Citation</p>
                    <p className="font-medium">{selectedCase.citation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tribunal</p>
                    <p className="font-medium">
                      {selectedCase.tribunal_name || selectedCase.source_system}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Decision Date</p>
                    <p className="font-medium">
                      {selectedCase.decision_date
                        ? new Date(selectedCase.decision_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Classification */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Classification</p>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(
                        selectedCase
                      )}`}
                    >
                      {getClassificationLabel(selectedCase)}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                        selectedCase.combined_confidence
                      )}`}
                    >
                      Confidence: {(selectedCase.combined_confidence * 100).toFixed(1)}%
                    </span>
                    {selectedCase.needs_review && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Needs Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Full Text Excerpt */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Case Text (Excerpt)</p>
                  <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {truncate(selectedCase.full_text, 2000)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/cases/${selectedCase.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center font-medium"
                  >
                    View Full Details
                  </Link>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// Loading fallback component
function CasesBrowserLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Browser</h1>
            <p className="text-gray-600 mt-1">Loading cases...</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function CasesBrowserPage() {
  return (
    <Suspense fallback={<CasesBrowserLoading />}>
      <CasesBrowserContent />
    </Suspense>
  );
}
