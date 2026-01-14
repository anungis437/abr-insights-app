import { NextResponse } from 'next/server';
import { requireAnyPermission } from '@/lib/auth/permissions';
// Import commented out to avoid build-time issues with Supabase client initialization
// import { evaluateModel } from '@/lib/services/outcome-prediction-service';

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage']);
  if (permissionError) return permissionError;

  try {
    // Lazy import to avoid build-time initialization issues
    const { evaluateModel } = await import('@/lib/services/outcome-prediction-service');
    
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
