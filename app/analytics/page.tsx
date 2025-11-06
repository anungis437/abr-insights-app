'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total count
        const { count: totalCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true });

        // Get ABR count
        const { count: abrCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .or('rule_based_classification->>category.eq.anti_black_racism,ai_classification->>category.eq.anti_black_racism');

        // Get cases needing review
        const { count: needsReviewCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('needs_review', true);

        setStats({
          totalCases: totalCount || 0,
          antiBlackRacismCases: abrCount || 0,
          needsReview: needsReviewCount || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="container mx-auto p-8">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights from tribunal cases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Cases</h3>
            <p className="text-3xl font-bold">{stats.total_cases}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Avg Confidence</h3>
            <p className="text-3xl font-bold">{stats.avg_confidence.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Needs Review</h3>
            <p className="text-3xl font-bold">{stats.needs_review}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">ABR Cases</h3>
            <p className="text-3xl font-bold text-red-600">{stats.abr_cases}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Classification Breakdown</h2>
          <div className="space-y-3">
            {stats.classification_breakdown.map((item: any) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="font-medium">{item.category.replace(/_/g, ' ')}</span>
                <span className="text-gray-600">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">By Source System</h2>
          <div className="space-y-3">
            {stats.by_source_system.map((item: any) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="font-medium">{item.source}</span>
                <span className="text-gray-600">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/cases/browse" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Browse Cases
          </Link>
        </div>
      </div>
    </div>
  );
}