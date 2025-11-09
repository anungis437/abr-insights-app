-- Migration: 20250116000002_advanced_rbac.sql
-- Description: Advanced Role-Based Access Control with resource-level permissions
-- Features: Granular permissions, permission inheritance, user overrides
-- Created: 2025-01-16

-- ============================================================================
-- RESOURCE PERMISSIONS TABLE
-- ============================================================================
-- Granular permissions at resource level (e.g., "can edit Course X", "can view Case Y")

CREATE TABLE IF NOT EXISTS resource_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Resource Identification
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'course', 'lesson', 'case', 'quiz'
    resource_id UUID NOT NULL, -- ID of the specific resource
    
    -- Permission Details
    action VARCHAR(50) NOT NULL, -- e.g., 'view', 'edit', 'delete', 'publish', 'manage'
    permission_level VARCHAR(50) NOT NULL DEFAULT 'explicit' CHECK (permission_level IN ('explicit', 'inherited', 'public')),
    
    -- Scope (who has this permission)
    scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('user', 'role', 'organization', 'public')),
    scope_id UUID, -- user_id, role_id, or organization_id (NULL if public)
    
    -- Constraints and Conditions
    conditions JSONB DEFAULT '{}', -- e.g., {"time_restriction": {"start": "09:00", "end": "17:00"}}
    expires_at TIMESTAMPTZ, -- Temporary permission
    
    -- Audit
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure no duplicate active permissions (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_permissions_active_unique 
    ON resource_permissions(resource_type, resource_id, action, scope_type, scope_id) 
    WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_resource_permissions_resource ON resource_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_scope ON resource_permissions(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_action ON resource_permissions(action);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_expires_at ON resource_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resource_permissions_granted_by ON resource_permissions(granted_by);

COMMENT ON TABLE resource_permissions IS 'Granular resource-level permissions for fine-grained access control';
COMMENT ON COLUMN resource_permissions.conditions IS 'JSON conditions for permission evaluation (time restrictions, IP ranges, etc.)';

-- ============================================================================
-- PERMISSION OVERRIDES TABLE
-- ============================================================================
-- User-specific permission exceptions (override role permissions)

CREATE TABLE IF NOT EXISTS permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Permission Reference
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE, -- Global permission
    resource_type VARCHAR(100), -- Optional: override for specific resource type
    resource_id UUID, -- Optional: override for specific resource
    action VARCHAR(50), -- Optional: override specific action
    
    -- Override Type
    override_type VARCHAR(50) NOT NULL CHECK (override_type IN ('grant', 'deny', 'elevate')),
    -- grant: give permission user wouldn't normally have
    -- deny: remove permission user would normally have
    -- elevate: increase permission level
    
    -- Justification and Approval
    reason TEXT NOT NULL, -- Why this override was created
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    
    -- Lifecycle
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ, -- Temporary override
    
    -- Review (for compliance)
    requires_review BOOLEAN DEFAULT FALSE,
    last_reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    next_review_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'under_review')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_overrides_user_id ON permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_organization_id ON permission_overrides(organization_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_permission_id ON permission_overrides(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_resource ON permission_overrides(resource_type, resource_id) WHERE resource_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permission_overrides_status ON permission_overrides(status);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_effective_until ON permission_overrides(effective_until) WHERE effective_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permission_overrides_next_review_date ON permission_overrides(next_review_date) WHERE next_review_date IS NOT NULL;

COMMENT ON TABLE permission_overrides IS 'User-specific permission exceptions with approval workflow and compliance review';

-- ============================================================================
-- ROLE HIERARCHY TABLE
-- ============================================================================
-- Define role inheritance chains (e.g., Admin inherits from Manager)

CREATE TABLE IF NOT EXISTS role_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Roles
    parent_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- Role that inherits
    child_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- Role being inherited from
    
    -- Inheritance Rules
    inherit_permissions BOOLEAN DEFAULT TRUE, -- Inherit all permissions
    inherit_restrictions BOOLEAN DEFAULT FALSE, -- Also inherit restrictions (if any)
    
    -- Depth tracking (for performance optimization)
    depth INTEGER NOT NULL DEFAULT 1 CHECK (depth >= 1), -- 1 = direct parent, 2+ = ancestor
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(parent_role_id, child_role_id),
    -- Prevent circular dependencies
    CHECK (parent_role_id != child_role_id)
);

CREATE INDEX IF NOT EXISTS idx_role_hierarchy_parent ON role_hierarchy(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_child ON role_hierarchy(child_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_depth ON role_hierarchy(depth);

COMMENT ON TABLE role_hierarchy IS 'Role inheritance for hierarchical RBAC (e.g., Admin inherits Manager permissions)';

-- ============================================================================
-- PERMISSION CACHE TABLE
-- ============================================================================
-- Cache computed permissions for performance (refreshed on permission changes)

CREATE TABLE IF NOT EXISTS permission_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Context
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Resource Context (optional - can cache global permissions)
    resource_type VARCHAR(100),
    resource_id UUID,
    
    -- Cached Permissions
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of permission slugs
    effective_permissions JSONB NOT NULL DEFAULT '{}', -- Computed permissions with inheritance
    
    -- Cache Metadata
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    cache_version INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on permission cache (using functional index to handle NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_permission_cache_unique 
    ON permission_cache(user_id, organization_id, COALESCE(resource_type, ''), COALESCE(resource_id::TEXT, ''));

CREATE INDEX IF NOT EXISTS idx_permission_cache_user_org ON permission_cache(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_resource ON permission_cache(resource_type, resource_id) WHERE resource_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires_at ON permission_cache(expires_at);

COMMENT ON TABLE permission_cache IS 'Performance cache for computed user permissions with expiration';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_cache ENABLE ROW LEVEL SECURITY;

-- Resource Permissions: Admins can manage, users can view their own
CREATE POLICY "Admins can manage resource permissions"
    ON resource_permissions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view resource permissions that apply to them"
    ON resource_permissions
    FOR SELECT
    USING (
        scope_type = 'public'
        OR (scope_type = 'user' AND scope_id = auth.uid())
        OR (scope_type = 'role' AND scope_id IN (
            SELECT role_id FROM user_roles WHERE user_id = auth.uid()
        ))
        OR (scope_type = 'organization' AND scope_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        ))
    );

-- Permission Overrides: Admins can manage, users can view their own
CREATE POLICY "Admins can manage permission overrides"
    ON permission_overrides
    FOR ALL
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view their own permission overrides"
    ON permission_overrides
    FOR SELECT
    USING (user_id = auth.uid());

-- Role Hierarchy: Everyone can read (needed for permission computation)
CREATE POLICY "Anyone can view role hierarchy"
    ON role_hierarchy
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage role hierarchy"
    ON role_hierarchy
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

-- Permission Cache: Users can only read their own cache
CREATE POLICY "Users can read their own permission cache"
    ON permission_cache
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage permission cache"
    ON permission_cache
    FOR ALL
    USING (true); -- Managed by service layer with service role

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_resource_permissions_updated_at ON resource_permissions;
CREATE TRIGGER update_resource_permissions_updated_at BEFORE UPDATE ON resource_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permission_overrides_updated_at ON permission_overrides;
CREATE TRIGGER update_permission_overrides_updated_at BEFORE UPDATE ON permission_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permission_cache_updated_at ON permission_cache;
CREATE TRIGGER update_permission_cache_updated_at BEFORE UPDATE ON permission_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invalidate permission cache when permissions change
CREATE OR REPLACE FUNCTION invalidate_permission_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete affected cache entries
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        DELETE FROM permission_cache
        WHERE user_id = COALESCE(NEW.user_id, NEW.scope_id)
        OR user_id IN (
            SELECT ur.user_id FROM user_roles ur
            WHERE ur.role_id = NEW.scope_id AND NEW.scope_type = 'role'
        );
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM permission_cache
        WHERE user_id = COALESCE(OLD.user_id, OLD.scope_id)
        OR user_id IN (
            SELECT ur.user_id FROM user_roles ur
            WHERE ur.role_id = OLD.scope_id AND OLD.scope_type = 'role'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invalidate_cache_on_permission_change ON resource_permissions;
CREATE TRIGGER invalidate_cache_on_permission_change
    AFTER INSERT OR UPDATE OR DELETE ON resource_permissions
    FOR EACH ROW EXECUTE FUNCTION invalidate_permission_cache();

DROP TRIGGER IF EXISTS invalidate_cache_on_override_change ON permission_overrides;
CREATE TRIGGER invalidate_cache_on_override_change
    AFTER INSERT OR UPDATE OR DELETE ON permission_overrides
    FOR EACH ROW EXECUTE FUNCTION invalidate_permission_cache();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user has permission (with inheritance and overrides)
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_resource_type VARCHAR(100),
    p_resource_id UUID,
    p_action VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN := FALSE;
    v_override permission_overrides%ROWTYPE;
BEGIN
    -- 1. Check for explicit DENY overrides (highest priority)
    SELECT * INTO v_override
    FROM permission_overrides
    WHERE user_id = p_user_id
    AND (resource_type IS NULL OR resource_type = p_resource_type)
    AND (resource_id IS NULL OR resource_id = p_resource_id)
    AND (action IS NULL OR action = p_action)
    AND override_type = 'deny'
    AND status = 'active'
    AND effective_from <= NOW()
    AND (effective_until IS NULL OR effective_until > NOW())
    LIMIT 1;
    
    IF FOUND THEN
        RETURN FALSE; -- Explicit deny
    END IF;
    
    -- 2. Check for explicit GRANT overrides
    SELECT * INTO v_override
    FROM permission_overrides
    WHERE user_id = p_user_id
    AND (resource_type IS NULL OR resource_type = p_resource_type)
    AND (resource_id IS NULL OR resource_id = p_resource_id)
    AND (action IS NULL OR action = p_action)
    AND override_type = 'grant'
    AND status = 'active'
    AND effective_from <= NOW()
    AND (effective_until IS NULL OR effective_until > NOW())
    LIMIT 1;
    
    IF FOUND THEN
        RETURN TRUE; -- Explicit grant
    END IF;
    
    -- 3. Check resource-level permissions
    SELECT TRUE INTO v_has_permission
    FROM resource_permissions rp
    WHERE rp.resource_type = p_resource_type
    AND rp.resource_id = p_resource_id
    AND rp.action = p_action
    AND rp.revoked_at IS NULL
    AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
    AND (
        -- Public access
        (rp.scope_type = 'public')
        -- User-specific
        OR (rp.scope_type = 'user' AND rp.scope_id = p_user_id)
        -- Role-based (including inherited roles)
        OR (rp.scope_type = 'role' AND rp.scope_id IN (
            SELECT ur.role_id FROM user_roles ur WHERE ur.user_id = p_user_id
            UNION
            SELECT rh.child_role_id FROM role_hierarchy rh
            JOIN user_roles ur ON ur.role_id = rh.parent_role_id
            WHERE ur.user_id = p_user_id AND rh.inherit_permissions = TRUE
        ))
        -- Organization-wide
        OR (rp.scope_type = 'organization' AND rp.scope_id IN (
            SELECT organization_id FROM profiles WHERE id = p_user_id
        ))
    )
    LIMIT 1;
    
    IF FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- 4. Check role-based permissions (fallback to global permissions)
    SELECT TRUE INTO v_has_permission
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = p_user_id
    AND p.resource = p_resource_type
    AND p.action = p_action
    LIMIT 1;
    
    RETURN COALESCE(v_has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_user_permission IS 'Checks if user has permission with inheritance, overrides, and resource-level rules';

-- Get all effective permissions for user (with caching)
CREATE OR REPLACE FUNCTION get_user_effective_permissions(
    p_user_id UUID,
    p_organization_id UUID,
    p_resource_type VARCHAR(100) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cached permission_cache%ROWTYPE;
    v_permissions JSONB;
BEGIN
    -- Try cache first
    SELECT * INTO v_cached
    FROM permission_cache
    WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND COALESCE(resource_type, '') = COALESCE(p_resource_type, '')
    AND COALESCE(resource_id::TEXT, '') = COALESCE(p_resource_id::TEXT, '')
    AND expires_at > NOW();
    
    IF FOUND THEN
        RETURN v_cached.effective_permissions;
    END IF;
    
    -- Compute permissions
    WITH user_role_permissions AS (
        -- Direct role permissions
        SELECT DISTINCT p.slug, p.resource, p.action
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = p_user_id
        
        UNION
        
        -- Inherited role permissions
        SELECT DISTINCT p.slug, p.resource, p.action
        FROM user_roles ur
        JOIN role_hierarchy rh ON rh.parent_role_id = ur.role_id
        JOIN role_permissions rp ON rp.role_id = rh.child_role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = p_user_id
        AND rh.inherit_permissions = TRUE
    ),
    resource_level_permissions AS (
        -- Resource-specific permissions
        SELECT DISTINCT 
            rp.action,
            rp.resource_type AS resource,
            rp.resource_id::TEXT AS resource_id_str
        FROM resource_permissions rp
        WHERE (p_resource_type IS NULL OR rp.resource_type = p_resource_type)
        AND (p_resource_id IS NULL OR rp.resource_id = p_resource_id)
        AND rp.revoked_at IS NULL
        AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
        AND (
            (rp.scope_type = 'user' AND rp.scope_id = p_user_id)
            OR (rp.scope_type = 'role' AND rp.scope_id IN (SELECT role_id FROM user_roles WHERE user_id = p_user_id))
            OR (rp.scope_type = 'organization' AND rp.scope_id = p_organization_id)
            OR (rp.scope_type = 'public')
        )
    ),
    permission_overrides_applied AS (
        -- Apply overrides
        SELECT 
            COALESCE(po.action, 'all') AS action,
            COALESCE(po.resource_type, 'all') AS resource,
            po.override_type
        FROM permission_overrides po
        WHERE po.user_id = p_user_id
        AND po.status = 'active'
        AND po.effective_from <= NOW()
        AND (po.effective_until IS NULL OR po.effective_until > NOW())
    )
    SELECT jsonb_object_agg(
        resource,
        actions
    ) INTO v_permissions
    FROM (
        SELECT 
            resource,
            jsonb_agg(DISTINCT action) AS actions
        FROM (
            SELECT slug AS action, resource FROM user_role_permissions
            UNION
            SELECT action, resource FROM resource_level_permissions
            EXCEPT
            SELECT action, resource FROM permission_overrides_applied WHERE override_type = 'deny'
        ) all_permissions
        GROUP BY resource
    ) grouped_permissions;
    
    -- Cache the result
    INSERT INTO permission_cache (
        user_id,
        organization_id,
        resource_type,
        resource_id,
        effective_permissions,
        expires_at
    ) VALUES (
        p_user_id,
        p_organization_id,
        p_resource_type,
        p_resource_id,
        COALESCE(v_permissions, '{}'::jsonb),
        NOW() + INTERVAL '1 hour'
    )
    ON CONFLICT (user_id, organization_id, COALESCE(resource_type, ''), COALESCE(resource_id::TEXT, ''))
    DO UPDATE SET
        effective_permissions = EXCLUDED.effective_permissions,
        computed_at = NOW(),
        expires_at = NOW() + INTERVAL '1 hour',
        cache_version = permission_cache.cache_version + 1;
    
    RETURN COALESCE(v_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_effective_permissions IS 'Computes all effective permissions for user with caching (1-hour TTL)';

-- Clean up expired permission cache entries (scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_permission_cache()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM permission_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get roles with inheritance (flattened hierarchy)
CREATE OR REPLACE FUNCTION get_user_roles_with_inheritance(p_user_id UUID)
RETURNS TABLE (
    role_id UUID,
    role_slug VARCHAR(100),
    role_level INTEGER,
    is_inherited BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    -- Direct roles
    SELECT 
        r.id,
        r.slug,
        r.level,
        FALSE AS is_inherited
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    
    UNION
    
    -- Inherited roles
    SELECT 
        r.id,
        r.slug,
        r.level,
        TRUE AS is_inherited
    FROM user_roles ur
    JOIN role_hierarchy rh ON rh.parent_role_id = ur.role_id
    JOIN roles r ON r.id = rh.child_role_id
    WHERE ur.user_id = p_user_id
    AND rh.inherit_permissions = TRUE
    
    ORDER BY is_inherited ASC, role_level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_roles_with_inheritance IS 'Returns all roles for user including inherited roles from hierarchy';
