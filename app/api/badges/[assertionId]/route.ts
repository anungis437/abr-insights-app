import { NextRequest, NextResponse } from 'next/server'
import { getBadgeByAssertion } from '@/lib/services/certificates'

/**
 * GET /api/badges/[assertionId]
 * 
 * Returns Open Badges 2.0 compliant badge assertion JSON-LD
 * This endpoint is public and used for badge verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assertionId: string }> }
) {
  try {
    const { assertionId } = await params

    // Get badge by assertion ID
    const badge = await getBadgeByAssertion(assertionId)

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }

    // Check if badge is revoked
    if (badge.status === 'revoked') {
      return NextResponse.json(
        { 
          error: 'Badge has been revoked',
          revoked: true,
          revokedAt: badge.revoked_at,
          reason: badge.revocation_reason
        },
        { status: 410 } // Gone
      )
    }

    // Check if badge is expired
    if (badge.status === 'expired') {
      return NextResponse.json(
        { 
          error: 'Badge has expired',
          expired: true,
          expiresOn: badge.expires_on
        },
        { status: 410 } // Gone
      )
    }

    // Return badge assertion JSON-LD
    // This is compliant with Open Badges 2.0 specification
    return NextResponse.json(badge.badge_assertion_json, {
      headers: {
        'Content-Type': 'application/ld+json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests for badge verification
      }
    })
  } catch (error) {
    console.error('Error fetching badge assertion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/badges/[assertionId]
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
