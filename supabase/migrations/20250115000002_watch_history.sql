-- Migration: Add watch history table for Phase 2
-- Created: 2025-01-15
-- Purpose: Track detailed watch history for analytics and resume functionality

-- Create watch_history table
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Watch Session Data
    watch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress Data
    start_position_seconds INTEGER NOT NULL DEFAULT 0,
    end_position_seconds INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0, -- Actual watch time
    total_video_seconds INTEGER, -- Total video duration
    
    -- Completion Status
    completed_session BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Device & Context
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_start_position CHECK (start_position_seconds >= 0),
    CONSTRAINT valid_end_position CHECK (end_position_seconds >= start_position_seconds),
    CONSTRAINT valid_duration CHECK (duration_seconds >= 0),
    CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- Create indexes for performance
CREATE INDEX idx_watch_history_user_date 
    ON public.watch_history(user_id, watch_date DESC);

CREATE INDEX idx_watch_history_lesson 
    ON public.watch_history(lesson_id, started_at DESC);

CREATE INDEX idx_watch_history_course 
    ON public.watch_history(course_id, started_at DESC);

CREATE INDEX idx_watch_history_enrollment 
    ON public.watch_history(enrollment_id);

CREATE INDEX idx_watch_history_started_at 
    ON public.watch_history(started_at DESC);

-- Enable Row Level Security
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own watch history
CREATE POLICY "Users can view their own watch history"
    ON public.watch_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own watch history entries
CREATE POLICY "Users can create their own watch history"
    ON public.watch_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own watch history entries
CREATE POLICY "Users can update their own watch history"
    ON public.watch_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all watch history
CREATE POLICY "Admins can view all watch history"
    ON public.watch_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create view for watch statistics
CREATE OR REPLACE VIEW public.watch_statistics AS
SELECT 
    user_id,
    lesson_id,
    course_id,
    COUNT(*) as total_sessions,
    SUM(duration_seconds) as total_watch_seconds,
    AVG(progress_percentage) as avg_progress,
    MAX(progress_percentage) as max_progress,
    MAX(started_at) as last_watched_at,
    COUNT(CASE WHEN completed_session THEN 1 END) as completed_sessions
FROM public.watch_history
GROUP BY user_id, lesson_id, course_id;

-- Add comment
COMMENT ON TABLE public.watch_history IS 'Tracks detailed watch history for lessons to enable analytics and resume functionality';
COMMENT ON VIEW public.watch_statistics IS 'Aggregated watch statistics per user/lesson/course';
