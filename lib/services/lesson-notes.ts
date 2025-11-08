/**
 * Lesson Notes Service
 * Phase 2 - Enhanced Learning Experience
 * Handles timestamped note-taking during lesson playback
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  LessonNote, 
  CreateLessonNoteData, 
  UpdateLessonNoteData 
} from '@/lib/types/courses'

const supabase = createClient()

/**
 * Get all notes for a specific lesson by the current user
 */
export async function getLessonNotes(
  userId: string,
  lessonId: string
): Promise<LessonNote[]> {
  const { data, error } = await supabase
    .from('lesson_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('timestamp_seconds', { ascending: true })

  if (error) {
    console.error('Error fetching lesson notes:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new note at the current video timestamp
 */
export async function createLessonNote(
  userId: string,
  noteData: CreateLessonNoteData
): Promise<LessonNote> {
  const { data, error } = await supabase
    .from('lesson_notes')
    .insert({
      user_id: userId,
      ...noteData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating lesson note:', error)
    throw error
  }

  return data
}

/**
 * Update an existing note
 */
export async function updateLessonNote(
  noteId: string,
  updates: UpdateLessonNoteData
): Promise<LessonNote> {
  const { data, error } = await supabase
    .from('lesson_notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single()

  if (error) {
    console.error('Error updating lesson note:', error)
    throw error
  }

  return data
}

/**
 * Delete a note
 */
export async function deleteLessonNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('lesson_notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    console.error('Error deleting lesson note:', error)
    throw error
  }
}

/**
 * Get note count for a lesson
 */
export async function getLessonNoteCount(
  userId: string,
  lessonId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('lesson_notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)

  if (error) {
    console.error('Error counting lesson notes:', error)
    return 0
  }

  return count || 0
}

/**
 * Export all notes for a lesson as text
 */
export async function exportLessonNotesAsText(
  userId: string,
  lessonId: string
): Promise<string> {
  const notes = await getLessonNotes(userId, lessonId)
  
  if (notes.length === 0) {
    return 'No notes available for this lesson.'
  }

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return notes
    .map(note => `[${formatTimestamp(note.timestamp_seconds)}] ${note.note_text}`)
    .join('\n\n')
}
