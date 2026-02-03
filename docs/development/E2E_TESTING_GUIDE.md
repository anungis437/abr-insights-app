# E2E Testing Guide - Stripe Checkout Flow

**Date:** January 30, 2026  
**Purpose:** Comprehensive testing of Stripe → Webhook → Entitlements → UI flow

---

## Prerequisites

✅ Stripe CLI installed and authenticated  
✅ Database schema deployed (organization_subscriptions, seat_allocations)  
✅ Entitlements service implemented  
✅ UI components migrated  
✅ Stripe webhook endpoint ready

---

## Test Environment Setup

### 1. Verify Stripe Configuration

Check `.env.local` has these keys:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### 2. Update Webhook Secret for Local Testing

When you start Stripe CLI listener, it will provide a webhook signing secret. Update `.env.local`:

```bash
# Terminal 1: Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output will show:
# > Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

Copy the `whsec_xxxxx` value and update `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 3. Start Development Server

```bash
# Terminal 2: Start Next.js dev server
npm run dev
```

---

## Test Execution Steps

### Step 1: Verify Current State (FREE tier)

1. Navigate to http://localhost:3000/test-checkout
2. Confirm current entitlements show:
   - Tier: FREE
   - AI Assistant: ❌ No
   - AI Coach: ❌ No
   - Export Capabilities: ❌ No
   - Max Courses: 3

3. Try accessing restricted features:
   - http://localhost:3000/ai-assistant → Should redirect to /pricing
   - http://localhost:3000/admin/risk-heatmap → Export buttons disabled

### Step 2: Test Professional Upgrade

1. Click "Test Professional Checkout" button
2. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/26)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

3. Complete checkout

4. **Watch Terminal 1** for webhook events:

   ```
   2026-01-30 14:23:45   --> customer.subscription.created [evt_xxx]
   2026-01-30 14:23:46   --> checkout.session.completed [evt_xxx]
   2026-01-30 14:23:47   --> invoice.payment_succeeded [evt_xxx]
   ```

5. Check webhook processing logs in Terminal 2 for:
   ```
   [WEBHOOK] Event received: checkout.session.completed
   [WEBHOOK] Creating organization subscription...
   [WEBHOOK] Allocating seat to user...
   [WEBHOOK] Processing complete
   ```

### Step 3: Verify Database Updates

#### Check organization_subscriptions table:

```sql
SELECT
  id,
  organization_id,
  stripe_subscription_id,
  tier,
  status,
  seat_count,
  seats_used,
  current_period_end
FROM organization_subscriptions
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**

- tier: `PROFESSIONAL`
- status: `active`
- seat_count: `1`
- seats_used: `1`
- stripe_subscription_id: `sub_xxxxx`

#### Check seat_allocations table:

```sql
SELECT
  id,
  subscription_id,
  user_id,
  status,
  allocated_at
