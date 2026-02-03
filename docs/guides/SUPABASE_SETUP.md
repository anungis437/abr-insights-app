# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: ABR Insights
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., US East, Canada)
4. Click "Create new project"
5. Wait for project to be created (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)
   - **.\* key** (starts with `eyJhbGc...`) - Keep this secret!

## Step 3: Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Run each migration file in order:
   - Click "New Query"
   - Copy/paste content from `supabase/migrations/01_extensions_and_types.sql`
   - Click "Run"
   - Repeat for files 02 through 07

**Migration Order:**

1. `01_extensions_and_types.sql` - Extensions and custom types
2. `02_auth_and_users.sql` - Organizations and user profiles
3. `03_courses_and_lessons.sql` - Course structure
4. `04_cases_database.sql` - Case database with embeddings
5. `05_gamification.sql` - Achievements and leaderboard
6. `06_row_level_security.sql` - RLS policies
7. `07_functions_and_triggers.sql` - Database functions

## Step 5: Configure Authentication

### Email/Password Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)

### Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`

### Microsoft OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Click **Azure (Microsoft)**
3. Enable Azure provider
4. Add your Microsoft OAuth credentials:
   - Get credentials from [Azure Portal](https://portal.azure.com)
   - Register application
   - Add redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`

## Step 6: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic Link**

## Step 7: Set Up Storage (Optional)

1. Go to **Storage**
2. Create buckets:
   - `avatars` (public) - User profile pictures
   - `course-content` (public) - Course videos/images
   - `certificates` (private) - Generated certificates

## Step 8: Test the Connection

1. Restart your Next.js dev server:

```bash
npm run dev
```

2. Visit <http://localhost:3000/auth/signup>
3. Create a test account
4. Check Supabase dashboard → **Authentication** → **Users**
5. Verify user was created and profile entry exists in **Table Editor** → **profiles**

## Step 9: Seed Sample Data (Optional)

Run the seed script to populate with sample data:

```sql
-- In Supabase SQL Editor, run:

-- Sample Achievement
INSERT INTO achievements (name, description, badge_icon, badge_color, achievement_type, points_value)
VALUES
  ('First Course Complete', 'Completed your first course', '🎓', '#4F46E5', 'course_completion', 100),
  ('Quiz Master', 'Scored 100% on a quiz', '🏆', '#F59E0B', 'quiz_perfect', 50),
  ('7 Day Streak', 'Logged in for 7 consecutive days', '🔥', '#EF4444', 'streak', 150);

-- Sample Course
INSERT INTO courses (title, slug, description, difficulty_level, is_published)
VALUES
  ('Introduction to Anti-Racism', 'intro-to-anti-racism', 'Learn the fundamentals of anti-Black racism and how to identify it in the workplace', 'Beginner', true);
```

## Troubleshooting

### Connection Issues

- Verify `.env.local` values are correct
- Restart Next.js dev server after updating env vars
- Check Supabase project is not paused (free tier auto-pauses after 7 days inactivity)

### RLS Policy Errors

- Ensure all migrations ran successfully
- Check policies in **Authentication** → **Policies**
- Test with authenticated user, not anonymous

### Migration Errors

- Run migrations in order
- Check for syntax errors in SQL Editor
- Verify pgvector extension is enabled

## Next Steps

- ✅ Supabase connected
- 📝 Build API routes for auth operations
- 🎨 Connect auth forms to Supabase
- 📊 Implement course enrollment
- 🔍 Add case database search
- 🏆 Implement gamification features

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
