'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RawCase {
  id: string;
  source_url: string;
  source_system: string;
  case_title: string;
  case_number: string;
  decision_date: string;
  full_text: string;
  rule_based_classification: any;
  ai_classification: any;
  combined_confidence: number;
  discrimination_grounds: string[];
  needs_review: boolean;
  promotion_status: string;
  created_at: string;
}

export default function IngestionReviewPage() {
  const [cases, setCases] = useState<RawCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCase, setSelectedCase] = useState<RawCase | null>(null);

  const supabase = createClient();

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tribunal_cases_raw')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'pending') {
        query = query.eq('promotion_status', 'pending');
      } else if (filter === 'approved') {
        query = query.eq('promotion_status', 'approved');
      } else if (filter === 'rejected') {
        query = query.eq('promotion_status', 'rejected');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading cases:', error);
        return;
      }

      setCases(data || []);
    } finally {
      setLoading(false);
    }
  }, [filter, supabase]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  async function approveCase(caseId: string) {
    try {
      // Get the raw case data
      const { data: rawCase, error: fetchError } = await supabase
        .from('tribunal_cases_raw')
        .select('*')
        .eq('id', caseId)
        .single();

      if (fetchError || !rawCase) {
        console.error('Error fetching case:', fetchError);
        return;
      }

      // Insert into production tribunal_cases table
      const { error: insertError } = await supabase
        .from('tribunal_cases')
        .insert({
          case_number: rawCase.case_number,
          case_title: rawCase.case_title,
          tribunal_name: rawCase.tribunal_name,
          province: rawCase.province,
          filing_date: rawCase.filing_date,
          decision_date: rawCase.decision_date,
          summary: rawCase.summary,
          full_text: rawCase.full_text,
          decision: rawCase.decision,
          applicant: rawCase.applicant,
          respondent: rawCase.respondent,
          primary_category: rawCase.primary_category,
          subcategories: rawCase.subcategories,
          key_issues: rawCase.key_issues,
          remedies: rawCase.remedies,
          outcomes: rawCase.outcomes,
          citation: rawCase.citation,
          language: rawCase.language,
          tags: rawCase.tags,
          related_cases: rawCase.related_cases,
          document_url: rawCase.document_url,
        });

      if (insertError) {
        console.error('Error inserting case into production:', insertError);
        return;
      }

      // Mark as approved in raw table
      const { error: updateError } = await supabase
        .from('tribunal_cases_raw')
        .update({ promotion_status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', caseId);

      if (updateError) {
        console.error('Error approving case:', updateError);
        return;
      }

      await loadCases();
      setSelectedCase(null);
    } catch (err) {
      console.error('Error in approveCase:', err);
    }
  }

  async function rejectCase(caseId: string) {
    const { error } = await supabase
      .from('tribunal_cases_raw')
      .update({ promotion_status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', caseId);

    if (error) {
      console.error('Error rejecting case:', error);
      return;
    }

    await loadCases();
    setSelectedCase(null);
  }

  function getConfidenceBadge(confidence: number) {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-600">High ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-600">Medium ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else {
      return <Badge className="bg-red-600">Low ({(confidence * 100).toFixed(0)}%)</Badge>;
    }
  }

  function getCategoryBadge(category: string) {
    switch (category) {
      case 'anti_black_racism':
        return <Badge className="bg-purple-600">Anti-Black Racism</Badge>;
      case 'other_discrimination':
        return <Badge className="bg-blue-600">Other Discrimination</Badge>;
      case 'non_discrimination':
        return <Badge className="bg-gray-600">Non-Discrimination</Badge>;
      default:
        return <Badge className="bg-gray-400">Unknown</Badge>;
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ingestion Review Dashboard</h1>
        <p className="text-muted-foreground">
          Review and approve tribunal cases ingested from external sources
        </p>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Cases</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading cases...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case List */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {cases.length} case{cases.length !== 1 ? 's' : ''} found
            </div>
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCase?.id === caseItem.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="mb-2">
                  <h3 className="font-semibold line-clamp-2">{caseItem.case_title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {caseItem.case_number} • {new Date(caseItem.decision_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getCategoryBadge(caseItem.ai_classification?.category || 'unknown')}
                  {getConfidenceBadge(caseItem.combined_confidence || 0)}
                  {caseItem.needs_review && <Badge variant="destructive">Needs Review</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {caseItem.discrimination_grounds?.join(', ') || 'No grounds detected'}
                </div>
              </div>
            ))}
          </div>

          {/* Case Details */}
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
            {selectedCase ? (
              <div className="border rounded-lg p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">{selectedCase.case_title}</h2>
                  <div className="text-sm text-muted-foreground mb-4">
                    <div>Case Number: {selectedCase.case_number}</div>
                    <div>Decision Date: {new Date(selectedCase.decision_date).toLocaleDateString()}</div>
                    <div>Source: {selectedCase.source_system}</div>
                    <div>
                      URL:{' '}
                      <a
                        href={selectedCase.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Original
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getCategoryBadge(selectedCase.ai_classification?.category || 'unknown')}
                    {getConfidenceBadge(selectedCase.combined_confidence || 0)}
                    {selectedCase.needs_review && <Badge variant="destructive">Needs Review</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="font-semibold">Rule-Based</div>
                      <div>{((selectedCase.rule_based_classification?.confidence || 0) * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="font-semibold">AI Confidence</div>
                      <div>{((selectedCase.ai_classification?.confidence || 0) * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-1">Detected Grounds</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.discrimination_grounds?.map((ground: string) => (
                        <Badge key={ground} variant="outline">
                          {ground.replace(/_/g, ' ')}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">None detected</span>}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="font-semibold mb-2">Decision Text</div>
                  <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded">
                    {selectedCase.full_text.substring(0, 2000)}
                    {selectedCase.full_text.length > 2000 && '...'}
                  </div>
                </div>

                {selectedCase.promotion_status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => approveCase(selectedCase.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectCase(selectedCase.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-6 h-full flex items-center justify-center text-muted-foreground">
                Select a case to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
