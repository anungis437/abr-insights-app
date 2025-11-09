import { NextResponse } from 'next/server';
import { evaluateModel } from '@/lib/services/outcome-prediction-service';

export async function GET() {
  try {
    // Call the outcome prediction service to evaluate model performance
    const performance = await evaluateModel();

    return NextResponse.json({
      success: true,
      performance,
    });
  } catch (error) {
    console.error('Error fetching model performance:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch model performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
