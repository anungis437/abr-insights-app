-- Fix user_points RLS policies
-- Add INSERT and UPDATE policies for user_points table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS user_points_select ON user_points;
DROP POLICY IF EXISTS user_points_insert ON user_points;
DROP POLICY IF EXISTS user_points_update ON user_points;

-- Recreate SELECT policy (users can read their own points)
CREATE POLICY user_points_select ON user_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add INSERT policy (users can create their own points record)
CREATE POLICY user_points_insert ON user_points 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy (users can update their own points)
CREATE POLICY user_points_update ON user_points 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also ensure points_transactions has proper policies (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'points_transactions') THEN
    DROP POLICY IF EXISTS points_transactions_select ON points_transactions;
    DROP POLICY IF EXISTS points_transactions_insert ON points_transactions;

    CREATE POLICY points_transactions_select ON points_transactions 
      FOR SELECT 
      USING (auth.uid() = user_id);

    CREATE POLICY points_transactions_insert ON points_transactions 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
