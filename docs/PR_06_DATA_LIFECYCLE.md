# PR-06: Data Lifecycle - Export, Deletion, Offboarding

**Status**: ✅ COMPLETE  
**Commit**: TBD (after this commit)  
**Date**: February 3, 2026

## Overview

Implemented comprehensive organization offboarding workflow with GDPR-compliant data export, Stripe cancellation, access revocation, and scheduled deletion. Provides complete lifecycle management for organization offboarding with audit trails and admin controls.

## Objectives

- ✅ Track offboarding lifecycle (requested → completed)
- ✅ Generate comprehensive data exports (ZIP/CSV format)
- ✅ Cancel Stripe subscriptions automatically
- ✅ Revoke organization access (disable users, invalidate sessions)
- ✅ Schedule data deletion (30-day GDPR retention)
- ✅ Audit log all offboarding actions
- ✅ Admin API for offboarding management
- ✅ Super admin only access control

## Implementation

### 1. Database Schema (`supabase/migrations/20260203_org_offboarding.sql`)

**Tables Created**:

#### `org_offboarding_requests`
Tracks offboarding lifecycle from request to completion.

**Key Columns**:
- `organization_id`, `requested_by`, `requested_at`
- `status`: requested, exporting_data, export_ready, cancelling_stripe, revoking_access, deletion_scheduled, completed, failed
- **Export tracking**: `export_file_path`, `export_download_url`, `export_file_size_bytes`, `export_downloaded_at`
- **Stripe tracking**: `stripe_subscription_id`, `stripe_cancelled_at`
- **Access revocation**: `users_disabled_count`, `sessions_invalidated_count`
- **Deletion scheduling**: `deletion_scheduled_at`, `deletion_executed_at`
- **Error tracking**: `error_message`, `retry_count`

**Indexes**:
- `idx_offboarding_org_id`: Organization lookup
- `idx_offboarding_status`: Processing queue (active requests only)
- `idx_offboarding_deletion_scheduled`: Cleanup job (pending deletions only)

**RLS Policies**:
- Super admins: All access
- Org admins: View/create their org's requests

#### `data_export_contents`
Audit trail of data included in each export.

**Columns**:
- Export metadata: `total_files`, `total_size_bytes`, `export_format`
- Data counts: `users_exported`, `courses_exported`, `enrollments_exported`, etc.
- Verification: `file_manifest` (JSONB), `export_checksum` (SHA-256)

#### `offboarding_audit_log`
Detailed audit log for compliance.

**Columns**:
- Action: `action`, `actor_id`, `actor_role`
- Context: `details` (JSONB), `ip_address`, `user_agent`
- Result: `success`, `error_message`

**Database Functions**:

1. **`get_org_offboarding_status(org_id)`**: Returns current status, export readiness, days until deletion
2. **`log_offboarding_action(request_id, action, details, success, error)`**: Audit logging
3. **`update_offboarding_status(request_id, status, error)`**: Status transitions with logging

### 2. Data Export Service (`lib/services/data-export.ts`)

Generates comprehensive GDPR-compliant data exports.

**Core Function**: `generateExport(options)`

**Exports Included**:
- Users (profiles, roles, joined dates)
- Courses (all course data)
- Enrollments (status, completion dates)
- Progress records (lesson completion, time spent)
- Quiz attempts (scores, passed/failed)
- Certificates (issued dates, URLs)
- Achievements (earned dates, types)
- AI usage (daily aggregates, costs)
- Billing records (transactions, Stripe IDs)
- Audit logs (all organization actions)

**Features**:
- **CSV format**: Escaped commas/quotes, proper headers
- **ZIP compression**: Level 9 compression
- **Checksums**: SHA-256 for all files + manifest
- **Manifest**: Complete inventory with record counts
- **Structured logging**: All operations logged
- **Error handling**: Cleanup on failure

