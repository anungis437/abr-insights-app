import { NextRequest, NextResponse } from 'next/server';
import { verifyCodespringApiKey } from '@/lib/services/codespring';

/**
 * GET /api/codespring/verify
 * Verify Codespring API key is valid and working
 */
export async function GET(request: NextRequest) {
  try {
    const result = await verifyCodespringApiKey();

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: result.error || 'API key verification failed',
          message: 'Please check your CODESPRING_API_KEY environment variable'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Codespring API key is valid and working',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Codespring API key verification error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}
