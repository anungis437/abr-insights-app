'use server'

import { enforceSeats } from '@/lib/services/seat-management'

/**
 * Server action to check if organization has available seats
 * @param organizationId - Organization ID to check
 * @param requestedSeats - Number of seats requested (default 1)
 */
export async function checkSeatAvailability(
  organizationId: string,
  requestedSeats: number = 1
) {
  try {
    const result = await enforceSeats(organizationId, requestedSeats)
    
    if (result.allowed) {
      return {
        success: true,
        allowed: true,
        reason: undefined,
        currentSeats: undefined,
        maxSeats: undefined,
      }
    }
    
    return {
      success: true,
      allowed: false,
      reason: result.reason,
      currentSeats: result.subscription.seats_used,
      maxSeats: result.subscription.seat_count,
    }
  } catch (error: any) {
    return {
      success: false,
      allowed: false,
      reason: error.message || 'Failed to check seat availability',
      currentSeats: 0,
      maxSeats: 0,
    }
  }
}