**Export Manifest Structure**:
```json
{
  "organizationId": "org_123",
  "exportedAt": "2026-02-03T12:00:00Z",
  "requestedBy": "user_456",
  "totalFiles": 11,
  "totalSizeBytes": 1048576,
  "files": [
    {
      "name": "users.csv",
      "type": "users",
      "sizeBytes": 5120,
      "recordCount": 25,
      "checksum": "abc123..."
    }
  ],
  "counts": {
    "users": 25,
    "courses": 10,
    "enrollments": 150,
    ...
  }
}
```

### 3. Offboarding Orchestration Service (`lib/services/org-offboarding.ts`)

Orchestrates complete offboarding workflow.

**Workflow Steps**:

1. **Initiate Offboarding**:
   - Verify organization exists
   - Check for existing offboarding
   - Create offboarding request
   - Start async processing

2. **Export Data**:
   - Generate ZIP with all data
   - Calculate checksums
   - Store export metadata
   - Create download URL

3. **Cancel Stripe**:
   - Cancel subscription at period end (no refund)
   - Log cancellation
   - Handle missing subscriptions gracefully

4. **Revoke Access**:
   - Disable all organization users
   - Invalidate sessions (Supabase handles automatically)
   - Track disabled count
   - Log errors per user

5. **Schedule Deletion**:
   - Set deletion date (30 days from now)
   - GDPR compliance: 30-day retention
   - Log scheduled deletion

6. **Complete**:
   - Mark status as completed
   - Log completion

**Error Handling**:
- Each step isolated (failures don't block subsequent steps)
- Stripe errors don't fail offboarding
- User disable errors logged but don't stop process
- Status updated to 'failed' on critical errors
- Retry count tracked

**Key Functions**:
- `initiateOffboarding(request)`: Start workflow
- `processOffboarding(requestId, orgId, request)`: Async orchestration
- `getStatus(requestId)`: Get current status
- `getStatusByOrganization(orgId)`: Get active offboarding

### 4. Admin API Endpoints

#### POST `/api/admin/offboarding`
Initiate organization offboarding.

**Authorization**: Super admin only

**Request Body**:
```json
{
  "organizationId": "org_123",
  "reason": "Customer requested account closure",
  "includeAuditLogs": true,
  "includeBillingRecords": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "req_789",
    "organizationId": "org_123",
    "status": "requested",
    "requestedAt": "2026-02-03T12:00:00Z",
    "exportReady": false
  }
}
```

#### GET `/api/admin/offboarding?organizationId=org_123`
Get offboarding status (by request ID or organization ID).

**Authorization**: Super admin only

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "req_789",
    "organizationId": "org_123",
    "status": "export_ready",
    "requestedAt": "2026-02-03T12:00:00Z",
    "exportReady": true,
    "exportDownloadUrl": "/api/admin/offboarding/download/req_789",
    "deletionScheduledAt": "2026-03-05T12:00:00Z",
    "daysUntilDeletion": 30
  }
}
```

#### GET `/api/admin/offboarding/download/[requestId]`
Download data export ZIP.

**Authorization**: Super admin only

**Response**:
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="org_123_export.zip"`
- Records download in audit log

### 5. CI Workflow (`.github/workflows/data-lifecycle.yml`)

**Jobs**:

1. **Validate Schema**:
   - Migration file exists
   - Tables defined (org_offboarding_requests, data_export_contents, offboarding_audit_log)
   - Required columns present
   - Database functions defined
   - RLS policies configured

2. **Validate Data Export**:
   - Service file exists
   - All export functions present
   - CSV generation implemented
   - ZIP creation (archiver)
   - Checksum calculation (SHA-256)
   - Structured logging used

3. **Validate Offboarding Service**:
   - Core functions present
   - Stripe integration implemented
   - Access revocation tracked
   - 30-day deletion scheduling
   - Structured logging used

4. **Validate API Endpoints**:
   - POST handler (initiate offboarding)
   - GET handler (status)
   - Download handler (export ZIP)
   - Super admin authentication
   - Stable error codes

## Usage Patterns

### Pattern 1: Initiate Offboarding

