# 🚀 Quick Migration Guide

## Why Manual Migration is Required

Supabase has security restrictions that prevent:

- ❌ CLI from executing when there are policy conflicts
- ❌ REST API from executing DDL statements (CREATE TABLE)
- ❌ Direct PostgreSQL connections through connection pooler

**The ONLY reliable way is manual SQL paste in the dashboard.**

## ⚡ One-Command Solution

```powershell
.\run-migration.ps1
```

This script will:

1. ✅ Open Supabase SQL Editor in your browser
2. ✅ Show you the SQL to copy
3. ✅ Wait for you to paste and run it
4. ✅ Verify tables were created
5. ✅ Automatically run storage integration test

## 📝 Manual Steps (if script doesn't work)

### Step 1: Copy the SQL

Open `create_tables.sql` and copy everything (Ctrl+A, Ctrl+C)

### Step 2: Paste in Supabase

1. Go to: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new
2. Paste the SQL (Ctrl+V)
3. Click **"Run"** button (bottom right)

### Step 3: Verify Tables

```powershell
npx tsx --env-file=.env.local ingestion\src\debug\setup-tables.ts
```

Should see: `✅ All tables already exist!`

### Step 4: Test Storage

```powershell
npx tsx --env-file=.env.local ingestion\src\debug\test-storage-integration.ts
```

Should see: `✅ Stored 30 cases successfully`

## 🔍 What Gets Created

- **ingestion_jobs** - Tracks job execution and metrics
- **tribunal_cases_raw** - Stores classified cases (staging)
- **ingestion_errors** - Logs pipeline errors

## ✅ Success Criteria

After migration:

- ✅ 3 tables visible in Supabase Table Editor
- ✅ Setup script confirms tables exist
- ✅ Storage test creates 30 demo cases
- ✅ Supabase dashboard shows data in tribunal_cases_raw

## 🛠️ Troubleshooting

**"Table already exists" error?**

- That's OK! It means the migration partially worked
- Just run the verification: `npx tsx --env-file=.env.local ingestion\src\debug\setup-tables.ts`

**Still says tables missing?**

- Refresh Supabase dashboard
- Check you're in the correct project: nuywgvbkgdvngrysqdul
- Try running the SQL again

**Connection errors?**

- Ignore CLI connection errors - they don't affect manual SQL paste
- The dashboard SQL Editor has a direct connection
