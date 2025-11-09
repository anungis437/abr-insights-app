-- =====================================================
-- Migration: Upgrade Gamification Schema
-- Description: Migrate existing gamification tables (from 004) to comprehensive schema (009-011)
-- Created: 2025-01-16
-- =====================================================

-- ============================================================================
-- STEP 1: Create New Tables That Don't Exist Yet
-- ============================================================================

-- Achievement Categories (new table)
CREATE TABLE IF NOT EXISTS achievement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement Progress (new table)
CREATE TABLE IF NOT EXISTS achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    progress_percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN target_progress > 0 THEN LEAST(100, (current_progress * 100) / target_progress)
            ELSE 0 
        END
    ) STORED,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- User Streaks (new table)
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    total_active_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Sources (new table)
CREATE TABLE IF NOT EXISTS points_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    points_amount INTEGER NOT NULL,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    max_daily_occurrences INTEGER,
    max_total_occurrences INTEGER,
    requires_verification BOOLEAN DEFAULT FALSE,
    cooldown_minutes INTEGER,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Transactions (new table - will replace user_points transaction log)
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    points_amount INTEGER NOT NULL,
    balance_after BIGINT,
    source_type VARCHAR(100) NOT NULL,
    source_id UUID,
    points_source_id UUID REFERENCES points_sources(id),
    description TEXT,
    context_data JSONB,
    multiplier_applied DECIMAL(3,2) DEFAULT 1.0,
    created_by UUID REFERENCES profiles(id),
    is_admin_adjustment BOOLEAN DEFAULT FALSE,
    admin_note TEXT,
    is_reversed BOOLEAN DEFAULT FALSE,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards Catalog (new table)
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(50),
    points_cost INTEGER NOT NULL,
    original_price_cad DECIMAL(10,2),
    reward_type VARCHAR(100) NOT NULL,
    reward_config JSONB,
    delivery_method VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    max_per_user INTEGER,
    min_level INTEGER DEFAULT 0,
    required_achievements UUID[],
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    times_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- User Rewards (new table)
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards_catalog(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    redemption_code VARCHAR(100),
    delivery_status VARCHAR(100),
    delivery_details JSONB,
    fulfilled_at TIMESTAMPTZ,
    fulfilled_by UUID REFERENCES profiles(id),
    notes TEXT,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards (new table)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    leaderboard_type VARCHAR(100) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    time_period VARCHAR(50),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    prize_pool JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard Entries (new table)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rank INTEGER,
    score BIGINT NOT NULL,
    additional_metrics JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(leaderboard_id, user_id)
);

-- ============================================================================
-- STEP 2: Migrate Existing Achievements Table
-- ============================================================================

