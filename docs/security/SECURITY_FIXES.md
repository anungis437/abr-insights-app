# Security Audit Fixes - January 28, 2026

## Critical Security Issues Fixed ✅

### 1. **Secrets Removed from Repository** ⚠️ **CRITICAL**

**Files Changed:**

- `.env.test` - Removed hardcoded Supabase keys, replaced with placeholders
- `scripts/create-users-properly.ts` - Now loads from environment variables

**Action Required:**

```bash
# IMMEDIATELY rotate your Supabase keys:
# 1. Go to Supabase Dashboard → Settings → API
# 2. Generate new anon key and service role key
# 3. Update .env.local with new keys
# 4. NEVER commit .env.local (already in .gitignore)
```

**Git History:** If this repo was ever pushed to a remote, consider the old keys compromised. The keys in the commit history should be rotated.

---

### 2. **SSO Callback RLS Fixed** ✅

**Files Changed:**

- `app/api/auth/saml/callback/route.ts`
- `app/api/auth/azure/callback/route.ts`

**Fix:** Now uses `createAdminClient()` for organization and SSO provider lookups during callback (before user is authenticated). This bypasses RLS appropriately for the SSO flow.

**Security Note:** SAML relay state is still not cryptographically signed. Consider implementing signed/encrypted relay state for production.

---

### 3. **Build Failure Fixed** ✅

**File Changed:** `app/cases/[id]/page.tsx`

**Fix:** Removed duplicate closing brace that was causing syntax error. Build now proceeds past this error.

**Remaining Issue:** Build still fails due to EISDIR error (known issue with exFAT filesystem). Use Docker build as documented.

---

## High-Priority Engineering Fixes ✅

### 4. **Webhook Idempotency Implemented** ✅

**Files Created/Changed:**

- `supabase/migrations/20260128000007_stripe_webhook_idempotency.sql` - New table
- `app/api/webhooks/stripe/route.ts` - Added idempotency checks

**How it Works:**

1. Check if `event.id` already exists in `stripe_webhook_events` table
2. If exists, skip processing and return success
3. If new, process event and insert `event.id` into table

**Prevents:** Double-processing of webhook events on Stripe retries

---

### 5. **Rate Limiting Documented** ⚠️

**File Changed:** `lib/security/rateLimit.ts`

**Added Warning:**

```typescript
/**
 * ⚠️ PRODUCTION WARNING ⚠️
 * Current implementation uses in-memory storage (Map) which is NOT production-safe
 *
 * REQUIRED FOR PRODUCTION:
 * - Migrate to Redis (recommended: Upstash Redis for serverless)
 * - Alternative: Azure Cache for Redis
 */
```

**Action Required Before Production:**

- Implement Redis-based rate limiting
- Recommended: Upstash Redis (serverless-native)
- Alternative: Azure Cache for Redis

---

## Repository Hygiene Fixes ✅

### 6. **.pnpm-cache Removed** ✅

**Actions:**

- Deleted `.pnpm-cache/` directory (hundreds of MB)
- Added `/.pnpm-cache` to `.gitignore`
- Added `build.log` and `migration-output.log` to `.gitignore`

---

### 7. **Static Web App Config Fixed** ✅

**File Changed:** `staticwebapp.config.json`

**Fix:** Removed duplicate `"platform"` key. Now only specifies `node:20` (was conflicting with `node:18`)

---

### 8. **Supabase Client Error Handling Improved** ✅

**File Changed:** `lib/supabase/client.ts`

**Fix:**

- Now throws descriptive error in browser context if env vars missing
- Only returns `null` during build (with warning logged)
- Better error message guides developers to fix `.env.local`

---

### 9. **Migration Hygiene Cleanup** ✅

**Files Removed:**

- All `SKIP_*.sql` files (7 files)
- `cleanup_incomplete_tables.sql`
- `manual_missing_tables.sql`
- `ALL_MIGRATIONS.sql`

**Result:** Cleaner migration history with only active, timestamped migrations

---

## Summary

**Total Fixes:** 9 critical and high-priority issues
**Files Changed:** 12 files
**Files Removed:** 11 files
**New Migration:** 1 (webhook idempotency)

### Immediate Actions Required

1. **Rotate Supabase Keys** (CRITICAL)

   ```bash
   # Go to Supabase Dashboard → Settings → API
   # Generate new keys and update .env.local
   ```

2. **Test SSO Flows**

   ```bash
   # Verify SAML and Azure AD callbacks work with admin client
   ```

3. **Before Production Deploy:**
   - Implement Redis-based rate limiting
   - Add signed/encrypted relay state for SAML
   - Run migration: `20260128000007_stripe_webhook_idempotency.sql`

### What's Still Outstanding

**Known Issues Not Fixed (Out of Scope):**

- EISDIR build error (use Docker build as workaround)
- In-memory rate limiting (documented, requires Redis implementation)
- SAML relay state signing (security enhancement for production)

**Test Coverage:**

- Some tests are placeholder-ish (noted in assessment)
- Consider expanding integration test coverage

---

## Deployment Checklist

Before deploying to production:

- [ ] Rotate all Supabase keys
- [ ] Update .env.local with new keys (never commit!)
- [ ] Test SSO callbacks (SAML + Azure AD)
- [ ] Apply webhook idempotency migration
- [ ] Implement Redis rate limiting
- [ ] Test Stripe webhooks with idempotency
- [ ] Verify build works in Docker
- [ ] Review audit logs for unauthorized access

---

**Date:** January 28, 2026
**Commit:** [To be added after commit]
