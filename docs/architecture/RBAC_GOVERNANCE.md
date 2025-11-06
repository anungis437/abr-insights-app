# Advanced RBAC & Governance Framework

**Status**: 🟡 In Design
**Priority**: P0 (Security Critical)
**Compliance**: PIPEDA, SOC 2, ISO 27001, WCAG 2.1 AA

## Executive Summary

This document outlines the **Advanced Role-Based Access Control (RBAC)** system for the ABR Insights platform, designed to meet the highest Canadian governance, transparency, and security standards required for government, enterprise, and public sector clients.

Our RBAC implementation goes beyond basic role assignment to include:

- **Granular Permissions** - Fine-grained control at resource and action levels
- **Multi-Tenancy Isolation** - Complete data segregation between organizations
- **Audit Logging** - Comprehensive tracking of all access and changes
- **Dynamic Permissions** - Context-aware access based on data classification
- **Delegation & Temporary Access** - Time-bound permission grants
- **Compliance Reporting** - Automated governance reports for auditors
- **Zero Trust Architecture** - Never trust, always verify

---

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Permission Model](#permission-model)
3. [Row-Level Security (RLS)](#row-level-security-rls)
4. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
5. [Audit Logging](#audit-logging)
6. [Data Classification](#data-classification)
7. [Delegation Framework](#delegation-framework)
8. [Compliance & Governance](#compliance--governance)
9. [Security Controls](#security-controls)
10. [Implementation Guide](#implementation-guide)

---

## Role Hierarchy

### Organizational Roles

```text
┌─────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                             │
│  • Platform-wide access                                      │
│  • Manage all organizations                                  │
│  • Configure system settings                                 │
│  • Access all audit logs                                     │
└──────────────────────────┬───────────────────────────────────┘
                           │
           ┌───────────────┴────────────────┐
           │                                │
┌──────────▼──────────┐         ┌──────────▼──────────┐
│   ORG ADMIN         │         │   COMPLIANCE OFFICER │
│  • Manage org users │         │  • View audit logs   │
│  • Configure org    │         │  • Export reports    │
│  • View org reports │         │  • Review violations │
└──────────┬──────────┘         └─────────────────────┘
           │
     ┌─────┴──────┬──────────────┬──────────────┐
     │            │              │              │
┌────▼────┐  ┌───▼────┐  ┌─────▼──────┐  ┌───▼─────┐
│ ANALYST │  │INVESTI-│  │  EDUCATOR  │  │ LEARNER │
│         │  │ GATOR  │  │            │  │         │
│ • Query │  │• View  │  │• Create    │  │• Take   │
│   data  │  │  cases │  │  courses   │  │  courses│
│ • Create│  │• Export│  │• Assign    │  │• View   │
│  reports│  │  data  │  │  training  │  │  reports│
└─────────┘  └────────┘  └────────────┘  └─────────┘
                                                │
                                          ┌─────▼─────┐
                                          │  VIEWER   │
                                          │ • Read-   │
                                          │   only    │
                                          └───────────┘
```

### Role Definitions

| Role | Level | Description | Use Case |
|------|-------|-------------|----------|
| **super_admin** | Platform | Full system access, manage all organizations | ABR Insights staff only |
| **compliance_officer** | Platform/Org | Access audit logs, compliance reports | Governance teams |
| **org_admin** | Organization | Manage organization settings and users | HR Directors, DEI Leads |
| **analyst** | Organization | Advanced data analysis and reporting | Data analysts, researchers |
| **investigator** | Organization | View case data, conduct investigations | HR investigators, legal teams |
| **educator** | Organization | Create and manage training content | L&D professionals |
| **learner** | Organization | Complete training, view own progress | All employees |
| **viewer** | Organization | Read-only access to published content | Contractors, auditors |
| **guest** | Limited | Time-bound access to specific resources | External consultants |

---

## Permission Model

### Permission Structure

Permissions follow the **Resource.Action** pattern:

```text
Format: {resource}.{action}
Example: tribunal_cases.view, courses.create, users.delete
```

### Permission Categories

#### 1. Data Access Permissions

```typescript
const DATA_PERMISSIONS = {
  // Tribunal Cases
  'tribunal_cases.view_all': ['super_admin', 'org_admin', 'analyst', 'investigator'],
  'tribunal_cases.view_filtered': ['learner', 'educator', 'viewer'],
  'tribunal_cases.export': ['super_admin', 'org_admin', 'analyst', 'investigator'],
  'tribunal_cases.create': ['super_admin'],
  'tribunal_cases.update': ['super_admin', 'org_admin'],
  'tribunal_cases.delete': ['super_admin'],
  
  // Raw Ingestion Data
  'tribunal_cases_raw.view': ['super_admin', 'org_admin', 'compliance_officer'],
  'tribunal_cases_raw.classify': ['super_admin', 'org_admin'],
  'tribunal_cases_raw.promote': ['super_admin', 'org_admin'],
  
  // User Data
  'users.view_org': ['org_admin', 'educator', 'compliance_officer'],
  'users.view_all': ['super_admin'],
  'users.create': ['super_admin', 'org_admin'],
  'users.update': ['super_admin', 'org_admin'],
  'users.delete': ['super_admin', 'org_admin'],
  'users.impersonate': ['super_admin'], // For support purposes only
};
```

#### 2. Training & Learning Permissions

```typescript
const TRAINING_PERMISSIONS = {
  'courses.view_published': ['*'], // All authenticated users
  'courses.view_draft': ['super_admin', 'org_admin', 'educator'],
  'courses.create': ['super_admin', 'org_admin', 'educator'],
  'courses.update': ['super_admin', 'org_admin', 'educator'],
  'courses.publish': ['super_admin', 'org_admin'],
  'courses.delete': ['super_admin', 'org_admin'],
  
  'progress.view_own': ['*'],
  'progress.view_org': ['org_admin', 'educator', 'compliance_officer'],
  'progress.update_own': ['*'],
  'progress.update_others': ['org_admin', 'educator'],
  
  'certificates.generate': ['*'], // Upon course completion
  'certificates.revoke': ['super_admin', 'org_admin'],
};
```

#### 3. Organization Management Permissions

```typescript
const ORG_PERMISSIONS = {
  'organization.view': ['org_admin', 'compliance_officer'],
  'organization.update': ['super_admin', 'org_admin'],
  'organization.delete': ['super_admin'],
  'organization.view_analytics': ['org_admin', 'analyst', 'compliance_officer'],
  'organization.export_data': ['org_admin', 'compliance_officer'],
  
  'settings.view': ['org_admin'],
  'settings.update': ['super_admin', 'org_admin'],
  'settings.integrations': ['super_admin', 'org_admin'],
};
```

#### 4. System Administration Permissions

```typescript
const ADMIN_PERMISSIONS = {
  'system.view_config': ['super_admin'],
  'system.update_config': ['super_admin'],
  
  'audit_logs.view_own_org': ['org_admin', 'compliance_officer'],
  'audit_logs.view_all': ['super_admin', 'compliance_officer'],
  'audit_logs.export': ['super_admin', 'org_admin', 'compliance_officer'],
  
  'ingestion.view_jobs': ['super_admin', 'org_admin'],
  'ingestion.trigger_manual': ['super_admin'],
  'ingestion.configure_sources': ['super_admin'],
  
  'reports.generate': ['org_admin', 'analyst', 'compliance_officer'],
  'reports.schedule': ['org_admin'],
  'reports.share_external': ['org_admin', 'compliance_officer'],
};
```

### Permission Database Schema

```sql
-- Permissions table (defines all available permissions)
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL, -- 'tribunal_cases', 'users', 'courses'
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
  full_permission TEXT GENERATED ALWAYS AS (resource || '.' || action) STORED,
  description TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_mfa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Role permissions mapping (which roles have which permissions)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  UNIQUE(role, permission_id)
);

-- User-specific permission overrides (grant/revoke specific permissions)
CREATE TABLE public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  override_type TEXT CHECK (override_type IN ('grant', 'revoke')),
  reason TEXT NOT NULL, -- Why was this override applied?
  expires_at TIMESTAMPTZ, -- Time-bound access
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- Permission groups (for easier management)
CREATE TABLE public.permission_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]', -- Array of permission IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_user_overrides_user ON user_permission_overrides(user_id);
CREATE INDEX idx_user_overrides_expires ON user_permission_overrides(expires_at);
```

### Permission Check Function

```typescript
// src/lib/permissions.ts
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  role: string;
  organization_id: string;
  mfa_enabled: boolean;
}

interface PermissionContext {
  resourceId?: string;
  organizationId?: string;
  requireMfa?: boolean;
}

export async function hasPermission(
  user: User,
  permission: string,
  context?: PermissionContext
): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Check if permission requires MFA
  const { data: permData } = await supabase
    .from('permissions')
    .select('requires_mfa, risk_level')
    .eq('full_permission', permission)
    .single();

  if (permData?.requires_mfa && !user.mfa_enabled) {
    console.warn(`Permission ${permission} requires MFA but user doesn't have it enabled`);
    return false;
  }

  // 2. Check for user-specific revocations first (highest priority)
  const { data: revocations } = await supabase
    .from('user_permission_overrides')
    .select('*')
    .eq('user_id', user.id)
    .eq('override_type', 'revoke')
    .eq('permission_id', permData.id);

  if (revocations && revocations.length > 0) {
    return false; // Explicit revocation
  }

  // 3. Check for user-specific grants (overrides role permissions)
  const { data: grants } = await supabase
    .from('user_permission_overrides')
    .select('*, expires_at')
    .eq('user_id', user.id)
    .eq('override_type', 'grant')
    .eq('permission_id', permData.id);

  if (grants && grants.length > 0) {
    const grant = grants[0];
    if (!grant.expires_at || new Date(grant.expires_at) > new Date()) {
      return true; // Valid grant
    }
  }

  // 4. Check role-based permissions
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role', user.role)
    .eq('permission_id', permData.id);

  if (rolePerms && rolePerms.length > 0) {
    // Additional context checks
    if (context?.organizationId && context.organizationId !== user.organization_id) {
      return false; // Cross-org access denied
    }
    return true;
  }

  return false;
}

// Bulk permission check for UI rendering
export async function getUserPermissions(user: User): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data } = await supabase
    .from('role_permissions')
    .select('permissions(full_permission)')
    .eq('role', user.role);

  // Merge with user-specific grants
  const { data: grants } = await supabase
    .from('user_permission_overrides')
    .select('permissions(full_permission)')
    .eq('user_id', user.id)
    .eq('override_type', 'grant')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  // Remove revocations
  const { data: revocations } = await supabase
    .from('user_permission_overrides')
    .select('permissions(full_permission)')
    .eq('user_id', user.id)
    .eq('override_type', 'revoke');

  const allPerms = [
    ...data.map(d => d.permissions.full_permission),
    ...grants.map(g => g.permissions.full_permission)
  ];

  const revokedPerms = new Set(revocations.map(r => r.permissions.full_permission));
  
  return allPerms.filter(p => !revokedPerms.has(p));
}
```

---

## Row-Level Security (RLS)

### Multi-Tenant Data Isolation

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own + admins view org
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = profiles.organization_id
      AND p.role IN ('org_admin', 'super_admin', 'compliance_officer')
    )
  );

-- Organizations: Members can view, admins can update
CREATE POLICY "orgs_select_policy" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "orgs_update_policy" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND organization_id = organizations.id
      AND role IN ('org_admin', 'super_admin')
    )
  );

-- Tribunal Cases: Authenticated users can view
CREATE POLICY "cases_select_policy" ON tribunal_cases
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Progress: Users view own, admins/educators view org
CREATE POLICY "progress_select_policy" ON progress
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.organization_id = p2.organization_id
      WHERE p1.id = auth.uid()
      AND p2.id = progress.user_id
      AND p1.role IN ('org_admin', 'educator', 'compliance_officer')
    )
  );

CREATE POLICY "progress_update_policy" ON progress
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p1.organization_id = p2.organization_id
      WHERE p1.id = auth.uid()
      AND p2.id = progress.user_id
      AND p1.role IN ('org_admin', 'educator')
    )
  );
```

### Dynamic RLS with Data Classification

```sql
-- Data classification table
CREATE TABLE public.data_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL, -- 'tribunal_case', 'user_profile', 'course'
  resource_id UUID NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  classified_by UUID REFERENCES profiles(id),
  classified_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(resource_type, resource_id)
);

-- RLS policy respecting data classification
CREATE POLICY "classified_data_policy" ON tribunal_cases
  FOR SELECT USING (
    -- Public: Everyone
    NOT EXISTS (SELECT 1 FROM data_classifications WHERE resource_id = tribunal_cases.id) OR
    EXISTS (
      SELECT 1 FROM data_classifications dc
      WHERE dc.resource_id = tribunal_cases.id
      AND dc.classification = 'public'
    ) OR
    -- Internal: Authenticated users in same org
    EXISTS (
      SELECT 1 FROM data_classifications dc
      JOIN profiles p ON p.id = auth.uid()
      WHERE dc.resource_id = tribunal_cases.id
      AND dc.classification = 'internal'
      AND auth.role() = 'authenticated'
    ) OR
    -- Confidential: Admins and investigators only
    EXISTS (
      SELECT 1 FROM data_classifications dc
      JOIN profiles p ON p.id = auth.uid()
      WHERE dc.resource_id = tribunal_cases.id
      AND dc.classification = 'confidential'
      AND p.role IN ('super_admin', 'org_admin', 'investigator', 'compliance_officer')
    ) OR
    -- Restricted: Super admins only
    EXISTS (
      SELECT 1 FROM data_classifications dc
      JOIN profiles p ON p.id = auth.uid()
      WHERE dc.resource_id = tribunal_cases.id
      AND dc.classification = 'restricted'
      AND p.role = 'super_admin'
    )
  );
```

---

## Multi-Tenancy Architecture

### Organization Isolation

```sql
-- Organization scoping function
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE;

-- Use in RLS policies
CREATE POLICY "org_scoped_data" ON courses
  FOR ALL USING (
    organization_id = get_user_org_id() OR
    is_shared_across_orgs = true OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

### Cross-Organization Data Sharing

```sql
-- Shared resources table
CREATE TABLE public.shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  owner_org_id UUID REFERENCES organizations(id),
  shared_with_org_ids UUID[], -- Array of org IDs
  shared_publicly BOOLEAN DEFAULT false,
  shared_by UUID REFERENCES profiles(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(resource_type, resource_id, owner_org_id)
);

-- RLS for shared resources
CREATE POLICY "shared_resources_policy" ON courses
  FOR SELECT USING (
    organization_id = get_user_org_id() OR
    EXISTS (
      SELECT 1 FROM shared_resources sr
      WHERE sr.resource_type = 'course'
      AND sr.resource_id = courses.id
      AND (
        get_user_org_id() = ANY(sr.shared_with_org_ids) OR
        sr.shared_publicly = true
      )
      AND (sr.expires_at IS NULL OR sr.expires_at > NOW())
    )
  );
```

---

## Audit Logging

### Comprehensive Audit Trail

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  user_role TEXT,
  impersonated_by UUID REFERENCES profiles(id), -- If action was via impersonation
  
  -- What
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', 'login', 'logout'
  resource_type TEXT NOT NULL, -- 'tribunal_case', 'user', 'course', 'organization'
  resource_id UUID,
  
  -- When
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Where
  ip_address INET,
  user_agent TEXT,
  geo_location JSONB, -- {country, region, city}
  
  -- Why/How
  reason TEXT, -- User-provided reason for sensitive actions
  changes JSONB, -- Before/after values for updates
  query_params JSONB, -- For data exports/queries
  
  -- Context
  organization_id UUID REFERENCES organizations(id),
  session_id TEXT,
  request_id TEXT,
  
  -- Classification
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  compliance_relevant BOOLEAN DEFAULT false,
  
  -- Retention
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 years' -- PIPEDA requirement
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_compliance ON audit_logs(compliance_relevant) WHERE compliance_relevant = true;

-- Immutable audit logs (prevent tampering)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Anyone can log

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role IN ('super_admin', 'compliance_officer') OR
        (role = 'org_admin' AND organization_id = audit_logs.organization_id)
      )
    )
  );

-- No UPDATE or DELETE policies = immutable logs
```

### Audit Logging Function

```typescript
// src/lib/audit.ts
import { createClient } from '@supabase/supabase-js';

interface AuditLogEntry {
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'permission_change';
  resourceType: string;
  resourceId?: string;
  reason?: string;
  changes?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
  complianceRelevant?: boolean;
}

export async function logAudit(
  entry: AuditLogEntry,
  user: User,
  request: Request
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Extract IP and user agent
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  // Determine if action is compliance-relevant
  const complianceActions = ['export', 'delete', 'permission_change'];
  const isComplianceRelevant = entry.complianceRelevant || complianceActions.includes(entry.action);

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    reason: entry.reason,
    changes: entry.changes,
    ip_address: ipAddress,
    user_agent: userAgent,
    organization_id: user.organization_id,
    session_id: user.session_id,
    severity: entry.severity || 'info',
    compliance_relevant: isComplianceRelevant
  });

  // Alert on critical actions
  if (entry.severity === 'critical') {
    await sendSecurityAlert({
      user: user.email,
      action: entry.action,
      resource: entry.resourceType,
      timestamp: new Date()
    });
  }
}

// Usage example
await logAudit({
  action: 'export',
  resourceType: 'tribunal_cases',
  reason: 'Quarterly compliance report',
  severity: 'info',
  complianceRelevant: true
}, user, request);
```

---

## Data Classification

### Classification Levels

| Level | Description | Who Can Access | Examples |
|-------|-------------|----------------|----------|
| **Public** | Publicly available information | Everyone | Published courses, public tribunal decisions |
| **Internal** | Organization-internal data | All org members | Employee training progress, org analytics |
| **Confidential** | Sensitive business data | Admins, investigators | Investigation notes, disciplinary records |
| **Restricted** | Highly sensitive data | Super admins only | System configurations, encryption keys |

### Auto-Classification Rules

```sql
-- Classification triggers
CREATE OR REPLACE FUNCTION auto_classify_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-classify tribunal cases as public by default
  IF TG_TABLE_NAME = 'tribunal_cases' THEN
    INSERT INTO data_classifications (resource_type, resource_id, classification, classified_by)
    VALUES ('tribunal_case', NEW.id, 'public', auth.uid())
    ON CONFLICT (resource_type, resource_id) DO NOTHING;
  END IF;

  -- Auto-classify user profiles as confidential
  IF TG_TABLE_NAME = 'profiles' THEN
    INSERT INTO data_classifications (resource_type, resource_id, classification, classified_by)
    VALUES ('user_profile', NEW.id, 'confidential', auth.uid())
    ON CONFLICT (resource_type, resource_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER classify_new_tribunal_cases
  AFTER INSERT ON tribunal_cases
  FOR EACH ROW EXECUTE FUNCTION auto_classify_data();

CREATE TRIGGER classify_new_profiles
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION auto_classify_data();
```

---

## Delegation Framework

### Temporary Access Grants

```sql
CREATE TABLE public.access_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id UUID REFERENCES profiles(id) NOT NULL, -- Who is granting access
  delegate_id UUID REFERENCES profiles(id) NOT NULL, -- Who is receiving access
  
  permission_ids UUID[], -- Array of permission IDs
  resource_type TEXT,
  resource_ids UUID[], -- Specific resources, or NULL for all
  
  reason TEXT NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT max_delegation_period CHECK (end_date <= start_date + INTERVAL '90 days')
);

CREATE INDEX idx_delegations_delegate ON access_delegations(delegate_id);
CREATE INDEX idx_delegations_status ON access_delegations(status);
CREATE INDEX idx_delegations_expiry ON access_delegations(end_date);

-- Function to check delegated access
CREATE OR REPLACE FUNCTION has_delegated_access(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM access_delegations
    WHERE delegate_id = p_user_id
    AND resource_type = p_resource_type
    AND (resource_ids IS NULL OR p_resource_id = ANY(resource_ids))
    AND status = 'active'
    AND NOW() BETWEEN start_date AND end_date
  );
$$ LANGUAGE SQL STABLE;
```

### Delegation API

```typescript
// src/lib/delegation.ts

interface DelegationRequest {
  delegateEmail: string;
  permissions: string[];
  resourceType?: string;
  resourceIds?: string[];
  reason: string;
  endDate: Date;
}

export async function createDelegation(
  delegator: User,
  request: DelegationRequest
): Promise<Delegation> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Validate delegator has permission to delegate
  if (!['org_admin', 'super_admin'].includes(delegator.role)) {
    throw new Error('Insufficient permissions to delegate access');
  }

  // Find delegate user
  const { data: delegate } = await supabase
    .from('profiles')
    .select('id, organization_id')
    .eq('email', request.delegateEmail)
    .single();

  if (!delegate) {
    throw new Error('Delegate user not found');
  }

  // Ensure same organization (unless super_admin)
  if (delegator.role !== 'super_admin' && delegate.organization_id !== delegator.organization_id) {
    throw new Error('Cannot delegate to users in different organizations');
  }

  // Validate end date (max 90 days)
  const maxEndDate = new Date();
  maxEndDate.setDate(maxEndDate.getDate() + 90);
  if (request.endDate > maxEndDate) {
    throw new Error('Delegation period cannot exceed 90 days');
  }

  // Get permission IDs
  const { data: permissionIds } = await supabase
    .from('permissions')
    .select('id')
    .in('full_permission', request.permissions);

  // Create delegation
  const { data: delegation } = await supabase
    .from('access_delegations')
    .insert({
      delegator_id: delegator.id,
      delegate_id: delegate.id,
      permission_ids: permissionIds.map(p => p.id),
      resource_type: request.resourceType,
      resource_ids: request.resourceIds,
      reason: request.reason,
      end_date: request.endDate.toISOString()
    })
    .select()
    .single();

  // Audit log
  await logAudit({
    action: 'permission_change',
    resourceType: 'delegation',
    resourceId: delegation.id,
    reason: `Delegated access to ${request.delegateEmail}`,
    severity: 'warning',
    complianceRelevant: true
  }, delegator, request);

  // Send notification to delegate
  await sendNotification(delegate.id, {
    type: 'access_granted',
    message: `${delegator.email} has granted you temporary access until ${request.endDate.toLocaleDateString()}`,
    link: '/settings/delegations'
  });

  return delegation;
}

export async function revokeDelegation(
  delegationId: string,
  revoker: User,
  reason: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  await supabase
    .from('access_delegations')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: revoker.id,
      revoke_reason: reason
    })
    .eq('id', delegationId);

  await logAudit({
    action: 'permission_change',
    resourceType: 'delegation',
    resourceId: delegationId,
    reason: `Revoked delegation: ${reason}`,
    severity: 'warning',
    complianceRelevant: true
  }, revoker, request);
}
```

---

## Compliance & Governance

### Automated Compliance Reports

```sql
-- Compliance report view
CREATE VIEW compliance_user_access_report AS
SELECT
  p.email,
  p.role,
  o.name as organization,
  COUNT(DISTINCT al.id) as total_actions,
  COUNT(DISTINCT al.id) FILTER (WHERE al.action = 'export') as data_exports,
  COUNT(DISTINCT al.id) FILTER (WHERE al.action = 'delete') as deletions,
  MAX(al.timestamp) as last_activity,
  array_agg(DISTINCT al.action) as actions_performed
FROM profiles p
JOIN organizations o ON o.id = p.organization_id
LEFT JOIN audit_logs al ON al.user_id = p.id
WHERE al.timestamp > NOW() - INTERVAL '90 days'
GROUP BY p.id, p.email, p.role, o.name;

-- Permission changes audit
CREATE VIEW compliance_permission_changes AS
SELECT
  al.timestamp,
  p1.email as changed_by,
  p1.role as changed_by_role,
  p2.email as affected_user,
  al.changes,
  al.reason,
  o.name as organization
FROM audit_logs al
JOIN profiles p1 ON p1.id = al.user_id
LEFT JOIN profiles p2 ON p2.id = (al.changes->>'user_id')::UUID
LEFT JOIN organizations o ON o.id = al.organization_id
WHERE al.resource_type = 'user_permission'
ORDER BY al.timestamp DESC;

-- Data access by classification
CREATE VIEW compliance_classified_data_access AS
SELECT
  dc.classification,
  COUNT(DISTINCT al.resource_id) as resources_accessed,
  COUNT(DISTINCT al.user_id) as unique_users,
  COUNT(*) as total_accesses,
  array_agg(DISTINCT p.role) as accessing_roles
FROM audit_logs al
JOIN data_classifications dc ON dc.resource_id = al.resource_id AND dc.resource_type = al.resource_type
JOIN profiles p ON p.id = al.user_id
WHERE al.action = 'read'
AND al.timestamp > NOW() - INTERVAL '30 days'
GROUP BY dc.classification;
```

### Compliance Export API

```typescript
// api/functions/compliance-export.ts
export async function exportComplianceReport(
  orgId: string,
  reportType: 'user_access' | 'permission_changes' | 'data_exports',
  startDate: Date,
  endDate: Date,
  requestedBy: User
): Promise<Buffer> {
  // Check permission
  if (!await hasPermission(requestedBy, 'audit_logs.export')) {
    throw new Error('Insufficient permissions');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let data;
  switch (reportType) {
    case 'user_access':
      data = await supabase
        .from('compliance_user_access_report')
        .select('*')
        .eq('organization', orgId);
      break;
    case 'permission_changes':
      data = await supabase
        .from('compliance_permission_changes')
        .select('*')
        .eq('organization', orgId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());
      break;
    // ... other report types
  }

  // Generate CSV
  const csv = convertToCSV(data);

  // Audit log
  await logAudit({
    action: 'export',
    resourceType: 'compliance_report',
    reason: `${reportType} report for ${startDate} to ${endDate}`,
    severity: 'warning',
    complianceRelevant: true
  }, requestedBy, request);

  return Buffer.from(csv);
}
```

### PIPEDA Compliance Checklist

```typescript
// Personal Information Protection and Electronic Documents Act (Canada)

const PIPEDA_REQUIREMENTS = {
  consent: {
    implemented: true,
    notes: 'Users consent to data collection during signup',
    evidence: 'Consent checkboxes in registration form'
  },
  limiting_collection: {
    implemented: true,
    notes: 'Only collect data necessary for service delivery',
    evidence: 'Data minimization in schema design'
  },
  limiting_use: {
    implemented: true,
    notes: 'Data only used for stated purposes (training, analytics)',
    evidence: 'Privacy policy + RLS policies'
  },
  accuracy: {
    implemented: true,
    notes: 'Users can update their profiles',
    evidence: 'Profile edit functionality'
  },
  safeguards: {
    implemented: true,
    notes: 'Encryption at rest (AES-256), in transit (TLS 1.3), RLS, MFA',
    evidence: 'Security controls documented in SECURITY.md'
  },
  openness: {
    implemented: true,
    notes: 'Privacy policy published and accessible',
    evidence: 'Public /privacy-policy page'
  },
  individual_access: {
    implemented: true,
    notes: 'Users can view all their data via profile dashboard',
    evidence: '/profile/data-export endpoint'
  },
  challenging_compliance: {
    implemented: true,
    notes: 'Contact form for privacy inquiries',
    evidence: 'privacy@abrinsights.com email'
  },
  accountability: {
    implemented: true,
    notes: 'Designated Privacy Officer (super_admin role)',
    evidence: 'Privacy Officer contact in footer'
  },
  data_portability: {
    implemented: true,
    notes: 'Users can export all their data as JSON',
    evidence: '/api/users/me/export endpoint'
  },
  right_to_erasure: {
    implemented: true,
    notes: 'Users can request account deletion',
    evidence: '/api/users/me/delete endpoint with soft delete + cascade'
  }
};
```

---

## Security Controls

### Multi-Factor Authentication (MFA)

```sql
-- MFA configuration
CREATE TABLE public.mfa_config (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  method TEXT DEFAULT 'totp' CHECK (method IN ('totp', 'sms', 'email')),
  secret TEXT, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Encrypted one-time backup codes
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce MFA for high-risk roles
CREATE OR REPLACE FUNCTION enforce_mfa_for_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IN ('super_admin', 'org_admin', 'compliance_officer') THEN
    IF NOT EXISTS (SELECT 1 FROM mfa_config WHERE user_id = NEW.id AND enabled = true) THEN
      RAISE EXCEPTION 'MFA is required for admin roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_admin_mfa
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_mfa_for_admins();
```

### Session Management

```sql
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expiry ON user_sessions(expires_at);

-- Session timeout: 8 hours of inactivity
CREATE OR REPLACE FUNCTION expire_inactive_sessions()
RETURNS void AS $$
  UPDATE user_sessions
  SET is_active = false
  WHERE last_activity_at < NOW() - INTERVAL '8 hours'
  AND is_active = true;
$$ LANGUAGE SQL;

-- Run via cron job
```

### IP Whitelisting (Enterprise)

```sql
CREATE TABLE public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ip_range CIDR NOT NULL,
  description TEXT,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check IP whitelist
CREATE OR REPLACE FUNCTION is_ip_whitelisted(
  p_org_id UUID,
  p_ip_address INET
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM ip_whitelist
    WHERE organization_id = p_org_id
    AND p_ip_address << ip_range -- IP is within range
  );
$$ LANGUAGE SQL STABLE;
```

---

## Implementation Guide

### Phase 1: Core RBAC (Week 5)

- [ ] Create permissions table with seed data
- [ ] Create role_permissions mapping
- [ ] Implement `hasPermission()` function
- [ ] Add RLS policies to all tables
- [ ] Update React components with permission checks
- [ ] Add permission-based UI rendering

### Phase 2: Audit Logging (Week 6)

- [ ] Create audit_logs table
- [ ] Implement `logAudit()` function
- [ ] Add audit logging to all sensitive actions
- [ ] Create audit log viewer UI for admins
- [ ] Set up automated compliance reports

### Phase 3: Advanced Features (Weeks 7-8)

- [ ] Implement data classification
- [ ] Build delegation framework
- [ ] Add MFA enforcement for admins
- [ ] Create compliance export APIs
- [ ] Build governance dashboard

### Phase 4: Enterprise Features (Weeks 9-10)

- [ ] IP whitelisting
- [ ] Session management improvements
- [ ] Advanced audit analytics
- [ ] SIEM integration
- [ ] Penetration testing

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Unauthorized Access Attempts** | 0 | Audit log analysis |
| **RLS Policy Coverage** | 100% of tables | Code review |
| **MFA Adoption (Admins)** | 100% | User settings table |
| **Audit Log Completeness** | 100% of sensitive actions | Automated checks |
| **Permission Check Performance** | < 50ms | Application Insights |
| **Compliance Report Generation** | < 30s | Monitoring |
| **Zero Security Incidents** | 0 data breaches | Ongoing monitoring |

---

**Document Status**: 📝 Draft
**Last Updated**: November 5, 2025
**Compliance**: PIPEDA, SOC 2 Type II, ISO 27001, WCAG 2.1 AA
**Next Review**: Before Phase 1 implementation
