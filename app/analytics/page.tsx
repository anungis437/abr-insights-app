'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface AnalyticsStats {
  total_cases: number;
  avg_confidence: number;
  needs_review: number;
  abr_cases: number;
  ai_used_cases: number;
  rule_based_cases: number;
  classification_breakdown: Array<{ category: string; count: number }>;
  by_source_system: Array<{ source: string; count: number }>;
  confidence_distribution: Array<{ range: string; count: number }>;
  ai_vs_rule_based: { ai: number; rule_based: number };
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get all cases with their classification data
        const { data: cases, error: fetchError } = await supabase
          .from('cases')
          .select('*');

        if (fetchError) throw fetchError;

        if (!cases || cases.length === 0) {
          setStats({
            total_cases: 0,
            avg_confidence: 0,
            needs_review: 0,
            abr_cases: 0,
            ai_used_cases: 0,
            rule_based_cases: 0,
            classification_breakdown: [],
            by_source_system: [],
            confidence_distribution: [],
            ai_vs_rule_based: { ai: 0, rule_based: 0 }
          });
          setLoading(false);
          return;
        }

        // Calculate statistics
        const totalCases = cases.length;
        let abrCount = 0;
        let needsReviewCount = 0;
        let aiUsedCount = 0;
        let ruleBasedOnlyCount = 0;
        let totalConfidence = 0;
        let confidenceBuckets = { low: 0, medium: 0, high: 0 };
        const categoryCount: Record<string, number> = {};
        const sourceCount: Record<string, number> = {};

        cases.forEach((c) => {
          // Check if it's ABR
          const ruleCategory = c.rule_based_classification?.category;
          const aiCategory = c.ai_classification?.category;
          const isABR = ruleCategory === 'anti_black_racism' || aiCategory === 'anti_black_racism';
          if (isABR) abrCount++;

          // Check if needs review
          if (c.needs_review) needsReviewCount++;

          // Track AI usage
          if (c.ai_classification) {
            aiUsedCount++;
          } else {
            ruleBasedOnlyCount++;
          }

          // Get final category (AI overrides rule-based if present)
          const finalCategory = aiCategory || ruleCategory || 'unknown';
          categoryCount[finalCategory] = (categoryCount[finalCategory] || 0) + 1;

          // Source system
          const source = c.source_system || 'canlii_hrto';
          sourceCount[source] = (sourceCount[source] || 0) + 1;

          // Confidence score
          const confidence = c.combined_confidence || c.rule_based_classification?.confidence || 0;
          totalConfidence += confidence;

          // Confidence distribution
          if (confidence < 0.7) confidenceBuckets.low++;
          else if (confidence < 0.85) confidenceBuckets.medium++;
          else confidenceBuckets.high++;
        });

        const avgConfidence = totalCases > 0 ? (totalConfidence / totalCases) * 100 : 0;

        // Format breakdown arrays
        const classificationBreakdown = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        const bySourceSystem = Object.entries(sourceCount)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count);

        const confidenceDistribution = [
          { range: '< 70%', count: confidenceBuckets.low },
          { range: '70-85%', count: confidenceBuckets.medium },
          { range: '> 85%', count: confidenceBuckets.high }
        ];

        setStats({
          total_cases: totalCases,
          avg_confidence: avgConfidence,
          needs_review: needsReviewCount,
          abr_cases: abrCount,
          ai_used_cases: aiUsedCount,
          rule_based_cases: ruleBasedOnlyCount,
          classification_breakdown: classificationBreakdown,
          by_source_system: bySourceSystem,
          confidence_distribution: confidenceDistribution,
          ai_vs_rule_based: {
            ai: aiUsedCount,
            rule_based: ruleBasedOnlyCount
          }
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <Link href="/" className="text-blue-600 hover:underline">Return home</Link>
        </div>
      </div>
    );
  }

  const abrPercentage = stats.total_cases > 0 
    ? ((stats.abr_cases / stats.total_cases) * 100).toFixed(1) 
    : '0.0';

  const aiPercentage = stats.total_cases > 0 
    ? ((stats.ai_used_cases / stats.total_cases) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights from {stats.total_cases} tribunal cases</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Total Cases</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.total_cases}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Avg Confidence</h3>
            <p className="text-4xl font-bold text-green-600">{stats.avg_confidence.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Needs Review</h3>
            <p className="text-4xl font-bold text-orange-600">{stats.needs_review}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.needs_review / stats.total_cases) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-sm text-gray-600 mb-2 uppercase tracking-wide">ABR Cases</h3>
            <p className="text-4xl font-bold text-red-600">{stats.abr_cases}</p>
            <p className="text-xs text-gray-500 mt-1">{abrPercentage}% of total</p>
          </div>
        </div>

        {/* AI vs Rule-Based */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Classification Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">🤖 AI-Enhanced</span>
                <span className="text-gray-600">{stats.ai_used_cases} cases ({aiPercentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${aiPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Cases with low rule-based confidence that received AI analysis
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">📋 Rule-Based Only</span>
                <span className="text-gray-600">{stats.rule_based_cases} cases ({(100 - parseFloat(aiPercentage)).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${100 - parseFloat(aiPercentage)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                High-confidence rule-based classifications (cost-optimized)
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Confidence Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.confidence_distribution.map((bucket, idx) => {
              const colors = ['red', 'yellow', 'green'];
              const color = colors[idx];
              const percentage = ((bucket.count / stats.total_cases) * 100).toFixed(1);
              return (
                <div key={bucket.range} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{bucket.range}</span>
                    <span className={`text-${color}-600 font-bold`}>{bucket.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${color}-500 h-2 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage}% of cases</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Classification Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Classification Breakdown</h2>
            <div className="space-y-3">
              {stats.classification_breakdown.map((item) => {
                const percentage = ((item.count / stats.total_cases) * 100).toFixed(1);
                const isABR = item.category === 'anti_black_racism';
                return (
                  <div key={item.category} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium capitalize ${isABR ? 'text-red-600' : ''}`}>
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-600 font-semibold">{item.count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isABR ? 'bg-red-600' : 'bg-blue-600'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Source System */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">By Source System</h2>
            <div className="space-y-3">
              {stats.by_source_system.map((item) => {
                const percentage = ((item.count / stats.total_cases) * 100).toFixed(1);
                return (
                  <div key={item.source} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium uppercase text-sm tracking-wide">
                        {item.source}
                      </span>
                      <span className="text-gray-600 font-semibold">{item.count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link 
            href="/cases/browse" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse All Cases
          </Link>
          <Link 
            href="/cases" 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Search Cases
          </Link>
        </div>
      </div>
    </div>
  );
}