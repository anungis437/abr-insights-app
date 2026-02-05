# Key Rotation Runbook

## Overview

This runbook provides step-by-step procedures for rotating security keys and credentials in the ABR Insights application. Regular key rotation is a security best practice and may be required for compliance (SOC2, ISO27001).

## Rotation Schedule

| Credential Type           | Rotation Frequency         | Last Rotated               | Next Due         |
| ------------------------- | -------------------------- | -------------------------- | ---------------- |
| Supabase Service Role Key | 90 days                    | [Track in secrets manager] | [Auto-calculate] |
| NextAuth Secret           | 90 days                    | [Track in secrets manager] | [Auto-calculate] |
| Redis/Upstash Token       | 90 days                    | [Track in secrets manager] | [Auto-calculate] |
| Azure OpenAI API Key      | 90 days                    | [Track in secrets manager] | [Auto-calculate] |
| Stripe API Keys           | 90 days (or on compromise) | [Track in secrets manager] | [Auto-calculate] |
| JWT Signing Keys          | 180 days                   | [Track in secrets manager] | [Auto-calculate] |

## Pre-Rotation Checklist

- [ ] Review current key inventory
- [ ] Verify backup access to all services
- [ ] Schedule during low-traffic window (if possible)
- [ ] Notify team of planned rotation
- [ ] Have rollback plan ready
- [ ] Test procedure in staging first

## General Rotation Process

