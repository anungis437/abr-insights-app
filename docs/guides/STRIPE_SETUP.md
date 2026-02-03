# Stripe Setup Guide

## Quick Setup (5 minutes)

### 1. Get Your Stripe Keys

1. Go to <https://dashboard.stripe.com/test/apikeys>
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2. Add to .env.local

Open `.env.local` and uncomment/update these lines:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 3. Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
pnpm run dev
```

### 4. Test Payment Features

- Go to **/pricing** to see subscription plans
- Try enrolling in a paid course
- Use Stripe test card: `4242 4242 4242 4242`

---

## Optional: Webhook Setup

For local testing of webhooks:

### 1. Install Stripe CLI

```powershell
winget install stripe.stripe-cli
```

### 2. Login to Stripe

```powershell
stripe login
```

### 3. Forward webhooks to local server

```powershell
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

### 4. Copy webhook secret

The CLI will display a webhook signing secret (starts with `whsec_`)

Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

---

## Test Cards

Use these test cards in your app:

| Card Number         | Description        |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Success            |
| 4000 0000 0000 0002 | Decline            |
| 4000 0000 0000 3220 | 3D Secure required |

- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

## Creating Products & Prices

### Via Dashboard

1. Go to <https://dashboard.stripe.com/test/products>
2. Click "Add product"
3. Name it (e.g., "Professional Plan")
4. Set recurring price (e.g., $29.99/month)
5. Copy the Price ID (starts with `price_`)

### Add to .env.local

```env
STRIPE_PRICE_ID_PROFESSIONAL=price_YOUR_ID
STRIPE_PRICE_ID_ENTERPRISE=price_YOUR_ID
```

---

## Subscription Tiers

Recommended setup:

| Tier         | Price     | Price ID Variable            |
| ------------ | --------- | ---------------------------- |
| Free         | $0        | STRIPE_PRICE_ID_FREE         |
| Professional | $29.99/mo | STRIPE_PRICE_ID_PROFESSIONAL |
| Enterprise   | $99.99/mo | STRIPE_PRICE_ID_ENTERPRISE   |

---

## Testing Subscription Flow

1. **Create Product** in Stripe Dashboard
2. **Copy Price ID** to .env.local
3. **Restart server**
4. **Go to /pricing**
5. **Click Subscribe**
6. **Use test card** 4242 4242 4242 4242
7. **Check Dashboard** to see subscription

---

## Troubleshooting

### "Stripe is not configured"

- Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart dev server after adding keys

### "Invalid API key"

- Make sure you're using **test mode** keys (`pk_test_` and `sk_test_`)
- Don't use live keys in development

### Webhook not receiving events

- Check Stripe CLI is running: `stripe listen`
- Verify webhook secret in `.env.local`
- Check console for errors

---

## Production Setup

When deploying to production:

1. Switch to **live mode** in Stripe Dashboard
2. Get **live keys** (start with `pk_live_` and `sk_live_`)
3. Update production environment variables
4. Configure **live webhook endpoint** in Stripe Dashboard
5. Test with real card (will charge real money!)

---

## Useful Stripe Dashboard Links

- **API Keys**: <https://dashboard.stripe.com/test/apikeys>
- **Products**: <https://dashboard.stripe.com/test/products>
- **Subscriptions**: <https://dashboard.stripe.com/test/subscriptions>
- **Webhooks**: <https://dashboard.stripe.com/test/webhooks>
- **Customers**: <https://dashboard.stripe.com/test/customers>
- **Payments**: <https://dashboard.stripe.com/test/payments>

---

**✅ That's it! You're ready to accept payments.**

For more details, see the [Stripe Documentation](https://stripe.com/docs).
