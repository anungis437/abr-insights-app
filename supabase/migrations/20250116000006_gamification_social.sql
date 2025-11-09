-- =====================================================
-- Migration: Gamification Social Features
-- Description: Add social learning features (follows, groups, forums)
-- Created: 2025-01-16
-- =====================================================

-- ============================================================================
-- Extended User Profiles (social/public profile information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Display Information
    display_name VARCHAR(200),
    bio TEXT,
    tagline VARCHAR(300),
    location VARCHAR(200),
    timezone VARCHAR(100),
    
    -- Social Links
    website_url TEXT,
    linkedin_url TEXT,
    twitter_handle VARCHAR(100),
    github_username VARCHAR(100),
    
    -- Profile Images
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- Professional Information
    job_title VARCHAR(200),
    company VARCHAR(200),
    industry VARCHAR(100),
    years_of_experience INTEGER,
    
    -- Learning Preferences
    learning_goals TEXT[],
    interests TEXT[],
    skill_tags TEXT[],
    preferred_learning_time VARCHAR(50),
    study_pace VARCHAR(50),
    
    -- Visibility Settings
    profile_visibility VARCHAR(50) DEFAULT 'public',
    show_achievements BOOLEAN DEFAULT TRUE,
    show_progress BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    
    -- Activity Stats
    total_courses_completed INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    total_quiz_attempts INTEGER DEFAULT 0,
    total_study_time_minutes BIGINT DEFAULT 0,
    
    -- Social Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    helpful_answers_count INTEGER DEFAULT 0,
    
    -- Badges & Recognition
    featured_achievements UUID[],
    custom_badges JSONB,
    
    -- Metadata
    profile_completed_percentage INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- User Follows (social following system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    follow_type VARCHAR(50) DEFAULT 'standard',
    notify_on_activity BOOLEAN DEFAULT TRUE,
    notify_on_achievements BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ============================================================================
-- Study Buddies
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    match_score INTEGER,
    match_criteria JSONB,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    
    status VARCHAR(50) DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    study_schedule JSONB,
    shared_goals TEXT[],
    target_courses UUID[],
    
    last_interaction_at TIMESTAMPTZ,
    sessions_completed INTEGER DEFAULT 0,
    can_message BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, buddy_id),
    CHECK (user_id != buddy_id)
);

-- ============================================================================
-- User Activity Feed
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(100) NOT NULL,
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    
    related_type VARCHAR(100),
    related_id UUID,
    related_data JSONB,
    
    thumbnail_url TEXT,
    
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    visibility VARCHAR(50) DEFAULT 'public',
    is_pinned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- User Groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    group_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    
    cover_image_url TEXT,
    avatar_url TEXT,
    
    privacy_level VARCHAR(50) DEFAULT 'public',
    join_policy VARCHAR(50) DEFAULT 'open',
    
    max_members INTEGER,
    members_count INTEGER DEFAULT 0,
    
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Group Members
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    role VARCHAR(50) DEFAULT 'member',
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES profiles(id),
    
    is_active BOOLEAN DEFAULT TRUE,
    left_at TIMESTAMPTZ,
    
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    posts_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(group_id, user_id)
);

-- ============================================================================
-- Discussion Forums
-- ============================================================================

CREATE TABLE IF NOT EXISTS discussion_forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    forum_type VARCHAR(50) DEFAULT 'general',
    
    parent_forum_id UUID REFERENCES discussion_forums(id),
    
    group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    
    icon VARCHAR(100),
    cover_image_url TEXT,
    
    display_order INTEGER DEFAULT 0,
    
    is_locked BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    topics_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    
    last_post_at TIMESTAMPTZ,
    last_post_by UUID REFERENCES profiles(id),
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Forum Posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID REFERENCES discussion_forums(id) ON DELETE CASCADE,
    
    parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    title VARCHAR(500),
    content TEXT NOT NULL,
    content_format VARCHAR(50) DEFAULT 'markdown',
    
    post_type VARCHAR(50) DEFAULT 'discussion',
    
    tags TEXT[],
    
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    is_solved BOOLEAN DEFAULT FALSE,
    solved_by_post_id UUID REFERENCES forum_posts(id),
    solved_at TIMESTAMPTZ,
    
    last_reply_at TIMESTAMPTZ,
    last_reply_by UUID REFERENCES profiles(id),
    
    attachments JSONB,
    
    edited_at TIMESTAMPTZ,
    edited_by UUID REFERENCES profiles(id),
    
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- User Profiles Extended
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user ON user_profiles_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_visibility ON user_profiles_extended(profile_visibility);

-- User Follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_active ON user_follows(is_active) WHERE is_active = TRUE;

-- Study Buddies
CREATE INDEX IF NOT EXISTS idx_study_buddies_user ON study_buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_study_buddies_buddy ON study_buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_study_buddies_status ON study_buddies(status);

-- User Activity Feed
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user ON user_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_type ON user_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_created ON user_activity_feed(created_at DESC);

-- User Groups
CREATE INDEX IF NOT EXISTS idx_user_groups_slug ON user_groups(slug);
CREATE INDEX IF NOT EXISTS idx_user_groups_type ON user_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_user_groups_active ON user_groups(is_active) WHERE is_active = TRUE;

-- Group Members
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- Discussion Forums
CREATE INDEX IF NOT EXISTS idx_discussion_forums_slug ON discussion_forums(slug);
CREATE INDEX IF NOT EXISTS idx_discussion_forums_group ON discussion_forums(group_id);
CREATE INDEX IF NOT EXISTS idx_discussion_forums_course ON discussion_forums(course_id);
CREATE INDEX IF NOT EXISTS idx_discussion_forums_parent ON discussion_forums(parent_forum_id);

-- Forum Posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent ON forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned) WHERE is_pinned = TRUE;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- User Profiles Extended
CREATE POLICY user_profiles_extended_select ON user_profiles_extended FOR SELECT 
    USING (
        profile_visibility = 'public' OR 
        auth.uid() = user_id OR
        (profile_visibility = 'connections' AND EXISTS (
            SELECT 1 FROM user_follows 
            WHERE following_id = user_id AND follower_id = auth.uid()
        ))
    );

CREATE POLICY user_profiles_extended_update ON user_profiles_extended FOR UPDATE 
    USING (auth.uid() = user_id);

-- User Follows
CREATE POLICY user_follows_select ON user_follows FOR SELECT USING (TRUE);
CREATE POLICY user_follows_insert ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY user_follows_delete ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Study Buddies
CREATE POLICY study_buddies_select ON study_buddies FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- User Activity Feed
CREATE POLICY user_activity_feed_select ON user_activity_feed FOR SELECT 
    USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_follows 
            WHERE following_id = user_id AND follower_id = auth.uid()
        )
    );

-- User Groups
CREATE POLICY user_groups_select ON user_groups FOR SELECT 
    USING (is_active = TRUE AND (privacy_level = 'public' OR auth.uid() IS NOT NULL));

-- Group Members
CREATE POLICY group_members_select ON group_members FOR SELECT USING (TRUE);

-- Discussion Forums
CREATE POLICY discussion_forums_select ON discussion_forums FOR SELECT USING (is_active = TRUE);

-- Forum Posts
CREATE POLICY forum_posts_select ON forum_posts FOR SELECT 
    USING (deleted_at IS NULL);

CREATE POLICY forum_posts_insert ON forum_posts FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY forum_posts_update ON forum_posts FOR UPDATE 
    USING (auth.uid() = author_id);

-- Migration complete
