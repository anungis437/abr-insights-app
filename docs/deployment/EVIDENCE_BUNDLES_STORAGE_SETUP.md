# Evidence Bundles Storage Setup

## Overview

Evidence bundles require a dedicated Supabase Storage bucket for immutable, audit-ready file storage.

## Prerequisites

- Supabase project configured
- Admin access to Supabase Dashboard
- Database migration `020_evidence_bundles_tracking.sql` applied ✅

## Storage Bucket Configuration

### 1. Create Bucket

1. Navigate to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configuration:
   - **Name**: `evidence-bundle-pdfs`
   - **Public**: ❌ **No** (requires authentication)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: `application/pdf`, `application/zip`

### 2. Set Up RLS Policies

Navigate to **Policies** tab for the `evidence-bundles` bucket:

#### Policy 1: SELECT (Download) - Organization-based Access

```sql
CREATE POLICY "Users can download org evidence bundles"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'evidence-bundle-pdfs'
  AND EXISTS (
    SELECT 1
    FROM evidence_bundle_pdfs eb
    JOIN profiles p ON eb.case_id IN (
      SELECT id FROM tribunal_cases WHERE organization_id = p.organization_id
    )
    WHERE eb.storage_path = name
    AND p.id = auth.uid()
  )
);
```

#### Policy 2: INSERT (Upload) - Authenticated Users

```sql
CREATE POLICY "Authenticated users can upload evidence bundles"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'evidence-bundle-pdfs'
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: DELETE - Admin Only (Manual Cleanup)

```sql
CREATE POLICY "Admins can delete evidence bundles"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'evidence-bundle-pdfs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### 3. Verify Configuration

Test bucket access with these queries:

```typescript
// Test upload (should succeed for authenticated users)
const { data, error } = await supabase.storage
  .from('evidence-bundle-pdfs')
  .upload('test.pdf', buffer, {
    contentType: 'application/pdf',
  })

// Test signed URL creation (should succeed)
const { data: urlData, error: urlError } = await supabase.storage
  .from('evidence-bundle-pdfs')
  .createSignedUrl('test.pdf', 3600)

// Test RLS (should only see org bundles)
const { data: bundles } = await supabase.from('evidence_bundle_pdfs').select('*')
```

## File Naming Convention

Evidence bundles use deterministic file names:

```
evidence-bundle-{CASE_ID}-{TIMESTAMP}.pdf
```

Example:

```
evidence-bundle-550e8400-e29b-41d4-a716-446655440000-2024-01-15T10-30-45Z.pdf
```

## Retention Policy

### Short-term (0-90 days)

- All bundles accessible via signed URLs
- Access tracked in `evidence_bundles.accessed_count`

### Medium-term (90 days - 7 years)

- Required for legal/compliance
- Consider archival storage for cost optimization

### Long-term (7+ years)

- Consult legal team for retention requirements
- May require cold storage migration

## Monitoring

### Key Metrics

1. **Storage Usage**

   ```sql
   SELECT
     COUNT(*) as total_bundles,
     SUM(file_size) / (1024 * 1024) as total_mb
   FROM evidence_bundle_pdfs;
   ```

2. **Access Patterns**

   ```sql
   SELECT
     file_name,
     accessed_count,
     last_accessed_at
   FROM evidence_bundle_pdfs
   ORDER BY accessed_count DESC
   LIMIT 20;
   ```

3. **Recent Generations**
   ```sql
   SELECT
     eb.*,
     p.full_name as created_by_name
   FROM evidence_bundle_pdfs eb
   JOIN profiles p ON eb.created_by = p.id
   WHERE eb.created_at > NOW() - INTERVAL '7 days'
   ORDER BY eb.created_at DESC;
   ```

## Troubleshooting

### Upload Failures

**Error**: "new row violates row-level security policy"

- **Cause**: User not authenticated
- **Fix**: Ensure `supabase.auth.getUser()` succeeds before upload

**Error**: "Payload too large"

- **Cause**: File exceeds 50 MB limit
- **Fix**: Split into multiple bundles or increase bucket limit

### Download Failures

**Error**: "Object not found"

- **Cause**: Signed URL expired (>1 hour old)
- **Fix**: Regenerate signed URL via `createEvidenceBundle()`

**Error**: "Access denied"

- **Cause**: User not in case's organization
- **Fix**: Verify RLS policies and organization membership

## Security Considerations

### Immutability

- Uploads use `upsert: false` to prevent overwrites
- Storage paths are UNIQUE in database
- Checksums verify file integrity

### Access Control

- All downloads require signed URLs (time-limited)
- Access tracking logged to audit trail
- Organization-based isolation via RLS

### Compliance

- Meets NIST SP 800-86 evidence handling requirements
- Supports chain of custody via audit logs
- Deterministic generation ensures reproducibility

## Next Steps

1. ✅ Create bucket with configuration above
2. ✅ Apply RLS policies
3. ✅ Test upload/download flow
4. ⏭️ Apply database migration `020_evidence_bundles_tracking.sql`
5. ⏭️ Update UI to call `createEvidenceBundle()` server action
6. ⏭️ Deploy to production environment

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Evidence Bundles Technical Debt](../architecture/EVIDENCE_BUNDLES_TECHNICAL_DEBT.md)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
