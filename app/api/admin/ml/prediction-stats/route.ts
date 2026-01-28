import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAnyPermission } from '@/lib/auth/permissions';

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage']);
  if (permissionError) return permissionError;

  try {
    const supabase = await createClient();

    // Get prediction statistics
    const { data: stats, error: statsError } = await supabase
      .from('predictions')
      .select('prediction_type, confidence, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (statsError) throw statsError;

    // Get prediction accuracy metrics
    const { data: accuracy, error: accuracyError } = await supabase.rpc('get_prediction_accuracy');

    if (accuracyError) throw accuracyError;

    // Process statistics
    const predictionsByType: Record<string, number> = {};
    const predictionsByDay: Record<string, number> = {};
    let totalPredictions = 0;
    let totalConfidence = 0;

    stats?.forEach((prediction: any) => {
      totalPredictions++;
      totalConfidence += prediction.confidence || 0;

      // Count by type
      const type = prediction.prediction_type || 'unknown';
      predictionsByType[type] = (predictionsByType[type] || 0) + 1;

      // Count by day
      const day = new Date(prediction.created_at).toISOString().split('T')[0];
      predictionsByDay[day] = (predictionsByDay[day] || 0) + 1;
    });

    const averageConfidence = totalPredictions > 0
      ? (totalConfidence / totalPredictions) * 100
      : 0;

    return NextResponse.json({
      totalPredictions,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      predictionsByType,
      predictionsByDay,
      accuracy: accuracy || {},
      period: 'last_30_days',
    });
  } catch (error) {
    console.error('Error fetching prediction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction statistics' },
      { status: 500 }
    );
  }
}