```typescript
// Admin initiates offboarding
const response = await fetch('/api/admin/offboarding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'org_123',
    reason: 'Customer requested account closure',
    includeAuditLogs: true,
    includeBillingRecords: true,
  }),
})

const { data } = await response.json()
console.log(`Offboarding initiated: ${data.requestId}`)
```

### Pattern 2: Check Offboarding Status

```typescript
// Poll for status updates
const checkStatus = async (requestId: string) => {
  const response = await fetch(
    `/api/admin/offboarding?requestId=${requestId}`
  )
  const { data } = await response.json()
  
  console.log(`Status: ${data.status}`)
  console.log(`Export ready: ${data.exportReady}`)
  
  if (data.exportReady) {
    console.log(`Download URL: ${data.exportDownloadUrl}`)
  }
  
  if (data.deletionScheduledAt) {
    console.log(`Deletion in ${data.daysUntilDeletion} days`)
  }
  
  return data
}

// Poll every 10 seconds until export ready
const pollUntilReady = async (requestId: string) => {
  while (true) {
    const status = await checkStatus(requestId)
    if (status.exportReady || status.status === 'failed') break
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
}
```

### Pattern 3: Download Export

```typescript
// Download export ZIP
const downloadExport = async (requestId: string) => {
  const response = await fetch(
    `/api/admin/offboarding/download/${requestId}`
  )
  
  if (!response.ok) {
    throw new Error('Download failed')
  }
  
  const blob = await response.blob()
  
  // Trigger browser download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `org_export_${requestId}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Pattern 4: Direct Service Usage (Server-Side)

```typescript
import { orgOffboarding } from '@/lib/services/org-offboarding'

// Initiate offboarding
const status = await orgOffboarding.initiateOffboarding({
  organizationId: 'org_123',
  requestedBy: 'admin_456',
  reason: 'Migration to competitor',
  includeAuditLogs: true,
  includeBillingRecords: true,
})

// Check status
const currentStatus = await orgOffboarding.getStatus(status.requestId)

// Or by organization
const orgStatus = await orgOffboarding.getStatusByOrganization('org_123')
```

## Offboarding Status Flow

```
requested
    ↓
exporting_data (generating ZIP)
    ↓
export_ready (download available)
    ↓
cancelling_stripe (cancelling subscription)
    ↓
revoking_access (disabling users, invalidating sessions)
    ↓
deletion_scheduled (30 days until deletion)
    ↓
completed
```

**Failed State**: Any critical error transitions to 'failed' status with error message.

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `FORBIDDEN` | 403 | Not authorized (super admin required) |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `MISSING_PARAMETER` | 400 | Required parameter missing |
| `INTERNAL_ERROR` | 500 | Server error during offboarding |
| `NOT_FOUND` | 404 | Request or organization not found |
| `EXPORT_NOT_READY` | 400 | Export not completed yet |
| `FILE_NOT_FOUND` | 404 | Export file missing from storage |

## Benefits

### Compliance
1. **GDPR Compliant**: 30-day retention, complete data export
2. **Audit Trail**: All actions logged with actor, timestamp, details
3. **Data Portability**: Standard CSV format for easy import
4. **Right to Deletion**: Scheduled permanent deletion

### Operational
1. **Automated Workflow**: Single API call initiates complete process
2. **Stripe Integration**: Automatic subscription cancellation
3. **Access Revocation**: Users disabled, sessions invalidated
4. **Error Recovery**: Failures logged, retries supported

### Security
1. **Super Admin Only**: Sensitive operation restricted
2. **Checksums**: SHA-256 verification of exports
3. **Download Tracking**: Audit log records who downloaded
4. **Isolated Processing**: Each step independent

## Testing

### Manual Testing