-- Add new columns to achievements (if they don't exist)
DO $$ 
BEGIN
    -- Add category_id (FK to achievement_categories)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='category_id') THEN
        ALTER TABLE achievements ADD COLUMN category_id UUID REFERENCES achievement_categories(id) ON DELETE SET NULL;
    END IF;

    -- Add tier columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='tier') THEN
        ALTER TABLE achievements ADD COLUMN tier VARCHAR(50) DEFAULT 'bronze';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='tier_level') THEN
        ALTER TABLE achievements ADD COLUMN tier_level INTEGER DEFAULT 1;
    END IF;

    -- Add requirement columns (rename/replace criteria)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='requirement_type') THEN
        ALTER TABLE achievements ADD COLUMN requirement_type VARCHAR(100);
        -- Migrate from type column
        UPDATE achievements SET requirement_type = type WHERE requirement_type IS NULL;
        ALTER TABLE achievements ALTER COLUMN requirement_type SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='requirement_config') THEN
        ALTER TABLE achievements ADD COLUMN requirement_config JSONB;
        -- Migrate from criteria column
        UPDATE achievements SET requirement_config = criteria WHERE requirement_config IS NULL;
        ALTER TABLE achievements ALTER COLUMN requirement_config SET NOT NULL;
        ALTER TABLE achievements ALTER COLUMN requirement_config SET DEFAULT '{}';
    END IF;

    -- Add unlocks columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='unlocks_content') THEN
        ALTER TABLE achievements ADD COLUMN unlocks_content BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='unlocked_content_ids') THEN
        ALTER TABLE achievements ADD COLUMN unlocked_content_ids JSONB;
    END IF;

    -- Add badge columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='badge_svg') THEN
        ALTER TABLE achievements ADD COLUMN badge_svg TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='badge_color') THEN
        ALTER TABLE achievements ADD COLUMN badge_color VARCHAR(50);
    END IF;

    -- Add Open Badges columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='open_badge_enabled') THEN
        ALTER TABLE achievements ADD COLUMN open_badge_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='open_badge_issuer') THEN
        ALTER TABLE achievements ADD COLUMN open_badge_issuer JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='open_badge_criteria') THEN
        ALTER TABLE achievements ADD COLUMN open_badge_criteria TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='open_badge_tags') THEN
        ALTER TABLE achievements ADD COLUMN open_badge_tags TEXT[];
    END IF;

    -- Add visibility columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='is_hidden') THEN
        ALTER TABLE achievements ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='available_from') THEN
        ALTER TABLE achievements ADD COLUMN available_from TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='available_until') THEN
        ALTER TABLE achievements ADD COLUMN available_until TIMESTAMPTZ;
    END IF;

    -- Add statistics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='times_awarded') THEN
        ALTER TABLE achievements ADD COLUMN times_awarded INTEGER DEFAULT 0;
        -- Populate from earned_count if it exists
        UPDATE achievements SET times_awarded = COALESCE(earned_count, 0) WHERE times_awarded = 0;
    END IF;

    -- Add creator tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='created_by') THEN
        ALTER TABLE achievements ADD COLUMN created_by UUID REFERENCES profiles(id);
    END IF;

    -- Rename name if length is wrong
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='achievements' AND column_name='name' 
        AND character_maximum_length < 200
    ) THEN
        ALTER TABLE achievements ALTER COLUMN name TYPE VARCHAR(200);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='achievements' AND column_name='slug' 
        AND character_maximum_length < 200
    ) THEN
        ALTER TABLE achievements ALTER COLUMN slug TYPE VARCHAR(200);
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Migrate Existing user_achievements Table
-- ============================================================================

DO $$ 
BEGIN
    -- Add progress tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='progress_percentage') THEN
        ALTER TABLE user_achievements ADD COLUMN progress_percentage INTEGER DEFAULT 100;
    END IF;

    -- Rename/add context columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='context_type') THEN
        ALTER TABLE user_achievements ADD COLUMN context_type VARCHAR(100);
        -- Migrate from earned_from_type
        UPDATE user_achievements SET context_type = earned_from_type WHERE context_type IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='context_id') THEN
        ALTER TABLE user_achievements ADD COLUMN context_id UUID;
        -- Migrate from earned_from_id
        UPDATE user_achievements SET context_id = earned_from_id WHERE context_id IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='context_data') THEN
        ALTER TABLE user_achievements ADD COLUMN context_data JSONB;
    END IF;

    -- Add display columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='is_featured') THEN
        ALTER TABLE user_achievements ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='display_order') THEN
        ALTER TABLE user_achievements ADD COLUMN display_order INTEGER;
    END IF;

    -- Add notification columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='notification_sent') THEN
        ALTER TABLE user_achievements ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='notification_sent_at') THEN
        ALTER TABLE user_achievements ADD COLUMN notification_sent_at TIMESTAMPTZ;
    END IF;

    -- Add sharing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='is_public') THEN
        ALTER TABLE user_achievements ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_achievements' AND column_name='shared_to_social') THEN
        ALTER TABLE user_achievements ADD COLUMN shared_to_social BOOLEAN DEFAULT FALSE;
    END IF;

    -- Remove organization_id if it exists (not in new schema)
    -- Keep it for now, might be useful
END $$;

-- ============================================================================
-- STEP 4: Transform user_points Table
-- ============================================================================

-- Rename old user_points to user_points_transactions_legacy
ALTER TABLE IF EXISTS user_points RENAME TO user_points_transactions_legacy;

-- Create new user_points with aggregate structure
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Points Balance
    total_points_earned BIGINT DEFAULT 0,
    total_points_spent BIGINT DEFAULT 0,
    current_balance BIGINT GENERATED ALWAYS AS (total_points_earned - total_points_spent) STORED,
    
    -- Lifetime Stats
    lifetime_rank INTEGER,
    highest_balance BIGINT DEFAULT 0,
    
    -- Current Period Stats
    points_this_week BIGINT DEFAULT 0,
    points_this_month BIGINT DEFAULT 0,
    points_this_year BIGINT DEFAULT 0,
    
    -- Multipliers & Bonuses
    current_multiplier DECIMAL(3,2) DEFAULT 1.0,
    bonus_multiplier_expires_at TIMESTAMPTZ,
    
    -- Metadata
    last_earned_at TIMESTAMPTZ,
    last_spent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data from legacy user_points to new aggregate structure
