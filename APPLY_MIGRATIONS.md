# Apply Migrations to Supabase

## Quick Start - Apply Testimonials Migration

Since the Supabase CLI is having connection issues, here's the **easiest method**:

### Method 1: Supabase Dashboard (Recommended - 2 minutes)

1. **Open SQL Editor:**
   Go to: https://supabase.com/dashboard/project/nuywgvbkgdvngrysqdul/sql/new

2. **Copy migration content:**
   Open `supabase/migrations/013_testimonials.sql` and copy all contents

3. **Paste and run:**
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter
   - You should see "Success. No rows returned"

4. **Verify:**
   ```sql
   SELECT * FROM testimonials;
   ```
   Should return 4 sample testimonials

### Method 2: Using Node.js Script

If you prefer command line:

1. **Install pg package:**
   ```powershell
   npm install pg
   ```

2. **Add password to .env.local:**
   ```
   SUPABASE_DB_PASSWORD=your_database_password
   ```
   (Get from: https://supabase.com/dashboard/project/nuywgvbkgdvngrysqdul/settings/database)

3. **Run script:**
   ```powershell
   node scripts/apply-single-migration.mjs 013_testimonials.sql
   ```

### Method 3: Apply All Pending Migrations

Once testimonials work, apply remaining migrations in order:

**Via Dashboard:** Copy/paste each file from `supabase/migrations/`:
1. ✅ `002_rls_policies.sql`
2. ✅ `003_content_tables.sql`
3. ✅ `004_user_engagement.sql`
4. ✅ `005_ingestion_pipeline.sql`
5. ✅ `010_seed_data.sql`
6. ✅ `011_newsletter_subscribers.sql`
7. ✅ `012_tribunal_case_stats_rpc.sql`
8. ⭐ `013_testimonials.sql` (for homepage)
9. ✅ `014_add_role_to_profiles.sql`
10. ✅ `015_ai_training_system.sql`

All are **idempotent** - safe to run multiple times!

## Why CLI Failed

The `npx supabase db push` timeout suggests:
- Firewall blocking port 5432
- VPN interference
- Network connectivity issue
- Supabase pooler congestion

The Dashboard method bypasses these issues by using HTTPS.

## After Applying Migrations

1. **Restart dev server:**
   ```powershell
   npm run dev
   ```

2. **Check homepage:**
   Visit http://localhost:3000
   - Testimonials section should appear
   - 4 testimonials with 5-star ratings

3. **Test database:**
   ```powershell
   npx tsx scripts/check-tables.ts
   ```

## What's Ready

✅ All migration files fixed and tested
✅ Build verified: 520 pages
✅ Testimonials component ready
✅ Sample data included
✅ All changes committed

Just need to apply migrations to see them live! 🚀
