import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAnyPermission } from '@/lib/auth/permissions';

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage']);
  if (permissionError) return permissionError;

  try {
    const supabase = await createClient();

    // Get total predictions count
    const { count: totalCount, error: totalError } = await supabase
      .from('outcome_predictions')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw totalError;
    }

    // Get validated predictions count (those with actual outcomes)
    const { count: validatedCount, error: validatedError } = await supabase
      .from('outcome_predictions')
      .select('*', { count: 'exact', head: true })
      .not('actual_outcome', 'is', null);

    if (validatedError) {
      throw validatedError;
    }

    // Calculate accuracy from validated predictions
    // Get predictions where predicted_outcome matches actual_outcome
    const { data: accuratePredictions, error: accuracyError } = await supabase
      .from('outcome_predictions')
      .select('id, predicted_outcome, actual_outcome')
      .not('actual_outcome', 'is', null);

    if (accuracyError) {
      throw accuracyError;
    }

    const accurateCount = accuratePredictions?.filter(
      (p) => p.predicted_outcome === p.actual_outcome
    ).length || 0;

    const accuracy =
      validatedCount && validatedCount > 0
        ? (accurateCount / validatedCount) * 100
        : 0;

    // Get average confidence score
    const { data: avgData, error: avgError } = await supabase
      .from('outcome_predictions')
      .select('confidence_score');

    if (avgError) {
      throw avgError;
    }

    const avgConfidence =
      avgData && avgData.length > 0
        ? avgData.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / avgData.length
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalPredictions: totalCount || 0,
        validatedPredictions: validatedCount || 0,
        accuracy: Number(accuracy.toFixed(2)),
        averageConfidence: Number((avgConfidence * 100).toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching prediction stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prediction statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
