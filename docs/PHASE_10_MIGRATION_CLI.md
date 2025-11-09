# Phase 10 Migration Guide - CLI Method

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Project linked to Supabase: `supabase link --project-ref <your-ref>`

## Migration Files
Located in `supabase/migrations/`:
1. `20250116000001_enterprise_sso_auth.sql` (422 lines)
2. `20250116000002_advanced_rbac.sql` (597 lines)
3. `20250116000003_audit_logs_enhancement.sql` (529 lines)

## Quick Apply

### Method 1: Using PowerShell Script (Recommended)
```powershell
.\scripts\apply-migrations-cli.ps1
```

### Method 2: Direct CLI Command
```bash
cd d:\APPS\abr-insights-app
supabase db push
```

This command will:
- Detect all pending migrations in `supabase/migrations/`
- Apply them in sequential order
- Create all Phase 10 tables, functions, and policies

## What Gets Created

### Migration 1: Enterprise SSO Auth
**Tables:**
- `sso_providers` - SSO configuration (Azure AD B2C, SAML, OIDC)
- `enterprise_sessions` - Active SSO sessions
- `identity_provider_mapping` - External identity linking
- `sso_login_attempts` - Security audit trail

**Functions:**
- `get_active_sso_session()`
- `revoke_user_sso_sessions()`
- `cleanup_expired_sso_sessions()`
- `get_org_sso_provider()`

**RLS Policies:** 9 policies for multi-tenant isolation

### Migration 2: Advanced RBAC
**Tables:**
- `resource_permissions` - Granular resource-level access
- `permission_overrides` - User-specific exceptions
- `role_hierarchy` - Role inheritance chains
- `permission_cache` - 1-hour TTL performance cache

**Functions:**
- `check_user_permission()` - Comprehensive permission evaluation
- `get_user_effective_permissions()` - Cached computation
- `cleanup_expired_permission_cache()`
- `get_user_roles_with_inheritance()` - Recursive hierarchy

**RLS Policies:** 8 policies with cache invalidation triggers

### Migration 3: Audit Logs Enhancement
**Tables:**
- `audit_logs` (enhanced) - Added 13 columns including hash chain
- `compliance_reports` - Scheduled/on-demand reports
- `audit_log_exports` - Export tracking with approvals
- `audit_logs_archive` - Long-term storage

**Functions:**
- `archive_old_audit_logs()` - Move to archive after 365 days
- `delete_expired_audit_logs()` - Delete past retention period
- `get_audit_log_statistics()` - Compliance metrics
- `detect_audit_anomalies()` - Rule-based detection
- `cleanup_expired_compliance_reports()`
- `cleanup_expired_audit_exports()`

**Key Feature:** Blockchain-style hash chain for tamper detection

## Verification

### Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'sso_providers', 'enterprise_sessions', 'identity_provider_mapping', 'sso_login_attempts',
  'resource_permissions', 'permission_overrides', 'role_hierarchy', 'permission_cache',
  'compliance_reports', 'audit_log_exports', 'audit_logs_archive'
);
```

### Check Functions Created
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE ANY(ARRAY[
  'get_active_sso_session',
  'check_user_permission',
  'archive_old_audit_logs',
  'detect_audit_anomalies'
]);
```

### Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN (
  'sso_providers', 'resource_permissions', 'compliance_reports'
);
```

## Troubleshooting

### Issue: Project Not Linked
```bash
supabase link --project-ref nuywgvbkgdvngrysqdul
```

### Issue: Authentication Failed
Check your `.env.local` has correct credentials:
```
NEXT_PUBLIC_SUPABASE_URL=***REMOVED***
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Issue: Migration Already Applied
Supabase CLI tracks applied migrations. If already applied, it will skip them.

### Issue: Syntax Error
- Review the specific migration file
- Check for missing dependencies (base tables should exist)
- Ensure previous migrations (001-013) were applied first

## Rollback

To rollback migrations:
```bash
supabase db reset --version 20250115235959  # Reset to before Phase 10
```

Note: This will drop all Phase 10 tables. Use with caution!

## Testing After Application

1. **SSO Config** - Visit `/admin/sso-config` and verify table access
2. **RBAC** - Visit `/admin/permissions` and test permission checks
3. **Audit Logs** - Visit `/admin/audit-logs` and verify hash chain
4. **Compliance** - Visit `/admin/compliance` and test report generation

## Success Criteria
✅ All 11 tables created  
✅ 14 functions deployed  
✅ 23 RLS policies active  
✅ 9 triggers operational  
✅ Hash chain functional  
✅ Permission cache working  
✅ Role hierarchy queries successful
