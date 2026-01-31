-- Atomic Seat Allocation RPC
-- Prevents race conditions when adding members to organizations
-- Ensures seat limits are enforced at the database level with row-level locking

-- Function: Atomically add member to organization with seat enforcement
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
  v_current_members INTEGER;
  v_result jsonb;
BEGIN
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
  v_result jsonb;
BEGIN
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_member_with_seat_check(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_member_with_seat_release(UUID, UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION add_member_with_seat_check IS 
  'Atomically adds a member to an organization with seat limit enforcement. Uses row-level locking to prevent race conditions.';

COMMENT ON FUNCTION remove_member_with_seat_release IS 
  'Atomically removes a member from an organization and releases their seat. Uses row-level locking for consistency.';
