-- Step 1: Check if users are soft-deleted
SELECT id, email, deleted_at, created_at
FROM auth.users 
WHERE email LIKE '%@abr-insights.com';

-- Step 2: Check for foreign key constraints blocking deletion
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name='users'
  AND ccu.table_schema='auth';

-- Step 3: If profiles table is blocking, temporarily drop the constraint
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 4: Delete identities first
DELETE FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@abr-insights.com'
);

-- Step 5: Delete users
DELETE FROM auth.users 
WHERE email LIKE '%@abr-insights.com';

-- Step 6: Verify deletion
SELECT COUNT(*) as remaining_count 
FROM auth.users 
WHERE email LIKE '%@abr-insights.com';

-- Step 7: Re-add the constraint if we dropped it
-- ALTER TABLE profiles 
-- ADD CONSTRAINT profiles_id_fkey 
-- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
