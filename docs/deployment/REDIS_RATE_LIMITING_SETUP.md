# Redis Rate Limiting Setup Guide

## Production-Ready Rate Limiting

The in-memory rate limiting (`lib/security/rateLimit.ts`) is **not production-safe** for:
- ✗ Horizontal scaling (multiple instances)
- ✗ Serverless deployments (cold starts reset state)
- ✗ Azure Static Web Apps multi-node deployments

**Solution**: Redis-based rate limiting (`lib/security/redisRateLimit.ts`)

---

## Option 1: Upstash Redis (Recommended for Serverless)

### Why Upstash?
- ✅ HTTP-based API (no persistent connections)
- ✅ Serverless-friendly (works with Azure Static Web Apps)
- ✅ Global edge locations
- ✅ Free tier: 10,000 requests/day
- ✅ Pay-as-you-go pricing

### Setup Steps

1. **Create Upstash Account**
   ```bash
   # Visit https://upstash.com/
   # Sign up and create a new Redis database
   ```

2. **Install Upstash SDK**
   ```bash
   npm install @upstash/redis
   ```

3. **Add Environment Variables**
   Add to `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token-here
   ```

4. **Update API Routes**
   ```typescript
   // Before (in-memory)
   import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'

   export const POST = withRateLimit(
     RateLimitPresets.aiChat,
     guardedRoute(handler, { requireAuth: true })
   )

   // After (Redis)
   import { withRedisRateLimit } from '@/lib/security/redisRateLimit'
   import { RateLimitPresets } from '@/lib/security/rateLimitPresets'

   export const POST = withRedisRateLimit(
     guardedRoute(handler, { requireAuth: true }),
     RateLimitPresets.aiChat
   )
   ```

5. **Deploy**
   The system will automatically detect Upstash credentials and use Redis-based rate limiting.

---

## Option 2: Azure Cache for Redis

### Why Azure Cache?
- ✅ Native Azure integration
- ✅ VNet support for security
- ✅ High availability with clustering
- ✅ Suitable for VM/AKS deployments

### Setup Steps

1. **Create Azure Cache for Redis**
   ```bash
   az redis create \
     --name abr-insights-cache \
     --resource-group abr-insights-rg \
     --location canadacentral \
     --sku Basic \
     --vm-size c0
   ```

2. **Get Connection Info**
   ```bash
   az redis show \
     --name abr-insights-cache \
     --resource-group abr-insights-rg \
     --query "[hostName,sslPort,accessKeys.primaryKey]" \
     --output tsv
   ```

3. **Install Redis Client**
   ```bash
   npm install redis
   ```

4. **Add Environment Variables**
   Add to `.env.local`:
   ```env
   REDIS_URL=redis://your-cache.redis.cache.windows.net:6380
   REDIS_PASSWORD=your-primary-key
   ```

5. **Update API Routes** (same as Upstash above)

---

## Migration Path

### Phase 1: Add Redis (No Breaking Changes)
```typescript
// Keep both in parallel during testing
import { withRateLimit } from '@/lib/security/rateLimit' // Old
import { withRedisRateLimit } from '@/lib/security/redisRateLimit' // New

// Test with Redis first
export const POST = process.env.UPSTASH_REDIS_REST_URL
  ? withRedisRateLimit(handler, config)
  : withRateLimit(config, handler)
```

### Phase 2: Gradual Rollout
Migrate routes in order of importance:
1. **AI endpoints** (highest cost)
   - `/api/ai/chat`
   - `/api/ai/coach`
   - `/api/embeddings/*`

2. **Auth endpoints** (security-critical)
   - `/api/auth/*`
   - `/api/webhooks/*`

3. **Public endpoints** (abuse-prone)
   - `/api/contact`
   - `/api/newsletter`

### Phase 3: Remove In-Memory
Once Redis is stable, remove `withRateLimit` and use only `withRedisRateLimit`.

---

## Monitoring

### Check Rate Limit Headers
```bash
curl -I https://abrinsights.ca/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected headers:
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 1706745600000
```

### Redis Metrics (Upstash Dashboard)
- Total requests
- Cache hit rate
- Latency (p50, p99)

### Azure Monitor (Azure Cache)
- Connected clients
- Operations per second
- Memory usage

---

## Cost Estimation

### Upstash Redis
- **Free tier**: 10,000 requests/day
- **Pay-as-you-go**: $0.20 per 100,000 requests
- **Example**: 1M requests/month = $2/month

### Azure Cache for Redis
- **Basic C0**: $16.06/month (250 MB)
- **Standard C1**: $62.78/month (1 GB, SLA)
- **Premium P1**: $386.40/month (6 GB, clustering)

**Recommendation**: Start with Upstash free tier, upgrade if needed.

---

## Troubleshooting

### Redis Not Connecting
```typescript
// Check logs
import { logger } from '@/lib/utils/production-logger'

// Logs will show:
// [INFO] Redis rate limiting initialized { type: 'upstash' }
// [WARN] Redis not configured - rate limiting disabled
// [ERROR] Failed to initialize Upstash Redis { error: ... }
```

### Rate Limiting Bypassed
If Redis fails, the system **fails open** (allows requests) to prevent outages.
Check logs for Redis connection errors.

### High Latency
- **Upstash**: Check edge location (should be nearest to users)
- **Azure Cache**: Ensure same region as Azure Static Web Apps

---

## Production Checklist

- [ ] Redis instance created (Upstash or Azure Cache)
- [ ] Environment variables added to Azure Static Web Apps configuration
- [ ] All critical endpoints migrated to `withRedisRateLimit`
- [ ] Rate limit headers verified in production
- [ ] Monitoring alerts configured (Redis down, high error rate)
- [ ] Load testing completed (simulate burst traffic)
- [ ] Fallback behavior tested (Redis down = requests allowed)

---

## Security Considerations

1. **Token Rotation**: Rotate Redis credentials every 90 days
2. **Network Security**: Use VNet (Azure Cache) or TLS (Upstash)
3. **Key Namespace**: Prefix all keys with `ratelimit:` to avoid collisions
4. **TTL**: Keys auto-expire after window period (no manual cleanup needed)

---

## Further Reading

- [Upstash Documentation](https://docs.upstash.com/)
- [Azure Cache for Redis Documentation](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
