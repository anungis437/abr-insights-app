/**
 * NotesPanel Component
 * Phase 2 - Enhanced Learning Experience
 * Timestamped note-taking during lesson playback
 */

'use client'

import { useState, useEffect } from 'react'
import { StickyNote, Plus, Trash2, Edit2, Download, Clock, Save, X } from 'lucide-react'
import type { LessonNote } from '@/lib/types/courses'
import {
  getLessonNotes,
  createLessonNote,
  updateLessonNote,
  deleteLessonNote,
  exportLessonNotesAsText,
} from '@/lib/services/lesson-notes'

interface NotesPanelProps {
  lessonId: string
  enrollmentId?: string
  userId: string
  currentTime: number
  onSeekTo?: (seconds: number) => void
  isVisible?: boolean
}

export default function NotesPanel({
  lessonId,
  enrollmentId,
  userId,
  currentTime,
  onSeekTo,
  isVisible = true,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load notes on mount
  useEffect(() => {
    if (userId && lessonId) {
      loadNotes()
    }
  }, [lessonId, userId])

  const loadNotes = async () => {
    if (!userId || !lessonId) return

    try {
      setIsLoading(true)
      const data = await getLessonNotes(userId, lessonId)
      setNotes(data)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!newNoteText.trim() || !userId) return

    try {
      setIsSaving(true)
      const newNote = await createLessonNote(userId, {
        lesson_id: lessonId,
        enrollment_id: enrollmentId,
        note_text: newNoteText.trim(),
        timestamp_seconds: Math.floor(currentTime),
      })

      setNotes([...notes, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds))
      setNewNoteText('')
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editingText.trim()) return

    try {
      setIsSaving(true)
      const updatedNote = await updateLessonNote(noteId, {
        note_text: editingText.trim(),
      })

      setNotes(notes.map((n) => (n.id === noteId ? updatedNote : n)))
      setEditingNoteId(null)
      setEditingText('')
    } catch (error) {
      console.error('Failed to update note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return

    try {
      await deleteLessonNote(noteId)
      setNotes(notes.filter((n) => n.id !== noteId))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleExportNotes = async () => {
    try {
      const text = await exportLessonNotesAsText(userId, lessonId)
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lesson-notes-${lessonId}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export notes:', error)
    }
  }

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeekToNote = (seconds: number) => {
    if (onSeekTo) {
      onSeekTo(seconds)
    }
  }

  if (!isVisible) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Lesson Notes</h3>
          <span className="text-sm text-gray-500">({notes.length})</span>
        </div>
        {notes.length > 0 && (
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            aria-label="Export notes"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        )}
      </div>

      {/* New Note Input */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note at current timestamp..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={5000}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimestamp(Math.floor(currentTime))}
              </span>
              <button
                onClick={handleCreateNote}
                disabled={!newNoteText.trim() || isSaving}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Plus className="h-4 w-4" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="max-h-96 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No notes yet. Add your first note above!
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-blue-300"
            >
              {editingNoteId === note.id ? (
                // Edit Mode
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={5000}
                    aria-label="Edit note text"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingNoteId(null)
                        setEditingText('')
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                      aria-label="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={isSaving}
                      className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleSeekToNote(note.timestamp_seconds)}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      aria-label={`Jump to ${formatTimestamp(note.timestamp_seconds)}`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(note.timestamp_seconds)}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id)
                          setEditingText(note.note_text)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        aria-label="Edit note"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{note.note_text}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