FROM seat_allocations
ORDER BY allocated_at DESC
LIMIT 1;
```

**Expected Result:**

- status: `active`
- user_id matches your test user

### Step 4: Verify Entitlements API

Test the entitlements endpoint:

```bash
# Get your auth token from browser localStorage
# Then make authenticated request:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/entitlements
```

**Expected Response:**

```json
{
  "tier": "PROFESSIONAL",
  "seatCount": 1,
  "seatsUsed": 1,
  "seatsAvailable": 0,
  "features": {
    "aiAssistantAccess": true,
    "aiCoachAccess": true,
    "advancedAnalytics": true,
    "exportCapabilities": true,
    "maxCoursesAuthored": 50,
    "maxStudentsPerCourse": 500,
    "maxOrganizationMembers": 1,
    "customBranding": false,
    "ssoEnabled": false,
    "apiAccess": false,
    "prioritySupport": false
  }
}
```

### Step 5: Verify UI Feature Unlocks

Refresh http://localhost:3000/test-checkout and verify:

- ✅ Tier shows: PROFESSIONAL
- ✅ AI Assistant: ✅ Yes
- ✅ AI Coach: ✅ Yes
- ✅ Export Capabilities: ✅ Yes
- ✅ Max Courses: 50

Test feature access:

1. **AI Assistant:** Navigate to /ai-assistant → Should load (no redirect)
2. **AI Coach:** Navigate to /ai-coach → Should load (no redirect)
3. **Export Buttons:** Go to /admin/risk-heatmap → CSV/PDF buttons enabled
4. **Pricing Page:** Go to /pricing → "Current Plan" badge on Professional tier

### Step 6: Test Course Creation Limits

1. Navigate to /instructor/dashboard
2. Verify header shows: "Courses: 0 / 50"
3. Click "Create New Course" → Should work (not disabled)

### Step 7: Test Organization Dashboard

1. Navigate to /org/dashboard
2. Verify seat display shows:
   - "1 / 1 seats used"
   - "No seats available" (amber text)

---

## Test Enterprise Upgrade (Optional)

Repeat steps 2-7 with Enterprise tier:

- Use "Test Enterprise Checkout" button
- Verify tier: ENTERPRISE
- Check unlimited features (-1 values)
- Verify SSO and custom branding enabled

---

## Edge Case Testing

### Test 1: Expired Subscription

```bash
# Trigger subscription cancellation
stripe trigger customer.subscription.deleted
```

Verify:

- Status changes to `canceled` in database
- Features revert to FREE tier
- UI shows upgrade prompts

### Test 2: Failed Payment

```bash
# Use test card that requires authentication
# Card: 4000 0025 0000 3155
```

Verify webhook handles `invoice.payment_failed`

### Test 3: Seat Limit Enforcement

For PROFESSIONAL tier (1 seat):

1. Create organization_subscriptions with seat_count=1, seats_used=1
2. Try adding another member
3. Should show error: "No seats available"

---

## Validation Checklist

- [ ] Stripe CLI webhook listener running
- [ ] Checkout session creates successfully
- [ ] Webhook events received (3 events minimum)
- [ ] organization_subscriptions record created
- [ ] seat_allocations record created
- [ ] GET /api/entitlements returns correct data
- [ ] Test page shows updated entitlements
- [ ] AI Assistant accessible (no redirect)
- [ ] AI Coach accessible (no redirect)
- [ ] Export buttons enabled
- [ ] Pricing page shows "Current Plan" badge
- [ ] Course creation limits display correctly
- [ ] Organization dashboard shows seat info

---

## Troubleshooting

### Webhook Not Firing

```bash
# Verify listener is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check webhook secret matches .env.local
echo $STRIPE_WEBHOOK_SECRET
```

### Database Record Not Created

- Check Terminal 2 logs for webhook errors
- Verify RLS policies allow insert
- Check admin client being used in webhook handler

### Entitlements Not Updating

- Refresh browser (entitlements cached)
- Check organization_subscriptions has correct tier
- Verify user's organization_id matches subscription

### Features Not Unlocking

- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage
- Check entitlements service TIER_CONFIG

---

## Success Criteria

✅ **Checkout Flow:** User can complete Stripe checkout  
✅ **Webhook Processing:** All 3 webhook events handled  
✅ **Database Updates:** organization_subscriptions and seat_allocations created  
✅ **API Response:** GET /api/entitlements returns correct tier  
✅ **Feature Unlocks:** AI features accessible, export enabled  
✅ **UI Updates:** All components show upgraded features  
✅ **Limits Display:** Course and seat limits accurate

---

## Next Steps After Successful Test

1. **Document Results:** Create test report with screenshots
2. **Staging Deployment:** Deploy to staging environment
3. **Smoke Test:** Run full test on staging
4. **Production Deployment:** Deploy after 24h staging validation
5. **Monitoring:** Set up Sentry alerts for webhook failures
6. **Customer Support:** Prepare upgrade documentation

---

## Quick Commands Reference

```bash
# Start webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# View recent events
stripe events list --limit 10

# Check subscription status
stripe subscriptions list --customer cus_xxxxx

# Cancel subscription (testing)
stripe subscriptions cancel sub_xxxxx
```

---

**Status:** Ready for execution  
**Estimated Time:** 30-45 minutes  
**Risk Level:** Low (test environment)
