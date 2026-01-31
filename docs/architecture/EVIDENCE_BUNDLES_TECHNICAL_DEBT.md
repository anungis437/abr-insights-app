# Evidence Bundles - Technical Debt & Roadmap

## Current State (Client-Oriented Architecture)

**File:** `lib/services/evidence-bundles.ts`

### Implementation Details

The current evidence bundles service uses a client-side architecture:

1. **Client-Side Generation**: PDF and ZIP files are generated in the browser using `jspdf` and `jszip`
2. **Supabase Client**: Uses the client-side Supabase SDK to fetch data
3. **Local Storage**: Files are downloaded directly to the user's device
4. **No Audit Trail**: Limited audit logging of bundle creation and access

### Limitations for Procurement/Compliance-Grade Use Cases

This architecture is **not suitable** for:

- **Legal/Regulatory Compliance**: No immutable record of bundle contents
- **Chain of Custody**: Cannot prove bundle integrity over time
- **Audit Requirements**: Missing comprehensive audit logs
- **Enterprise Procurement**: Lacks server-side signing and verification
- **Data Governance**: No centralized control over generated artifacts

## Recommended World-Class Architecture

### Server-Side Generation with Immutable Storage

```
User Request → API Route → Server Action → Generate PDF/ZIP
                                        ↓
                              Supabase Storage (immutable)
                                        ↓
                              Audit Log Entry (who/what/when)
                                        ↓
                              Return signed URL (time-limited)
```

### Key Components

#### 1. Server Action for Bundle Generation

**Location:** `lib/actions/evidence-bundles.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { generatePDF } from '@/lib/services/pdf-generator-server'
import { logAuditEvent } from '@/lib/services/audit-logger'

export async function createEvidenceBundle(
  caseId: string,
  includeAttachments: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch data server-side (with RLS)
  const caseData = await getCaseWithEvidence(caseId)
  
  // 2. Generate PDF server-side (deterministic)
  const pdfBuffer = await generatePDF(caseData, {
    timestamp: new Date().toISOString(),
    generatedBy: user.email,
    includeSignature: true,
  })
  
  // 3. Upload to Supabase Storage (immutable)
  const fileName = `evidence-${caseId}-${Date.now()}.pdf`
  const { data: uploadData, error } = await supabase.storage
    .from('evidence-bundles')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      cacheControl: '31536000', // 1 year (immutable)
    })
  
  if (error) throw error
  
  // 4. Log audit event
  await logAuditEvent({
    action: 'evidence_bundle_created',
    resource_type: 'case',
    resource_id: caseId,
    user_id: user.id,
    metadata: {
      fileName,
      storagePath: uploadData.path,
      includeAttachments,
    },
  })
  
  // 5. Create DB record for tracking
  await supabase.from('evidence_bundles').insert({
    case_id: caseId,
    storage_path: uploadData.path,
    created_by: user.id,
    file_name: fileName,
    file_size: pdfBuffer.length,
    checksum: calculateChecksum(pdfBuffer),
  })
  
  // 6. Return signed URL (time-limited, trackable)
  const { data: urlData } = await supabase.storage
    .from('evidence-bundles')
    .createSignedUrl(uploadData.path, 3600) // 1 hour
  
  return {
    url: urlData.signedUrl,
    fileName,
    expiresAt: Date.now() + 3600000,
  }
}
```

#### 2. Database Schema for Evidence Bundles

**Migration:** `supabase/migrations/XXX_evidence_bundles_tracking.sql`

```sql
CREATE TABLE evidence_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  metadata JSONB,
  
  -- Audit trail
  CONSTRAINT evidence_bundles_unique_path UNIQUE(storage_path)
);

-- Index for lookups
CREATE INDEX idx_evidence_bundles_case ON evidence_bundles(case_id);
CREATE INDEX idx_evidence_bundles_creator ON evidence_bundles(created_by);

-- RLS Policies
ALTER TABLE evidence_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's evidence bundles"
  ON evidence_bundles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.organization_id = (
          SELECT organization_id FROM profiles WHERE id = evidence_bundles.created_by
        )
    )
  );
```

#### 3. Supabase Storage Bucket Configuration

**Bucket:** `evidence-bundles`

- **Public:** No (requires authentication)
- **File Size Limit:** 50 MB
- **Allowed MIME Types:** `application/pdf`, `application/zip`
- **RLS:** Enabled (users can only access bundles from their organization)

