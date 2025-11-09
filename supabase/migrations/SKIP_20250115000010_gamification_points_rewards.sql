-- =====================================================
-- Phase 5: Gamification & Engagement - Points & Rewards
-- Migration: 20250115000010_gamification_points_rewards.sql
-- =====================================================

-- Points Sources (defines how points can be earned)
CREATE TABLE IF NOT EXISTS points_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source Definition
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Point Configuration
    points_amount INTEGER NOT NULL, -- Base points for this action
    points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Multiplier for special conditions
    max_daily_occurrences INTEGER, -- Limit how many times per day (NULL = unlimited)
    max_total_occurrences INTEGER, -- Lifetime limit (NULL = unlimited)
    
    -- Conditions
    requires_verification BOOLEAN DEFAULT FALSE,
    cooldown_minutes INTEGER, -- Minimum time between earning
    
    -- Category
    category VARCHAR(100), -- 'learning', 'engagement', 'social', 'achievement'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Points (aggregate points balance)
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

-- Points Transactions (detailed transaction history)
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'spent', 'adjusted', 'expired'
    points_amount INTEGER NOT NULL,
    balance_after BIGINT,
    
    -- Source/Reason
    source_type VARCHAR(100) NOT NULL, -- 'course_completion', 'quiz', 'achievement', 'purchase', etc.
    source_id UUID, -- Reference to related entity
    points_source_id UUID REFERENCES points_sources(id),
    description TEXT,
    
    -- Context
    context_data JSONB,
    multiplier_applied DECIMAL(3,2) DEFAULT 1.0,
    
    -- Admin/System
    created_by UUID REFERENCES profiles(id), -- For manual adjustments
    is_admin_adjustment BOOLEAN DEFAULT FALSE,
    admin_note TEXT,
    
    -- Status
    is_reversed BOOLEAN DEFAULT FALSE,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES profiles(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards Catalog (items users can redeem with points)
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reward Details
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Visual
    image_url TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(50),
    
    -- Cost
    points_cost INTEGER NOT NULL,
    original_price_cad DECIMAL(10,2), -- Original price in CAD for comparison
    
    -- Type & Delivery
    reward_type VARCHAR(100) NOT NULL, -- 'discount', 'content_unlock', 'certificate_upgrade', 'badge', 'physical_item'
    reward_config JSONB, -- Type-specific configuration
    delivery_method VARCHAR(100), -- 'instant', 'email', 'manual'
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER, -- NULL = unlimited
    max_per_user INTEGER, -- NULL = unlimited
    
    -- Requirements
    min_level INTEGER DEFAULT 0,
    required_achievements UUID[], -- Array of achievement IDs required
    
    -- Time Constraints
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    
    -- Statistics
    times_redeemed INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- User Rewards (track redeemed rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards_catalog(id),
    
    -- Redemption Details
    points_spent INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Delivery Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'delivered', 'failed', 'refunded'
    delivered_at TIMESTAMPTZ,
    
    -- Delivery Details
    delivery_data JSONB, -- Delivery-specific information
    tracking_info TEXT,
    
    -- Usage (for rewards with ongoing value)
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Support
    support_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards (different leaderboard types)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Leaderboard Details
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Type & Scope
    leaderboard_type VARCHAR(100) NOT NULL, -- 'global', 'course', 'organization', 'skill'
    scope_id UUID, -- Reference to course, org, etc. (NULL for global)
    
    -- Time Period
    time_period VARCHAR(50) NOT NULL, -- 'all_time', 'yearly', 'monthly', 'weekly', 'daily'
    period_start DATE,
    period_end DATE,
    
    -- Metric
    metric_type VARCHAR(100) NOT NULL, -- 'points', 'courses_completed', 'quiz_scores', 'engagement'
    
    -- Display
    max_entries INTEGER DEFAULT 100,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard Entries (positions on leaderboards)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Ranking
    rank INTEGER NOT NULL,
    previous_rank INTEGER,
    rank_change INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN previous_rank IS NULL THEN 0
            ELSE previous_rank - rank
        END
    ) STORED,
    
    -- Score/Metric
    score BIGINT NOT NULL,
    previous_score BIGINT,
    
    -- Percentile
    percentile INTEGER, -- 0-100, where 100 is top
    
    -- Time
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(leaderboard_id, user_id)
);

