# Quick Start Guide - ABR Insights App

## Critical Issues to Fix

### 1. Database Setup (REQUIRED - Causing 500 Auth Error)

The **500 Internal Server Error** during login is because database migrations haven't been applied yet.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: <https://supabase.com/dashboard>
2. Select your project: `YOUR-PROJECT-REF`
3. Navigate to **SQL Editor**
4. Run migrations in order:

**Essential Migrations (Must run first):**

```sql
-- Run these in order in the SQL Editor:
-- 1. supabase/migrations/001_initial_schema.sql
-- 2. supabase/migrations/014_add_role_to_profiles.sql
-- 3. supabase/migrations/015_profiles_rbac_policies.sql
-- 4. supabase/migrations/016_rbac_test_accounts.sql
```

**New ML Migrations (For ML features):**

```sql
-- Run these after the essential migrations:
-- 1. supabase/migrations/20250108000001_enable_pgvector.sql
-- 2. supabase/migrations/20250108000002_create_embeddings_tables.sql
-- 3. supabase/migrations/20250108000003_create_similarity_functions.sql
-- 4. supabase/migrations/20250108000004_create_outcome_prediction.sql
```

#### Option B: Using PowerShell Script

```powershell
# Set environment variables first
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key-here"

# Run migration script
npx tsx --env-file=.env.local scripts/apply-migrations.ts
```

### 2. Test User Credentials

After applying migration `016_rbac_test_accounts.sql`, use these credentials:

**All test users share password:** `TestPass123!`

| Role               | Email                           |
| ------------------ | ------------------------------- |
| Super Admin        | `super_admin@abr-insights.com`  |
| Compliance Officer | `compliance@abr-insights.com`   |
| Organization Admin | `orgadmin@abr-insights.com`     |
| Analyst            | `analyst@abr-insights.com`      |
| Investigator       | `investigator@abr-insights.com` |
| Educator           | `educator@abr-insights.com`     |
| Learner            | `learner@abr-insights.com`      |
| Viewer             | `viewer@abr-insights.com`       |
| Guest              | `guest@abr-insights.com`        |

### 3. Environment Variables Check

Verify your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For ML features:
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=your-deployment-name
```

### 4. Known Warnings (Non-Critical)

#### Missing PWA Icons

Create these files or disable PWA temporarily:

- `public/icons/icon-144x144.png`
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`

#### Service Worker Cache Error

This is due to missing icons. Will resolve after adding icons or disabling PWA.

#### Deprecated themeColor Warning

This is a Next.js 15 deprecation warning. Can be fixed later by moving `themeColor` from `metadata` to `viewport` export.

## Testing the ML Features

1. **Login** with `super_admin@abr-insights.com` / `TestPass123!`
2. **Navigate to** <http://localhost:3000/admin/ml>
3. **Verify** all 4 tabs load:
   - Embeddings Management
   - Semantic Search Test
   - Outcome Predictions
   - Analytics Dashboard

4. **Generate embeddings:**

   ```powershell
   npx tsx --env-file=.env.local scripts/generate-initial-embeddings.ts --type=all
   ```

## Troubleshooting

### Still Getting 500 Error?

- Check Supabase logs in dashboard
- Verify migrations applied successfully
- Check `auth.users` table exists
- Verify service role key is correct

### Can't See Test Users?

- Migration 016 must be applied
- Check if users exist: `SELECT * FROM auth.users LIMIT 5;`
- Check profiles table: `SELECT * FROM profiles LIMIT 5;`

### ML Features Not Working?

- Apply ML migrations (20250108000001-04)
- Verify pgvector extension: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Check Azure OpenAI credentials

## Next Steps

1. ✅ Apply database migrations (CRITICAL)
2. ✅ Test login with test users
3. ✅ Navigate to /admin/ml
4. ⏳ Generate initial embeddings
5. ⏳ Run comprehensive tests
6. ⏳ Code alignment validation
7. ⏳ Return to Phase 11

---

**Need Help?** Check:

- Supabase Dashboard Logs
- Browser Console (F12)
- Terminal output for Next.js errors
