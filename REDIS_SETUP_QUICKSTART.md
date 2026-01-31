# Redis Rate Limiting - Setup Instructions

## Quick Start (5 minutes)

### 1. Create Upstash Redis Account (Recommended)

Upstash is **free** for up to 10,000 requests/day and works perfectly with serverless deployments like Azure Static Web Apps.

1. Visit https://upstash.com/
2. Sign up for free account
3. Click "Create Database"
4. Choose a name (e.g., `abr-insights-rate-limit`)
5. Select region closest to your users
6. Click "Create"

### 2. Get Your Credentials

After creating the database:

1. Click on your database name
2. Scroll to "REST API" section
3. Copy the `UPSTASH_REDIS_REST_URL`
4. Copy the `UPSTASH_REDIS_REST_TOKEN`

### 3. Add to Environment Variables

Add these to your `.env.local` file:

```env
# Upstash Redis (for production-ready rate limiting)
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxE=
```

### 4. Test Locally

```bash
npm run dev
```

Visit any API endpoint (e.g., `/api/ai/chat`) and check the response headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - When the limit resets

### 5. Deploy to Production

For Azure Static Web Apps:

```bash
# Add environment variables
az staticwebapp appsettings set \
  --name abr-insights-app \
  --setting-names \
    UPSTASH_REDIS_REST_URL=$UPSTASH_URL \
    UPSTASH_REDIS_REST_TOKEN=$UPSTASH_TOKEN
```

**That's it!** Your rate limiting is now production-ready and distributed across all instances.

---

## What Changed?

### Before (Development Only)
- ❌ In-memory rate limiting (not production-safe)
- ❌ Breaks across multiple instances
- ❌ Resets on serverless cold starts
- ❌ Not shared across Azure Static Web Apps nodes

### After (Production-Ready)
- ✅ Redis-based rate limiting (production-safe)
- ✅ Works across multiple instances
- ✅ Survives serverless cold starts
- ✅ Shared state across all nodes
- ✅ Fail-open strategy (if Redis down, requests still work)

---

## Migrated Endpoints

The following high-priority endpoints are now using Redis rate limiting:

- ✅ **AI Chat** (`/api/ai/chat`) - 20 requests/min per user + org limits
- ✅ **AI Coach** (`/api/ai/coach`) - 10 requests/min per user + org limits
- ✅ **Search Cases** (`/api/embeddings/search-cases`) - 30 requests/min per user
- ✅ **Contact Form** (`/api/contact`) - 5 requests/hour per IP

---

## Monitoring

### Check Rate Limits

```bash
# Make a request and check headers
curl -I https://abrinsights.ca/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected headers:
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 1706745600000
```

### Upstash Dashboard

Visit https://console.upstash.com/ to see:
- Total requests
- Cache hit rate
- Latency (p50, p99)
- Memory usage

---

## Cost

| Tier | Requests/Day | Cost |
|------|--------------|------|
| **Free** | 10,000 | $0 |
| **Pay-as-you-go** | 100,000 | $0.20 |
| **Pay-as-you-go** | 1,000,000 | $2.00 |

**Example**: With 500 daily active users × 20 requests/day = 10,000 requests/day = **$0/month**

---

## Troubleshooting

### "Rate limiting not working"
- Check environment variables are set correctly
- Restart your development server
- Check Upstash dashboard for connection errors

### "429 Too Many Requests"
- This is expected when limits are exceeded
- Check `Retry-After` header for when to retry
- Adjust limits in `lib/security/rateLimitPresets.ts` if needed

### "Redis connection failed"
- The system will "fail open" and allow requests
- Check logs for connection errors
- Verify Upstash credentials are correct

---

## Next Steps

1. **Monitor Usage**: Watch Upstash dashboard for first week
2. **Adjust Limits**: Tune limits based on actual usage patterns
3. **Migrate More Routes**: See [PRODUCTION_READINESS_FINAL.md](PRODUCTION_READINESS_FINAL.md) for remaining routes
4. **Set Up Alerts**: Configure Upstash alerts for high usage

---

## Alternative: Azure Cache for Redis

If you prefer Azure:

```bash
# Create Azure Cache
az redis create \
  --name abr-insights-cache \
  --resource-group abr-insights-rg \
  --location canadacentral \
  --sku Basic \
  --vm-size c0

# Get connection details
az redis show --name abr-insights-cache --resource-group abr-insights-rg

# Add to .env.local
REDIS_URL=redis://your-cache.redis.cache.windows.net:6380
REDIS_PASSWORD=your-primary-key
```

**Cost**: Starting at $16.06/month (Basic C0, 250 MB)

---

## Support

- **Upstash Docs**: https://docs.upstash.com/
- **Rate Limiting Details**: [REDIS_RATE_LIMITING_SETUP.md](REDIS_RATE_LIMITING_SETUP.md)
- **Production Checklist**: [PRODUCTION_READINESS_FINAL.md](PRODUCTION_READINESS_FINAL.md)
