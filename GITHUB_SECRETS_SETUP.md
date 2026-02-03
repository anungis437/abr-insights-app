# GitHub Secrets Configuration Guide

## Complete List of Required Secrets

Configure these at: https://github.com/anungis437/abr-insights-app/settings/secrets/actions

---

## ✅ CRITICAL - Azure Static Web Apps (Currently Working)

### 1. AZURE_STATIC_WEB_APPS_API_TOKEN_PURPLE_GROUND_03D2B380F
**Status**: ✅ Already configured (deployments are succeeding)
**Value**: `[Already set in GitHub]`

---

## ⚠️ REQUIRED - Supabase Configuration

### 2. NEXT_PUBLIC_SUPABASE_URL
**Purpose**: Public Supabase project URL  
**Current Value**: 
```
https://zdcmugkafbczvxcyofiz.supabase.co
```

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Purpose**: Public anonymous key for client-side access  
**Current Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTczMDksImV4cCI6MjA4Mzc3MzMwOX0.Q_oAL1mrscvxqTH86vcnHdDZFFm9y-Wckxsiv68-_ZM
```

### 4. SUPABASE_SERVICE_ROLE_KEY
**Purpose**: Server-side admin key (keep secret!)  
**Current Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5NzMwOSwiZXhwIjoyMDgzNzczMzA5fQ.sS8oTvZoRtnGUi5TUZshHKtM7fxkTLbDAHEu14iul_4
```

---

## ⚠️ REQUIRED - Stripe Configuration

### 5. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
**Purpose**: Public Stripe key for client-side  
**Current Value**: 
```
pk_test_51S9nzK3z6DvwO4gqo089V50ZJJKkJ5CoMAk0OMQMtx0KF4nAb7fHOvOIo7BSyOTzPasOgYhvUnYMC2W1mjQb4pGC00oSOb01yL
```

### 6. STRIPE_SECRET_KEY
**Purpose**: Server-side Stripe secret key  
**Current Value**: 
```
sk_test_51S9nzK3z6DvwO4gqNZR4UlxDbin5uTnQMy9IMjxV09eQqyafOmZpXz7rL1BWxsxQJvevqNl0SkGnSHPQHYkKoBG100ixoX1O0t
```

### 7. STRIPE_WEBHOOK_SECRET
**Purpose**: Webhook signature verification  
**Current Value**: 
```
whsec_6ed2b62c7c702347ef54d9d9e7ab1e797ec89f873df714483119e92224cdcde3
```

---

## 📍 REQUIRED - Application URLs

### 8. NEXT_PUBLIC_APP_URL
**Purpose**: Public URL for your deployed app  
**For Azure Static Web Apps**: 
```
https://purple-ground-03d2b380f.5.azurestaticapps.net
```
**For Azure Container Apps** (once configured):
```
https://abr-insights-app.<region>.azurecontainerapps.io
```
**For Custom Domain**:
```
https://abrinsights.ca
```

---

## 🔧 OPTIONAL - Azure OpenAI (For AI Features)

### 9. AZURE_OPENAI_ENDPOINT
**Purpose**: Azure OpenAI resource endpoint  
**Current Value**: 
```
https://your-resource.openai.azure.com
```
**Note**: Update with your actual Azure OpenAI endpoint

### 10. AZURE_OPENAI_API_KEY
**Purpose**: Azure OpenAI API key  
**Current Value**: 
```
your-api-key
```
**Note**: Get from Azure Portal → Your OpenAI Resource → Keys and Endpoint

### 11. AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT
**Purpose**: Embeddings model deployment name  
**Current Value**: 
```
text-embedding-ada-002
```

---

## 🚀 OPTIONAL - Azure Container Apps Deployment

Only needed if you want to use Azure Container Apps instead of Static Web Apps.

### 12. AZURE_CREDENTIALS
**Purpose**: Azure service principal credentials for authentication  
**How to get**:
```bash
az ad sp create-for-rbac \
  --name "abr-insights-github-actions" \
  --role contributor \
  --scopes /subscriptions/5d819f33-d16f-429c-a3c0-5b0e94740ba3/resourceGroups/abr-insights-rg \
  --sdk-auth
```
**Format**: JSON object with `clientId`, `clientSecret`, `subscriptionId`, `tenantId`

### 13. ACR_USERNAME
**Purpose**: Azure Container Registry username  
**How to get**:
```bash
az acr credential show --name abrinsightsacr --query username -o tsv
```

