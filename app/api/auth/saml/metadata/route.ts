/**
 * SAML Service Provider Metadata Endpoint
 *
 * Provides SP metadata XML for IdP configuration
 *
 * This endpoint returns SAML metadata that describes:
 * - Entity ID (SP identifier)
 * - Assertion Consumer Service (ACS) URL
 * - Single Logout Service (SLS) URL
 * - Name ID formats supported
 * - Security requirements
 *
 * IdP administrators use this metadata to configure trust
 * relationship with our application.
 *
 * @route /api/auth/saml/metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationSlug = searchParams.get('org')

    if (!organizationSlug) {
      return NextResponse.json(
        { error: 'Organization slug is required. Use ?org=your-org-slug' },
        { status: 400 }
      )
    }

    // Get SAML service for organization
    const samlService = await getSAMLService(organizationSlug)

    // Generate metadata XML
    const metadata = await samlService.generateMetadata()

    // Return XML response
    return new NextResponse(metadata, {
      headers: {
        'Content-Type': 'application/samlmetadata+xml',
        'Content-Disposition': `attachment; filename="${organizationSlug}-saml-metadata.xml"`,
      },
    })
  } catch (error) {
    console.error('[SAML Metadata] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate SAML metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