1. **Generate new key** in the service (don't delete old one yet)
2. **Update environment variables** with new key
3. **Deploy application** with new key
4. **Verify** application works with new key
5. **Delete old key** after 24-48 hour grace period
6. **Document** rotation in tracking system

## Specific Procedures

### 1. Rotating Supabase Service Role Key

**Impact**: High - affects all database operations  
**Downtime**: None if done correctly  
**Estimated time**: 15 minutes

**Prerequisites:**

- Access to Supabase dashboard
- Access to Azure Portal or deployment system
- Staging environment to test

**Steps:**

1. **Generate new service role key in Supabase**

   ```bash
   # Navigate to: Supabase Dashboard → Project Settings → API
   # Copy the new service_role key (do NOT delete old one yet)
   ```

2. **Update staging environment first**

   ```bash
   # Azure Container Apps
   az containerapp secret set \
     --name abr-insights-staging \
     --resource-group rg-abr-staging \
     --secrets supabase-service-role-key="<NEW_KEY>"

   # Update environment variable to use new secret
   az containerapp update \
     --name abr-insights-staging \
     --resource-group rg-abr-staging \
     --set-env-vars SUPABASE_SERVICE_ROLE_KEY=secretref:supabase-service-role-key
   ```

3. **Test staging thoroughly**

   ```bash
   # Run health checks
   curl https://staging.abrinsights.ca/api/readyz | jq '.checks[] | select(.name == "database")'

   # Run release acceptance gate
   export BASE_URL=https://staging.abrinsights.ca
   ./scripts/release-acceptance.sh

   # Test key database operations
   # - User login
   # - Data fetch
   # - Data write
   # - Audit log write
   ```

4. **If staging tests pass, update production**

   ```bash
   # Azure Container Apps Production
   az containerapp secret set \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --secrets supabase-service-role-key="<NEW_KEY>"

   az containerapp update \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --set-env-vars SUPABASE_SERVICE_ROLE_KEY=secretref:supabase-service-role-key
   ```

5. **Verify production**

   ```bash
   # Check health
   curl https://abrinsights.ca/api/readyz | jq '.'

   # Monitor Application Insights for errors
   # Watch for 5-10 minutes
   ```

6. **After 24-48 hours, revoke old key**
   - Go to Supabase Dashboard → Project Settings → API
   - Regenerate service role key one more time (this invalidates the old one)
   - Keep note of rotation date

**Rollback:**
If issues occur, update environment variable back to old key and restart app.

---

### 2. Rotating NextAuth Secret

**Impact**: High - invalidates all existing sessions  
**Downtime**: None, but users will be logged out  
**Estimated time**: 10 minutes

**Warning**: Rotating this key will log out all users. Plan for off-hours.

**Steps:**

1. **Generate new secret**

   ```bash
   # Generate 32+ character random string
   openssl rand -base64 32
   ```

2. **Update environment variable**

   ```bash
   # Staging first
   az containerapp secret set \
     --name abr-insights-staging \
     --resource-group rg-abr-staging \
     --secrets nextauth-secret="<NEW_SECRET>"

   # Test staging
   # Verify login/logout works
   ```

3. **Schedule production rotation (communicate to users)**
   - Send notification: "You will be logged out during maintenance window"
   - Perform rotation during low-traffic period

4. **Update production**

   ```bash
   az containerapp secret set \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --secrets nextauth-secret="<NEW_SECRET>"
   ```

5. **Verify**
   - Test login
   - Test logout
   - Monitor for authentication errors

**Rollback:**
Restore old secret if critical issues occur (users will need to log in again).

---

### 3. Rotating Redis/Upstash Token

**Impact**: Medium - affects rate limiting  
**Downtime**: Brief (rate limiting may fall back to in-memory)  
**Estimated time**: 10 minutes

**Steps:**

1. **Generate new token in Upstash**
   - Go to Upstash Dashboard → Database → REST API
   - Regenerate token

2. **Update environment variables**

   ```bash
   az containerapp secret set \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --secrets upstash-redis-rest-token="<NEW_TOKEN>"
   ```

3. **Verify**

   ```bash
   # Check readyz endpoint (includes Redis check)
   curl https://abrinsights.ca/api/readyz | jq '.checks[] | select(.name == "redis")'
   ```

4. **Delete old token** after verification

**Note**: If Redis becomes unavailable, rate limiting falls back to in-memory (acceptable for short period).

---

### 4. Rotating Azure OpenAI API Key

**Impact**: High - affects AI features  
**Downtime**: None if using key rotation feature  
**Estimated time**: 10 minutes

**Steps:**

1. **Azure OpenAI supports two keys**
   - Key 1 (primary)
   - Key 2 (secondary)
   - Strategy: Rotate one at a time

2. **Regenerate Key 2 in Azure Portal**
   - Go to Azure Portal → Azure OpenAI Service → Keys and Endpoint
   - Click "Regenerate Key 2"

3. **Update app to use Key 2**

   ```bash
   az containerapp secret set \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --secrets azure-openai-api-key="<KEY_2>"
   ```

4. **Verify AI features work**
   - Test chat endpoint
   - Test embeddings generation
   - Monitor AI request logs

5. **After 24 hours, regenerate Key 1** (now inactive)
   - This completes the rotation cycle
   - Next rotation: switch back to Key 1

---

### 5. Rotating Stripe API Keys

**Impact**: Critical - affects payment processing  
**Downtime**: None if done correctly  
**Estimated time**: 20 minutes

**Important**: Stripe recommends rolling API keys (both publishable and secret).

**Steps:**

1. **Create new restricted key in Stripe Dashboard**
   - Go to Stripe Dashboard → Developers → API Keys
   - Click "Create restricted key"
   - Grant same permissions as current key
   - Copy new secret key

2. **Update backend first (secret key)**

   ```bash
   # Staging
   az containerapp secret set \
     --name abr-insights-staging \
     --resource-group rg-abr-staging \
     --secrets stripe-secret-key="sk_test_<NEW_KEY>"

   # Test in staging
   # - Create test checkout
   # - Process test payment
   # - Verify webhook signature
   ```

3. **Update production backend**

   ```bash
   az containerapp secret set \
     --name abr-insights-prod \
     --resource-group rg-abr-prod \
     --secrets stripe-secret-key="sk_live_<NEW_KEY>"
   ```

4. **Update frontend (publishable key)**
   - Create new restricted publishable key in Stripe
   - Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable
   - Redeploy application

5. **Verify payment flow**
   - Test checkout
   - Test subscription creation
   - Test webhook delivery
   - Monitor Stripe dashboard for errors

6. **After 48 hours, delete old keys**
   - Go to Stripe Dashboard → Developers → API Keys
   - Roll the old restricted key (deactivates it)

**Rollback:**
Keep old keys active for 48 hours. If issues occur, roll back environment variables and redeploy.

---

## Emergency Rotation (Compromised Key)

If a key is compromised, follow this expedited process:

1. **Immediately rotate the key** (skip staging if emergency)
2. **Deploy to production immediately**
3. **Revoke old key immediately** (don't wait 24-48 hours)
4. **Monitor for unauthorized access** using the old key
5. **Investigate breach**:
   - How was key exposed?
   - What actions were taken with the key?
   - Review audit logs for unauthorized activity
6. **File incident report**
7. **Update security policies** to prevent recurrence

## Key Storage Best Practices

- **Never commit keys to source control**
- **Use Azure Key Vault or similar** for secret management
- **Rotate keys regularly** (90-day cycle)
- **Use different keys for dev/staging/production**
- **Document all rotations** in tracking system
- **Enable key expiration alerts** (Azure Key Vault)
- **Use managed identities** where possible (reduces key usage)

## Monitoring After Rotation

After rotating any key, monitor for 24-48 hours:

- [ ] Application Insights error rate
- [ ] Failed authentication attempts
- [ ] Audit logs for access denials
- [ ] Health check endpoints
- [ ] External service connectivity (Database, AI, Payments)

## Automation (Future Enhancement)

Consider automating key rotation with:

- **Azure Key Vault rotation policies**
- **GitHub Actions workflow** for rotation
- **Terraform/Bicep** for infrastructure as code
- **Automated testing** after rotation

## Rollback Procedures

| Key Type     | Rollback Steps                           | Risk        |
| ------------ | ---------------------------------------- | ----------- |
| Supabase     | Restore old key in env vars, restart app | Low         |
| NextAuth     | Restore old secret (users log in again)  | Medium      |
| Redis        | Restore old token                        | Low         |
| Azure OpenAI | Switch back to Key 1                     | Low         |
| Stripe       | Restore old keys, redeploy               | Medium-High |

## Post-Rotation Checklist

- [ ] All keys rotated successfully
- [ ] Application verified in staging
- [ ] Application verified in production
- [ ] Old keys deleted after grace period
- [ ] Rotation documented in tracking system
- [ ] Next rotation date scheduled
- [ ] Team notified of completion

## Related Documents

- [Incident Response Runbook](./incident-response.md)
- [Environment Variables Guide](../setup/environment-variables.md)
- [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)
