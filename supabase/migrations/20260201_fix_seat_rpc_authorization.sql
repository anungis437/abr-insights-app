-- Migration: Fix privilege escalation in seat allocation RPCs
-- Issue: SECURITY DEFINER functions were missing authorization checks
-- Fix: Add permission validation using auth.has_permission()
-- Date: 2026-02-01

-- Function: Atomically add member to organization with seat enforcement
-- NOW WITH AUTHORIZATION CHECKS
CREATE OR REPLACE FUNCTION add_member_with_seat_check(
  p_user_id UUID,
  p_organization_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_caller_id UUID;
  v_caller_org_id UUID;
  v_result jsonb;
BEGIN
  -- CRITICAL SECURITY CHECK: Validate caller authentication
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Get caller's organization
  SELECT organization_id INTO v_caller_org_id
  FROM profiles
  WHERE id = v_caller_id;

  -- CRITICAL SECURITY CHECK: Validate caller has permission to invite users
  IF NOT auth.has_permission(v_caller_id, p_organization_id, 'users.invite') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied: users.invite required'
    );
  END IF;

  -- CRITICAL SECURITY CHECK: Validate caller belongs to target organization
  IF v_caller_org_id != p_organization_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied: caller not in target organization'
    );
  END IF;

  -- Lock the organization subscription row for update (prevents concurrent modifications)
  SELECT 
    id,
    tier,
    status,
    seat_count,
    seats_used
  INTO v_subscription
  FROM organization_subscriptions
  WHERE organization_id = p_organization_id
  FOR UPDATE; -- Critical: locks this row until transaction commits

  -- If no subscription exists, allow (free tier = unlimited)
  IF v_subscription.id IS NULL THEN
    -- Update profile
    UPDATE profiles
    SET organization_id = p_organization_id
    WHERE id = p_user_id
      AND organization_id IS NULL; -- Ensure user not already in an org

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'User not found or already in an organization'
      );
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'tier', 'FREE',
      'seats_used', NULL,
      'seat_count', NULL
    );
  END IF;

  -- Check if subscription is active
  IF v_subscription.status NOT IN ('active', 'trialing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organization subscription is not active',
      'subscription_status', v_subscription.status
    );
  END IF;

  -- Check seat availability (critical check under lock)
  IF v_subscription.seats_used >= v_subscription.seat_count THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seat limit reached. Please upgrade your plan.',
      'seats_used', v_subscription.seats_used,
      'seat_count', v_subscription.seat_count
    );
  END IF;

  -- Add member to organization (atomic update)
  UPDATE profiles
  SET organization_id = p_organization_id
  WHERE id = p_user_id
    AND organization_id IS NULL; -- Ensure user not already in an org

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found or already in an organization'
    );
  END IF;

  -- Increment seats_used (atomic update under lock)
  UPDATE organization_subscriptions
  SET seats_used = seats_used + 1
  WHERE id = v_subscription.id;

  -- Create seat allocation record
  INSERT INTO seat_allocations (subscription_id, user_id, status)
  VALUES (v_subscription.id, p_user_id, 'active')
  ON CONFLICT (subscription_id, user_id) DO UPDATE
  SET status = 'active';

  -- Return success with updated counts
  RETURN jsonb_build_object(
    'success', true,
    'tier', v_subscription.tier,
    'seats_used', v_subscription.seats_used + 1,
    'seat_count', v_subscription.seat_count
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Function: Atomically remove member from organization
-- NOW WITH AUTHORIZATION CHECKS
CREATE OR REPLACE FUNCTION remove_member_with_seat_release(
  p_user_id UUID,
  p_organization_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_caller_id UUID;
  v_caller_org_id UUID;
  v_result jsonb;
BEGIN
  -- CRITICAL SECURITY CHECK: Validate caller authentication
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Get caller's organization
  SELECT organization_id INTO v_caller_org_id
  FROM profiles
  WHERE id = v_caller_id;

  -- CRITICAL SECURITY CHECK: Validate caller has permission to remove users
  IF NOT auth.has_permission(v_caller_id, p_organization_id, 'users.remove') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied: users.remove required'
    );
  END IF;

  -- CRITICAL SECURITY CHECK: Validate caller belongs to target organization
  IF v_caller_org_id != p_organization_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied: caller not in target organization'
    );
  END IF;

  -- OPTIONAL: Prevent self-removal (uncomment if desired)
  -- IF v_caller_id = p_user_id THEN
  --   RETURN jsonb_build_object(
  --     'success', false,
  --     'error', 'Cannot remove yourself from the organization'
  --   );
  -- END IF;

  -- Lock the organization subscription row for update
  SELECT 
    id,
    tier,
    seats_used
  INTO v_subscription
  FROM organization_subscriptions
  WHERE organization_id = p_organization_id
  FOR UPDATE; -- Lock to prevent concurrent modifications

  -- Remove member from organization
  UPDATE profiles
  SET organization_id = NULL
  WHERE id = p_user_id
    AND organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in this organization'
    );
  END IF;

  -- If subscription exists, decrement seats_used
  IF v_subscription.id IS NOT NULL THEN
    -- Decrement seats_used (ensure it doesn't go below 0)
    UPDATE organization_subscriptions
    SET seats_used = GREATEST(seats_used - 1, 0)
    WHERE id = v_subscription.id;

    -- Mark seat allocation as revoked
    UPDATE seat_allocations
    SET status = 'revoked'
    WHERE subscription_id = v_subscription.id
      AND user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'seats_used', GREATEST(v_subscription.seats_used - 1, 0)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Grants remain the same (authenticated can call, but functions enforce permissions internally)
GRANT EXECUTE ON FUNCTION add_member_with_seat_check(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_member_with_seat_release(UUID, UUID) TO authenticated;

-- Update comments to reflect security model
COMMENT ON FUNCTION add_member_with_seat_check IS 
  'Atomically adds a member to an organization with seat limit enforcement. Uses row-level locking to prevent race conditions. REQUIRES users.invite permission and caller must be in target org.';

COMMENT ON FUNCTION remove_member_with_seat_release IS 
  'Atomically removes a member from an organization and releases their seat. Uses row-level locking for consistency. REQUIRES users.remove permission and caller must be in target org.';
