-- Add missing columns to user_points table for achievements tracking
-- The code expects: total_points, course_points, engagement_points, achievement_points, bonus_points

-- Add point category columns if they don't exist
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS total_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS course_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievement_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_points BIGINT DEFAULT 0;

-- Update total_points to be computed from existing total_points_earned
UPDATE user_points 
SET total_points = COALESCE(total_points_earned, 0)
WHERE total_points = 0 AND total_points_earned > 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id_unique ON user_points(user_id);