**RLS Policy:**

```sql
CREATE POLICY "Org members can read evidence bundles"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence-bundles'
    AND auth.uid() IN (
      SELECT p1.id FROM profiles p1
      WHERE p1.organization_id = (
        SELECT p2.organization_id FROM profiles p2
        WHERE p2.id = (storage.foldername(name))[1]::uuid
      )
    )
  );
```

#### 4. Server-Side PDF Generation

**Dependencies:** 
- `pdf-lib` (server-side PDF generation)
- `@react-pdf/renderer` (alternative: React-based PDFs)

**Key Features:**
- Deterministic output (same input = same PDF)
- Timestamping and digital signatures
- Watermarking (e.g., "OFFICIAL COPY - DO NOT REDISTRIBUTE")
- Metadata embedding (author, creation date, tool version)

#### 5. Access Tracking

Every access to a signed URL should be logged:

```typescript
export async function trackBundleAccess(bundleId: string) {
  const supabase = await createClient()
  
  await supabase.rpc('increment_bundle_access', {
    bundle_id: bundleId
  })
  
  await logAuditEvent({
    action: 'evidence_bundle_accessed',
    resource_type: 'evidence_bundle',
    resource_id: bundleId,
  })
}
```

### Benefits of Server-Side Architecture

1. **Immutability**: Files stored in Supabase Storage can't be modified
2. **Auditability**: Complete audit trail of creation and access
3. **Integrity**: Checksums prove file hasn't been tampered with
4. **Compliance**: Meets legal/regulatory requirements for evidence handling
5. **Security**: Server-side generation prevents data leakage
6. **Performance**: Offloads heavy PDF generation from client
7. **Consistency**: Deterministic output ensures reproducibility

## Migration Path

### Phase 1: Parallel Implementation (Low Risk)

1. Keep existing client-side bundles for backward compatibility
2. Add new server-side bundle endpoint (`/api/evidence-bundles/generate`)
3. Update UI to offer both options (client vs server)
4. Monitor adoption and performance

### Phase 2: Migration (Medium Risk)

1. Migrate existing bundles to new storage (optional, may skip)
2. Update all UI components to use server-side generation
3. Add feature flag to toggle between implementations
4. Run A/B test to validate functionality

### Phase 3: Deprecation (High Risk)

1. Remove client-side generation code
2. Update documentation
3. Notify users of changes (if applicable)
4. Archive old bundles (if needed)

## Effort Estimation

- **Server Action Implementation**: 2-3 days
- **Database Migration**: 1 day
- **Storage Configuration**: 1 day
- **PDF Generation Library Setup**: 2-3 days
- **UI Updates**: 1-2 days
- **Testing & QA**: 2-3 days
- **Documentation**: 1 day

**Total**: 10-14 days (2-3 sprints)

## Priority Assessment

**Current Priority:** Medium (not a blocker for MVP)

**Triggers for High Priority:**
- Customer requires compliance certification
- Legal department flags evidence handling concerns
- Procurement process requires audit trail documentation
- Regulatory body requests evidence integrity proof

## Alternatives Considered

### 1. Hybrid Approach
- Client-side generation for small bundles (<5 MB)
- Server-side generation for large bundles (>5 MB)
- **Pros**: Balances performance and compliance
- **Cons**: Increased complexity, harder to maintain

### 2. Third-Party Service
- Use service like DocRaptor, PDF.co, or Anvil
- **Pros**: Fully managed, no infrastructure
- **Cons**: Cost, vendor lock-in, data privacy concerns

### 3. Queue-Based Generation
- User requests bundle → job queued → email sent when ready
- **Pros**: Better for large bundles, no timeout issues
- **Cons**: More complex architecture, delayed gratification

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [NIST Guidelines for Digital Evidence](https://www.nist.gov/itl/ssd/software-quality-group/digital-evidence)
- [ISO/IEC 27037:2012 - Digital Evidence Guidelines](https://www.iso.org/standard/44381.html)

## Status

- **Documented**: January 30, 2026
- **Assigned**: TBD
- **Target Date**: TBD (pending prioritization)
- **Dependencies**: None (can be implemented independently)

---

**Note**: This architecture is required for **procurement-grade/compliance-grade** evidence handling. The current client-side implementation is adequate for **internal use** and **non-critical workflows**.