-- User Levels (gamified level system)
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Level & XP
    current_level INTEGER DEFAULT 1,
    current_xp BIGINT DEFAULT 0,
    xp_for_next_level BIGINT DEFAULT 1000,
    
    -- Total Progress
    total_xp_earned BIGINT DEFAULT 0,
    
    -- Level Benefits
    points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Increases with level
    perks JSONB, -- Level-specific perks
    
    -- Metadata
    level_up_count INTEGER DEFAULT 0,
    last_level_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_points_sources_category ON points_sources(category);
CREATE INDEX IF NOT EXISTS idx_points_sources_active ON points_sources(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_balance ON user_points(current_balance DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_week ON user_points(points_this_week DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_month ON user_points(points_this_month DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON points_transactions(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_rewards_catalog_available ON rewards_catalog(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_type ON rewards_catalog(reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_cost ON rewards_catalog(points_cost);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);
CREATE INDEX IF NOT EXISTS idx_user_rewards_redeemed ON user_rewards(redeemed_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(time_period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_active ON leaderboards(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_board ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(leaderboard_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(leaderboard_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_user_levels_user ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(current_level DESC);

-- Enable RLS
ALTER TABLE points_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Points Sources: Public read
CREATE POLICY "Points sources are viewable by everyone"
    ON points_sources FOR SELECT
    USING (is_active = TRUE);

-- User Points: Users view own, public leaderboard view
CREATE POLICY "Users can view their own points"
    ON user_points FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Public leaderboard view"
    ON user_points FOR SELECT
    USING (TRUE); -- Aggregate stats are public for leaderboards

CREATE POLICY "System can manage user points"
    ON user_points FOR ALL
    USING (user_id = auth.uid());

-- Points Transactions: Users view own
CREATE POLICY "Users can view their own transactions"
    ON points_transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions"
    ON points_transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Rewards Catalog: Public read
CREATE POLICY "Available rewards are viewable by everyone"
    ON rewards_catalog FOR SELECT
    USING (is_available = TRUE);

CREATE POLICY "Admins can manage rewards"
    ON rewards_catalog FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- User Rewards: Users view own
CREATE POLICY "Users can view their own rewards"
    ON user_rewards FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can redeem rewards"
    ON user_rewards FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Leaderboards: Public read for public boards
CREATE POLICY "Public leaderboards are viewable by everyone"
    ON leaderboards FOR SELECT
    USING (is_public = TRUE AND is_active = TRUE);

-- Leaderboard Entries: Public read based on leaderboard visibility
CREATE POLICY "Public leaderboard entries are viewable"
    ON leaderboard_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leaderboards
            WHERE leaderboards.id = leaderboard_entries.leaderboard_id
            AND leaderboards.is_public = TRUE
            AND leaderboards.is_active = TRUE
        )
    );

-- User Levels: Users view own, levels visible to all
CREATE POLICY "Users can view their own level"
    ON user_levels FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "User levels are publicly visible"
    ON user_levels FOR SELECT
    USING (TRUE);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Award Points to User
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_points_amount INTEGER,
    p_source_type VARCHAR,
    p_source_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_context_data JSONB DEFAULT NULL
)
RETURNS points_transactions AS $$
DECLARE
    v_transaction points_transactions%ROWTYPE;
    v_user_points user_points%ROWTYPE;
    v_multiplier DECIMAL(3,2);
    v_final_points INTEGER;
BEGIN
    -- Get or create user points record
    INSERT INTO user_points (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Get current points and multiplier
    SELECT * INTO v_user_points
    FROM user_points
    WHERE user_id = p_user_id;
    
    -- Calculate final points with multiplier
    v_multiplier := v_user_points.current_multiplier;
    v_final_points := ROUND(p_points_amount * v_multiplier);
    
    -- Create transaction
    INSERT INTO points_transactions (
        user_id,
        transaction_type,
        points_amount,
        source_type,
        source_id,
        description,
        context_data,
        multiplier_applied,
        balance_after
    ) VALUES (
        p_user_id,
        'earned',
        v_final_points,
        p_source_type,
        p_source_id,
        p_description,
        p_context_data,
        v_multiplier,
        v_user_points.current_balance + v_final_points
    ) RETURNING * INTO v_transaction;
    
    -- Update user points
    UPDATE user_points
    SET 
        total_points_earned = total_points_earned + v_final_points,
        highest_balance = GREATEST(highest_balance, current_balance),
        points_this_week = points_this_week + v_final_points,
        points_this_month = points_this_month + v_final_points,
        points_this_year = points_this_year + v_final_points,
        last_earned_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Update XP and check for level up
    PERFORM add_user_xp(p_user_id, v_final_points);
    
    RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Spend Points
CREATE OR REPLACE FUNCTION spend_points(
    p_user_id UUID,
    p_points_amount INTEGER,
    p_source_type VARCHAR,
    p_source_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS points_transactions AS $$
DECLARE
    v_transaction points_transactions%ROWTYPE;
    v_current_balance BIGINT;
BEGIN
    -- Check if user has enough points
    SELECT current_balance INTO v_current_balance
    FROM user_points
    WHERE user_id = p_user_id;
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User points record not found';
    END IF;
    
    IF v_current_balance < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points. Balance: %, Required: %', v_current_balance, p_points_amount;
    END IF;
    
    -- Create transaction
    INSERT INTO points_transactions (
        user_id,
        transaction_type,
        points_amount,
        source_type,
        source_id,
        description,
        balance_after
    ) VALUES (
        p_user_id,
        'spent',
        -p_points_amount,
        p_source_type,
        p_source_id,
        p_description,
        v_current_balance - p_points_amount
    ) RETURNING * INTO v_transaction;
    
    -- Update user points
    UPDATE user_points
    SET 
        total_points_spent = total_points_spent + p_points_amount,
        last_spent_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Redeem Reward
CREATE OR REPLACE FUNCTION redeem_reward(
    p_user_id UUID,
    p_reward_id UUID
)
RETURNS user_rewards AS $$
DECLARE
    v_reward rewards_catalog%ROWTYPE;
    v_user_reward user_rewards%ROWTYPE;
    v_redemption_count INTEGER;
BEGIN
    -- Get reward details
    SELECT * INTO v_reward
    FROM rewards_catalog
    WHERE id = p_reward_id AND is_available = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reward not found or not available';
    END IF;
    
    -- Check stock
    IF v_reward.stock_quantity IS NOT NULL AND v_reward.stock_quantity <= 0 THEN
        RAISE EXCEPTION 'Reward is out of stock';
    END IF;
    
    -- Check per-user limit
    IF v_reward.max_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_redemption_count
        FROM user_rewards
        WHERE user_id = p_user_id AND reward_id = p_reward_id;
        
        IF v_redemption_count >= v_reward.max_per_user THEN
            RAISE EXCEPTION 'User has reached redemption limit for this reward';
        END IF;
    END IF;
    
    -- Spend points
    PERFORM spend_points(p_user_id, v_reward.points_cost, 'reward_redemption', p_reward_id, v_reward.name);
    
    -- Create user reward
    INSERT INTO user_rewards (
        user_id,
        reward_id,
        points_spent,
        status
    ) VALUES (
        p_user_id,
        p_reward_id,
        v_reward.points_cost,
        CASE WHEN v_reward.delivery_method = 'instant' THEN 'delivered' ELSE 'pending' END
    ) RETURNING * INTO v_user_reward;
    
    -- Update reward statistics
    UPDATE rewards_catalog
    SET 
        times_redeemed = times_redeemed + 1,
        stock_quantity = CASE 
            WHEN stock_quantity IS NOT NULL THEN stock_quantity - 1
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = p_reward_id;
    
    RETURN v_user_reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Leaderboard Entry
CREATE OR REPLACE FUNCTION update_leaderboard_entry(
    p_leaderboard_id UUID,
    p_user_id UUID,
    p_score BIGINT
)
RETURNS leaderboard_entries AS $$
DECLARE
    v_entry leaderboard_entries%ROWTYPE;
    v_previous_score BIGINT;
    v_new_rank INTEGER;
BEGIN
    -- Get previous score
    SELECT score INTO v_previous_score
    FROM leaderboard_entries
    WHERE leaderboard_id = p_leaderboard_id AND user_id = p_user_id;
    
    -- Calculate new rank
    SELECT COUNT(*) + 1 INTO v_new_rank
    FROM leaderboard_entries
    WHERE leaderboard_id = p_leaderboard_id AND score > p_score;
    
    -- Update ranks of affected users
    UPDATE leaderboard_entries
    SET 
        rank = rank + 1,
        updated_at = NOW()
    WHERE leaderboard_id = p_leaderboard_id 
    AND score < p_score
    AND user_id != p_user_id;
    
    -- Insert or update entry
    INSERT INTO leaderboard_entries (
        leaderboard_id,
        user_id,
        rank,
        previous_rank,
        score,
        previous_score
    ) VALUES (
        p_leaderboard_id,
        p_user_id,
        v_new_rank,
        (SELECT rank FROM leaderboard_entries WHERE leaderboard_id = p_leaderboard_id AND user_id = p_user_id),
        p_score,
        v_previous_score
    )
    ON CONFLICT (leaderboard_id, user_id)
    DO UPDATE SET
        rank = v_new_rank,
        previous_rank = EXCLUDED.rank,
        score = p_score,
        previous_score = leaderboard_entries.score,
        updated_at = NOW()
    RETURNING * INTO v_entry;
    
    RETURN v_entry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Add User XP and Handle Level Ups
CREATE OR REPLACE FUNCTION add_user_xp(
    p_user_id UUID,
    p_xp_amount BIGINT
)
RETURNS user_levels AS $$
DECLARE
    v_user_level user_levels%ROWTYPE;
    v_level_ups INTEGER := 0;
BEGIN
    -- Get or create user level record
    INSERT INTO user_levels (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Get current level data
    SELECT * INTO v_user_level
    FROM user_levels
    WHERE user_id = p_user_id;
    
    -- Add XP
    v_user_level.current_xp := v_user_level.current_xp + p_xp_amount;
    v_user_level.total_xp_earned := v_user_level.total_xp_earned + p_xp_amount;
    
    -- Check for level ups
    WHILE v_user_level.current_xp >= v_user_level.xp_for_next_level LOOP
        v_user_level.current_xp := v_user_level.current_xp - v_user_level.xp_for_next_level;
        v_user_level.current_level := v_user_level.current_level + 1;
        v_level_ups := v_level_ups + 1;
        
        -- Calculate XP needed for next level (increases by 10% each level)
        v_user_level.xp_for_next_level := ROUND(v_user_level.xp_for_next_level * 1.1);
        
        -- Increase points multiplier slightly with level
        v_user_level.points_multiplier := 1.0 + (v_user_level.current_level - 1) * 0.02;
    END LOOP;
    
    -- Update user level
    UPDATE user_levels
    SET 
        current_level = v_user_level.current_level,
        current_xp = v_user_level.current_xp,
        xp_for_next_level = v_user_level.xp_for_next_level,
        total_xp_earned = v_user_level.total_xp_earned,
        points_multiplier = v_user_level.points_multiplier,
        level_up_count = level_up_count + v_level_ups,
        last_level_up_at = CASE WHEN v_level_ups > 0 THEN NOW() ELSE last_level_up_at END,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_user_level;
    
    -- Update user points multiplier
    IF v_level_ups > 0 THEN
        UPDATE user_points
        SET current_multiplier = v_user_level.points_multiplier
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN v_user_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User Points Summary
CREATE OR REPLACE FUNCTION get_user_points_summary(p_user_id UUID)
RETURNS TABLE (
    current_balance BIGINT,
    total_earned BIGINT,
    total_spent BIGINT,
    points_this_week BIGINT,
    points_this_month BIGINT,
    current_level INTEGER,
    current_multiplier DECIMAL,
    global_rank INTEGER,
    recent_transactions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.current_balance,
        up.total_points_earned,
        up.total_points_spent,
        up.points_this_week,
        up.points_this_month,
        ul.current_level,
        up.current_multiplier,
        (SELECT COUNT(*) + 1 FROM user_points WHERE user_points.current_balance > up.current_balance)::INTEGER,
        (SELECT jsonb_agg(transaction_data ORDER BY created_at DESC)
         FROM (
             SELECT jsonb_build_object(
                 'id', pt.id,
                 'type', pt.transaction_type,
                 'amount', pt.points_amount,
                 'source', pt.source_type,
                 'description', pt.description,
                 'created_at', pt.created_at
             ) as transaction_data,
             pt.created_at
             FROM points_transactions pt
             WHERE pt.user_id = p_user_id
             ORDER BY pt.created_at DESC
             LIMIT 10
         ) recent)
    FROM user_points up
    LEFT JOIN user_levels ul ON ul.user_id = up.user_id
    WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data: Points Sources
-- =====================================================

INSERT INTO points_sources (name, slug, description, points_amount, category, max_daily_occurrences) VALUES
    ('Course Completion', 'course-completion', 'Complete a full course', 500, 'learning', NULL),
    ('Lesson Completion', 'lesson-completion', 'Complete a lesson', 50, 'learning', NULL),
    ('Quiz Attempt', 'quiz-attempt', 'Complete a quiz', 100, 'learning', NULL),
    ('Perfect Quiz Score', 'perfect-quiz', 'Score 100% on a quiz', 50, 'learning', NULL),
    ('Daily Login', 'daily-login', 'Log in to the platform', 10, 'engagement', 1),
    ('Discussion Post', 'discussion-post', 'Post a discussion topic', 25, 'engagement', 5),
    ('Helpful Comment', 'helpful-comment', 'Comment marked as helpful', 50, 'social', NULL),
    ('Answer Question', 'answer-question', 'Answer a question', 20, 'social', 10),
    ('Share Course', 'share-course', 'Share a course on social media', 15, 'social', 3),
    ('Profile Completion', 'profile-complete', 'Complete your profile', 100, 'engagement', 1);

-- =====================================================
-- Seed Data: Sample Rewards
-- =====================================================

INSERT INTO rewards_catalog (name, slug, description, points_cost, reward_type, delivery_method, is_available) VALUES
    ('10% Course Discount', 'discount-10', 'Get 10% off your next course purchase', 500, 'discount', 'instant', TRUE),
    ('25% Course Discount', 'discount-25', 'Get 25% off your next course purchase', 1500, 'discount', 'instant', TRUE),
    ('Premium Badge', 'premium-badge', 'Unlock a premium profile badge', 2000, 'badge', 'instant', TRUE),
    ('Certificate Upgrade', 'cert-upgrade', 'Upgrade your certificate to premium quality', 1000, 'certificate_upgrade', 'instant', TRUE),
    ('Exclusive Content Access', 'exclusive-content', 'Unlock exclusive advanced courses', 5000, 'content_unlock', 'instant', TRUE);

-- =====================================================
-- Seed Data: Default Leaderboards
-- =====================================================

INSERT INTO leaderboards (name, slug, description, leaderboard_type, time_period, metric_type, is_public) VALUES
    ('All-Time Champions', 'all-time-points', 'Top point earners of all time', 'global', 'all_time', 'points', TRUE),
    ('This Month''s Leaders', 'monthly-points', 'Top point earners this month', 'global', 'monthly', 'points', TRUE),
    ('This Week''s Stars', 'weekly-points', 'Top point earners this week', 'global', 'weekly', 'points', TRUE),
    ('Course Completion Leaders', 'course-completions', 'Most courses completed', 'global', 'all_time', 'courses_completed', TRUE),
    ('Quiz Masters', 'quiz-scores', 'Highest average quiz scores', 'global', 'all_time', 'quiz_scores', TRUE);

-- Comments
COMMENT ON TABLE points_sources IS 'Defines different ways users can earn points';
COMMENT ON TABLE user_points IS 'Aggregate points balance and statistics for each user';
COMMENT ON TABLE points_transactions IS 'Detailed history of all point earning and spending';
COMMENT ON TABLE rewards_catalog IS 'Available rewards that users can redeem with points';
COMMENT ON TABLE user_rewards IS 'Track rewards redeemed by users';
COMMENT ON TABLE leaderboards IS 'Different leaderboard types (global, course-specific, etc.)';
COMMENT ON TABLE leaderboard_entries IS 'User positions on various leaderboards';
COMMENT ON TABLE user_levels IS 'User leveling system with XP and multipliers';
COMMENT ON FUNCTION award_points IS 'Awards points to a user and creates transaction record';
COMMENT ON FUNCTION spend_points IS 'Deducts points from user balance with validation';
COMMENT ON FUNCTION redeem_reward IS 'Handles complete reward redemption process';
COMMENT ON FUNCTION add_user_xp IS 'Adds XP to user and handles automatic level ups';
COMMENT ON FUNCTION get_user_points_summary IS 'Returns comprehensive points summary for a user';
