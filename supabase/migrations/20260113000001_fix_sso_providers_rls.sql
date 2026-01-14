-- Migration: Fix SSO Providers RLS for admin access
-- Created: 2026-01-13
-- Description: Adds additional RLS policies to allow super admins and service role access

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role has full access to sso_providers" ON sso_providers;
DROP POLICY IF EXISTS "Super admins can manage all SSO providers" ON sso_providers;

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access to sso_providers"
    ON sso_providers
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Allow super admins to manage all SSO providers across organizations
CREATE POLICY "Super admins can manage all SSO providers"
    ON sso_providers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

-- Comment for documentation
COMMENT ON TABLE sso_providers IS 'SSO provider configurations - accessible by org admins, super admins, and service role';