1. **Initiate Offboarding**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/offboarding \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "organizationId": "org_test",
       "reason": "Test offboarding",
       "includeAuditLogs": true,
       "includeBillingRecords": true
     }'
   # Expected: 200 OK, requestId returned
   ```

2. **Check Status**:
   ```bash
   curl "http://localhost:3000/api/admin/offboarding?requestId=req_123" \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   # Expected: 200 OK, status and export readiness
   ```

3. **Download Export**:
   ```bash
   curl "http://localhost:3000/api/admin/offboarding/download/req_123" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -o export.zip
   # Expected: 200 OK, ZIP file downloaded
   ```

4. **Verify Export Contents**:
   ```bash
   unzip -l export.zip
   # Expected: manifest.json, users.csv, courses.csv, etc.
   
   cat manifest.json
   # Expected: Complete manifest with checksums
   ```

### CI Testing

1. ✅ Schema migration file exists
2. ✅ Tables defined (3 tables)
3. ✅ Required columns present
4. ✅ Database functions defined (3 functions)
5. ✅ RLS policies configured
6. ✅ Export functions present (11 functions)
7. ✅ CSV/ZIP generation implemented
8. ✅ Checksum calculation (SHA-256)
9. ✅ Offboarding orchestration functions
10. ✅ Stripe integration
11. ✅ Access revocation
12. ✅ 30-day deletion scheduling
13. ✅ API endpoints (POST/GET/download)
14. ✅ Super admin authentication
15. ✅ Stable error codes
16. ✅ Structured logging

## Acceptance Criteria

- ✅ Database schema created (3 tables)
- ✅ Database functions implemented (3 functions)
- ✅ RLS policies configured (super admin, org admin)
- ✅ Data export service with 11 export functions
- ✅ CSV generation with escaping
- ✅ ZIP compression with checksums (SHA-256)
- ✅ Offboarding orchestration service
- ✅ Stripe cancellation integration
- ✅ Access revocation (disable users, invalidate sessions)
- ✅ 30-day deletion scheduling (GDPR)
- ✅ Admin API endpoints (POST, GET, download)
- ✅ Super admin only access control
- ✅ Stable error codes defined
- ✅ Structured logging throughout
- ✅ Audit log all actions
- ✅ CI workflow validates all components

## Migration Guide

### 1. Apply Database Migration

```bash
# Apply migration
supabase db push

# Or manually
psql $DATABASE_URL -f supabase/migrations/20260203_org_offboarding.sql
```

### 2. Verify Tables Created

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('org_offboarding_requests', 'data_export_contents', 'offboarding_audit_log');

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_org_offboarding_status', 'log_offboarding_action', 'update_offboarding_status');
```

### 3. Install Dependencies

```bash
npm install archiver
npm install --save-dev @types/archiver
```

### 4. Configure Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...  # Required for Stripe cancellation
```

### 5. Test Offboarding Flow

1. Create test organization
2. Initiate offboarding via API
3. Monitor status (should progress through stages)
4. Download export when ready
5. Verify export contents
6. Check deletion scheduled (30 days)

## Future Enhancements

1. **Automatic Deletion Execution**: Background job to execute scheduled deletions
2. **Email Notifications**: Notify org admins at each stage
3. **Partial Exports**: Allow selective data export (e.g., only users + courses)
4. **Export to S3**: Store exports in cloud storage (presigned URLs)
5. **Bulk Offboarding**: Offboard multiple organizations in batch
6. **Export History**: Keep history of all exports per organization
7. **Custom Retention**: Configurable retention period (not fixed 30 days)

## Related Documentation

- [PR-05: AI Abuse & Cost Controls](./PR_05_AI_COST_CONTROLS.md)
- [GDPR Compliance Guide](https://gdpr.eu/data-portability/)
- [Stripe Subscription Cancellation](https://stripe.com/docs/billing/subscriptions/cancel)

## Deployment Notes

- **Database Migration Required**: Apply 20260203_org_offboarding.sql
- **Dependencies**: Install archiver package
- **Environment Variable**: STRIPE_SECRET_KEY required
- **Storage**: Ensure sufficient disk space for exports (temp directory)
- **Permissions**: Super admin role required in profiles table
- **CI Required**: Must pass data-lifecycle.yml workflow

---

**PR-06 COMPLETE** ✅  
Next: [PR-07: CanLII Hard Compliance Enforcement](./PR_07_CANLII_COMPLIANCE.md)
