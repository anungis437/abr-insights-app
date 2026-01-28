-- Migration: Add subscription fields to profiles table
-- Date: 2026-01-28
-- Description: Add Stripe subscription tracking to individual user profiles

-- Add subscription fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Add index for stripe_customer_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add index for subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Add comments
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier (free, professional, enterprise)';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN profiles.subscription_current_period_end IS 'When the current subscription period ends';
