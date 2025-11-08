-- Migration: Add lesson notes table for Phase 2
-- Created: 2025-01-15
-- Purpose: Enable timestamped note-taking during lesson playback

-- Create lesson_notes table
CREATE TABLE IF NOT EXISTS public.lesson_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    
    -- Note Content
    note_text TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL DEFAULT 0, -- Position in video when note was taken
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_timestamp CHECK (timestamp_seconds >= 0),
    CONSTRAINT valid_note_text CHECK (char_length(note_text) <= 5000)
);

-- Create indexes for performance
CREATE INDEX idx_lesson_notes_user_lesson 
    ON public.lesson_notes(user_id, lesson_id);

CREATE INDEX idx_lesson_notes_enrollment 
    ON public.lesson_notes(enrollment_id);

CREATE INDEX idx_lesson_notes_created_at 
    ON public.lesson_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own notes
CREATE POLICY "Users can view their own notes"
    ON public.lesson_notes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own notes
CREATE POLICY "Users can create their own notes"
    ON public.lesson_notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
    ON public.lesson_notes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
    ON public.lesson_notes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
    ON public.lesson_notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_lesson_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_notes_updated_at
    BEFORE UPDATE ON public.lesson_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_notes_updated_at();

-- Add comment
COMMENT ON TABLE public.lesson_notes IS 'Stores user notes taken during lesson playback with timestamps for video synchronization';
