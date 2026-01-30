/**
 * API Route: Get User Entitlements
 * Client-accessible endpoint for fetching user entitlements
 */

import { NextResponse } from 'next/server'
import { getUserEntitlements } from '@/lib/services/entitlements'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entitlements = await getUserEntitlements(user.id, supabase)

    if (!entitlements) {
      return NextResponse.json({ error: 'No entitlements found' }, { status: 404 })
    }

    return NextResponse.json({ entitlements })
  } catch (error) {
    console.error('Error fetching entitlements:', error)
    return NextResponse.json({ error: 'Failed to fetch entitlements' }, { status: 500 })
  }
}