INSERT INTO user_points (user_id, total_points_earned, last_earned_at, created_at)
SELECT 
    user_id,
    SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as total_points_earned,
    MAX(earned_at) as last_earned_at,
    MIN(created_at) as created_at
FROM user_points_transactions_legacy
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE SET
    total_points_earned = EXCLUDED.total_points_earned,
    last_earned_at = EXCLUDED.last_earned_at;

-- Migrate transactions to new points_transactions table
INSERT INTO points_transactions (
    user_id,
    transaction_type,
    points_amount,
    source_type,
    source_id,
    description,
    multiplier_applied,
    created_at
)
SELECT 
    user_id,
    'earned' as transaction_type,
    points as points_amount,
    COALESCE(action_type, 'legacy_import') as source_type,
    reference_id as source_id,
    bonus_reason as description,
    COALESCE(multiplier, 1.0) as multiplier_applied,
    created_at
FROM user_points_transactions_legacy;

-- ============================================================================
-- STEP 5: Create Indexes for New Tables
-- ============================================================================

-- Achievement Categories
CREATE INDEX IF NOT EXISTS idx_achievement_categories_slug ON achievement_categories(slug);
CREATE INDEX IF NOT EXISTS idx_achievement_categories_active ON achievement_categories(is_active) WHERE is_active = TRUE;

-- Achievement Progress
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_percentage ON achievement_progress(progress_percentage);

-- User Streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_longest ON user_streaks(longest_streak DESC);

-- Points Sources
CREATE INDEX IF NOT EXISTS idx_points_sources_slug ON points_sources(slug);
CREATE INDEX IF NOT EXISTS idx_points_sources_category ON points_sources(category);
CREATE INDEX IF NOT EXISTS idx_points_sources_active ON points_sources(is_active) WHERE is_active = TRUE;

-- Points Transactions
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON points_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at DESC);

-- Rewards Catalog
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_slug ON rewards_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_type ON rewards_catalog(reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_available ON rewards_catalog(is_available) WHERE is_available = TRUE;

-- User Rewards
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward ON user_rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);
CREATE INDEX IF NOT EXISTS idx_user_rewards_redeemed ON user_rewards(redeemed_at DESC);

-- Leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboards_slug ON leaderboards(slug);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_active ON leaderboards(is_active) WHERE is_active = TRUE;

-- Leaderboard Entries
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(leaderboard_id, rank);

-- ============================================================================
-- STEP 6: Update Existing Indexes on Modified Tables
-- ============================================================================

-- Achievements - add new indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category_id ON achievements(category_id);
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON achievements(tier, tier_level);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON achievements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_achievements_hidden ON achievements(is_hidden) WHERE is_hidden = FALSE;

-- User Points - add indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_balance ON user_points(current_balance DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_earned ON user_points(total_points_earned DESC);

-- ============================================================================
-- STEP 7: Add RLS Policies (copy from SKIP files as needed)
-- ============================================================================

-- Enable RLS
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Basic policies (users can read their own data)
CREATE POLICY user_achievements_select ON user_achievements FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY user_points_select ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_streaks_select ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY points_transactions_select ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_rewards_select ON user_rewards FOR SELECT USING (auth.uid() = user_id);

-- Public read policies
CREATE POLICY achievement_categories_select ON achievement_categories FOR SELECT USING (TRUE);
CREATE POLICY achievements_select_active ON achievements FOR SELECT USING (is_active = TRUE AND (is_hidden = FALSE OR auth.uid() IS NOT NULL));
CREATE POLICY points_sources_select ON points_sources FOR SELECT USING (is_active = TRUE);
CREATE POLICY rewards_catalog_select ON rewards_catalog FOR SELECT USING (is_available = TRUE);
CREATE POLICY leaderboards_select ON leaderboards FOR SELECT USING (is_public = TRUE OR auth.uid() IS NOT NULL);
CREATE POLICY leaderboard_entries_select ON leaderboard_entries FOR SELECT USING (TRUE);

-- Migration complete: Migrated gamification schema from basic (004) to comprehensive (009-011) structure
