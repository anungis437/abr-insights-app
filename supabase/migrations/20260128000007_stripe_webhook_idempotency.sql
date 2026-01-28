-- Create Stripe webhook events table for idempotency
-- Prevents duplicate processing of webhook events on retries

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY, -- Stripe event ID (e.g., evt_1234...)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at 
  ON stripe_webhook_events(created_at DESC);

-- Comment
COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events to prevent duplicate processing';