### 14. ACR_PASSWORD
**Purpose**: Azure Container Registry password  
**How to get**:
```bash
az acr credential show --name abrinsightsacr --query passwords[0].value -o tsv
```

---

## 🧪 OPTIONAL - Testing Environment

### 15. TEST_SUPABASE_URL
**Purpose**: Separate Supabase project for testing  
**Note**: Only if you have a dedicated test environment

### 16. TEST_SUPABASE_ANON_KEY
**Purpose**: Test environment anon key

### 17. TEST_SUPABASE_SERVICE_ROLE_KEY
**Purpose**: Test environment service role key

---

## 📊 Summary by Priority

### CRITICAL (Required for Azure Static Web Apps - Current Deployment)
- ✅ `AZURE_STATIC_WEB_APPS_API_TOKEN_PURPLE_GROUND_03D2B380F` (already set)
- ⚠️ `NEXT_PUBLIC_SUPABASE_URL`
- ⚠️ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ⚠️ `STRIPE_SECRET_KEY`
- ⚠️ `STRIPE_WEBHOOK_SECRET`
- ⚠️ `NEXT_PUBLIC_APP_URL`

### HIGH PRIORITY (For Azure Container Apps)
- `AZURE_CREDENTIALS`
- `ACR_USERNAME`
- `ACR_PASSWORD`

### MEDIUM PRIORITY (For AI Features)
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT`

### LOW PRIORITY (For Testing)
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_ROLE_KEY`

---

## 🔨 Quick Setup Commands

### Using GitHub CLI (Recommended)
```bash
# Set Supabase secrets
gh secret set NEXT_PUBLIC_SUPABASE_URL -b"https://zdcmugkafbczvxcyofiz.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY -b"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTczMDksImV4cCI6MjA4Mzc3MzMwOX0.Q_oAL1mrscvxqTH86vcnHdDZFFm9y-Wckxsiv68-_ZM"
gh secret set SUPABASE_SERVICE_ROLE_KEY -b"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5NzMwOSwiZXhwIjoyMDgzNzczMzA5fQ.sS8oTvZoRtnGUi5TUZshHKtM7fxkTLbDAHEu14iul_4"

# Set Stripe secrets
gh secret set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY -b"pk_test_51S9nzK3z6DvwO4gqo089V50ZJJKkJ5CoMAk0OMQMtx0KF4nAb7fHOvOIo7BSyOTzPasOgYhvUnYMC2W1mjQb4pGC00oSOb01yL"
gh secret set STRIPE_SECRET_KEY -b"sk_test_51S9nzK3z6DvwO4gqNZR4UlxDbin5uTnQMy9IMjxV09eQqyafOmZpXz7rL1BWxsxQJvevqNl0SkGnSHPQHYkKoBG100ixoX1O0t"
gh secret set STRIPE_WEBHOOK_SECRET -b"whsec_6ed2b62c7c702347ef54d9d9e7ab1e797ec89f873df714483119e92224cdcde3"

# Set App URL
gh secret set NEXT_PUBLIC_APP_URL -b"https://purple-ground-03d2b380f.5.azurestaticapps.net"
```

### Manual Setup via GitHub UI
1. Go to: https://github.com/anungis437/abr-insights-app/settings/secrets/actions
2. Click "New repository secret"
3. Enter name and value for each secret
4. Click "Add secret"

---

## ✅ Verification

After setting secrets, trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger deployment with new secrets"
git push origin main
```

Check deployment status:
```bash
gh run watch
```

---

## 🔒 Security Notes

1. **Never commit secrets to git** - All these values should only exist in:
   - GitHub Secrets (for CI/CD)
   - Local `.env.local` (for development, gitignored)
   - Azure Key Vault or similar (for production)

2. **Rotate keys regularly** - Especially service role keys and API keys

3. **Use test/dev keys** - Notice all Stripe keys are `test` mode keys

4. **Monitor access** - Azure Portal and Supabase dashboard show API usage

---

## 📝 Next Steps After Configuration

1. ✅ Configure all CRITICAL secrets
2. 🔄 Push code to trigger new deployment
3. 🧪 Test login at deployed URL
4. ✅ Verify ServiceWorker fix works
5. 🎯 Configure custom domain (optional)
6. 🚀 Set up Azure Container Apps (optional, for better performance)
