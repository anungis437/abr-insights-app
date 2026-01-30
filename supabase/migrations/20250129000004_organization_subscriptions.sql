-- Organization Subscriptions & Seat Management
-- Phase 5.1: Implement org-level subscription model per MONETIZATION.md

-- ============================================================================
-- Organization Subscriptions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Subscription details
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  tier text NOT NULL CHECK (tier IN ('FREE', 'PROFESSIONAL', 'BUSINESS', 'BUSINESS_PLUS', 'ENTERPRISE')),
  status text NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid')),
  
  -- Seat licensing
  seat_count integer NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  seats_used integer NOT NULL DEFAULT 0 CHECK (seats_used >= 0),
  
  -- Billing details
  billing_email text,
  billing_address jsonb, -- {line1, line2, city, state, postal_code, country}
  tax_ids jsonb, -- [{type, value}] for VAT/GST/etc
  
  -- Pricing
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'CAD',
  billing_interval text CHECK (billing_interval IN ('month', 'year')),
  
  -- Grace period for overages
  grace_period_ends_at timestamptz,
  
  -- Dates
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT seats_usage_valid CHECK (seats_used <= seat_count OR grace_period_ends_at IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_org_subscriptions_organization ON organization_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_stripe_sub ON organization_subscriptions(stripe_subscription_id);
CREATE INDEX idx_org_subscriptions_stripe_customer ON organization_subscriptions(stripe_customer_id);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_org_subscriptions_grace_period ON organization_subscriptions(grace_period_ends_at) WHERE grace_period_ends_at IS NOT NULL;

-- Updated timestamp trigger
CREATE TRIGGER update_organization_subscriptions_updated_at
  BEFORE UPDATE ON organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seat Allocations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS seat_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES organization_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Allocation metadata
  allocated_by uuid REFERENCES auth.users(id),
  role_in_org text, -- 'admin', 'member', 'viewer', etc.
  
  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'suspended')),
  
  -- Dates
  allocated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- One seat per user per subscription
  UNIQUE(subscription_id, user_id)
);

-- Indexes
CREATE INDEX idx_seat_allocations_subscription ON seat_allocations(subscription_id);
CREATE INDEX idx_seat_allocations_user ON seat_allocations(user_id);
CREATE INDEX idx_seat_allocations_status ON seat_allocations(status);

-- Updated timestamp trigger
CREATE TRIGGER update_seat_allocations_updated_at
  BEFORE UPDATE ON seat_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Invoice Records Table (for audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES organization_subscriptions(id) ON DELETE CASCADE,
  
  -- Stripe details
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_charge_id text,
  
  -- Invoice data
  amount_due integer NOT NULL,
  amount_paid integer NOT NULL,
  currency text NOT NULL,
  tax_amount integer DEFAULT 0,
  tax_breakdown jsonb, -- [{type, rate, amount}]
  
  -- Status
  status text NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  
  -- Dates
  invoice_date timestamptz NOT NULL,
  due_date timestamptz,
  paid_at timestamptz,
  
  -- PDF
  invoice_pdf_url text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscription_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_invoices_stripe_invoice ON subscription_invoices(stripe_invoice_id);
CREATE INDEX idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX idx_subscription_invoices_date ON subscription_invoices(invoice_date DESC);

-- Updated timestamp trigger
CREATE TRIGGER update_subscription_invoices_updated_at
  BEFORE UPDATE ON subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Organization Subscriptions
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_admins_view_subscription"
  ON organization_subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY ".*_full_access_org_subscriptions"
  ON organization_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = '.*')
  WITH CHECK (auth.jwt() ->> 'role' = '.*');

-- Seat Allocations
ALTER TABLE seat_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_allocation"
  ON seat_allocations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "org_admins_manage_allocations"
  ON seat_allocations
  FOR ALL
  USING (
    subscription_id IN (
      SELECT id FROM organization_subscriptions
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() 
          AND role IN ('owner', 'admin')
      )
    )
  )
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM organization_subscriptions
      WHERE organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() 
          AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY ".*_full_access_seat_allocations"
  ON seat_allocations
  FOR ALL
  USING (auth.jwt() ->> 'role' = '.*')
  WITH CHECK (auth.jwt() ->> 'role' = '.*');

-- Subscription Invoices
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_view_invoices"
  ON subscription_invoices
  FOR SELECT
  USING (
    subscription_id IN (
      SELECT os.id FROM organization_subscriptions os
      INNER JOIN organization_members om ON om.organization_id = os.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY ".*_full_access_invoices"
  ON subscription_invoices
  FOR ALL
  USING (auth.jwt() ->> 'role' = '.*')
  WITH CHECK (auth.jwt() ->> 'role' = '.*');

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check if org can add users (seat enforcement)
CREATE OR REPLACE FUNCTION can_add_users(org_id uuid, count integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  available_seats integer;
BEGIN
  -- Get active subscription for org
  SELECT * INTO sub_record
  FROM organization_subscriptions
  WHERE organization_id = org_id
    AND status IN ('active', 'trialing')
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- No subscription = allow (free tier)
  IF sub_record IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if in grace period
  IF sub_record.grace_period_ends_at IS NOT NULL 
     AND sub_record.grace_period_ends_at > now() THEN
    RETURN true;
  END IF;
  
  -- Calculate available seats
  available_seats := sub_record.seat_count - sub_record.seats_used;
  
  RETURN available_seats >= count;
END;
$$;

-- Function to get org subscription info
CREATE OR REPLACE FUNCTION get_org_subscription(org_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  tier text,
  status text,
  seat_count integer,
  seats_used integer,
  seats_available integer,
  in_grace_period boolean,
  grace_period_ends_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.id,
    os.tier,
    os.status,
    os.seat_count,
    os.seats_used,
    (os.seat_count - os.seats_used) as seats_available,
    (os.grace_period_ends_at IS NOT NULL AND os.grace_period_ends_at > now()) as in_grace_period,
    os.grace_period_ends_at
  FROM organization_subscriptions os
  WHERE os.organization_id = org_id
    AND os.status IN ('active', 'trialing', 'past_due')
  ORDER BY os.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to update seats_used count (called by triggers)
CREATE OR REPLACE FUNCTION update_subscription_seats_used()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_seats integer;
BEGIN
  -- Count active seat allocations for this subscription
  SELECT COUNT(*) INTO active_seats
  FROM seat_allocations
  WHERE subscription_id = COALESCE(NEW.subscription_id, OLD.subscription_id)
    AND status = 'active';
  
  -- Update subscription
  UPDATE organization_subscriptions
  SET seats_used = active_seats,
      updated_at = now()
  WHERE id = COALESCE(NEW.subscription_id, OLD.subscription_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to auto-update seats_used
CREATE TRIGGER seat_allocation_update_seats_used
  AFTER INSERT OR UPDATE OR DELETE ON seat_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_seats_used();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE organization_subscriptions IS 'Organization-level Stripe subscriptions with seat licensing';
COMMENT ON TABLE seat_allocations IS 'Per-user seat allocations within org subscriptions';
COMMENT ON TABLE subscription_invoices IS 'Audit trail of Stripe invoices with tax breakdown';
COMMENT ON FUNCTION can_add_users IS 'Check if org has available seats before adding users';
COMMENT ON FUNCTION get_org_subscription IS 'Get current subscription info for an organization';
