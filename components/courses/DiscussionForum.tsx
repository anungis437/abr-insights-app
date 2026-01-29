'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Reply,
  ThumbsUp,
  CheckCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react'
import {
  getCourseDiscussions,
  getDiscussionReplies,
  createDiscussion,
  replyToDiscussion,
  markDiscussionAsAnswered,
} from '@/lib/services/courses-enhanced'
import type { CourseDiscussion, DiscussionType } from '@/lib/types/courses'

interface DiscussionForumProps {
  courseId: string
  lessonId?: string
  userId?: string
  userRole?: string
  className?: string
}

interface DiscussionWithReplies extends CourseDiscussion {
  replies?: CourseDiscussion[]
  showReplies?: boolean
}

export function DiscussionForum({
  courseId,
  lessonId,
  userId,
  userRole,
  className = '',
}: DiscussionForumProps) {
  const [discussions, setDiscussions] = useState<DiscussionWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<DiscussionType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostType, setNewPostType] = useState<'question' | 'discussion' | 'announcement'>(
    'question'
  )
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getCourseDiscussions(courseId, lessonId)

        if (data) {
          // Filter by type if needed
          const filtered =
            filterType === 'all' ? data : data.filter((d) => d.discussion_type === filterType)

          setDiscussions(filtered.map((d) => ({ ...d, showReplies: false })))
        }
      } catch (err) {
        console.error('Error loading discussions:', err)
        setError('Failed to load discussions')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId, lessonId, filterType])

  const loadDiscussions = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getCourseDiscussions(courseId, lessonId)

      if (data) {
        // Filter by type if needed
        const filtered =
          filterType === 'all' ? data : data.filter((d) => d.discussion_type === filterType)

        setDiscussions(filtered.map((d) => ({ ...d, showReplies: false })))
      }
    } catch (err) {
      console.error('Error loading discussions:', err)
      setError('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (discussionId: string) => {
    try {
      const replies = await getDiscussionReplies(discussionId)

      setDiscussions((prev) =>
        prev.map((d) => (d.id === discussionId ? { ...d, replies, showReplies: true } : d))
      )
    } catch (err) {
      console.error('Error loading replies:', err)
    }
  }

  const toggleReplies = (discussionId: string) => {
    const discussion = discussions.find((d) => d.id === discussionId)

    if (discussion?.showReplies) {
      // Collapse replies
      setDiscussions((prev) =>
        prev.map((d) => (d.id === discussionId ? { ...d, showReplies: false } : d))
      )
    } else {
      // Load and show replies
      loadReplies(discussionId)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !newPostContent.trim()) return

    try {
      setSubmitting(true)

      await createDiscussion(
        userId,
        courseId,
        newPostContent,
        newPostType === 'question' ? newPostTitle : undefined,
        lessonId,
        newPostType
      )

      // Reset form
      setNewPostTitle('')
      setNewPostContent('')
      setShowNewPost(false)

      // Reload discussions
      await loadDiscussions()
    } catch (err) {
      console.error('Error creating post:', err)
      alert('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!userId || !replyContent.trim()) return

    try {
      setSubmitting(true)

      await replyToDiscussion(userId, parentId, replyContent)

      // Reset reply form
      setReplyContent('')
      setReplyingTo(null)

      // Reload replies for this discussion
      await loadReplies(parentId)
    } catch (err) {
      console.error('Error posting reply:', err)
      alert('Failed to post reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsAnswered = async (discussionId: string, answerId: string) => {
    if (!userId) return

    try {
      await markDiscussionAsAnswered(discussionId, answerId, userId)

      // Reload discussions to show updated status
      await loadDiscussions()
    } catch (err) {
      console.error('Error marking as answered:', err)
      alert('Failed to mark answer. Please try again.')
    }
  }

  const filteredDiscussions = discussions.filter((d) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return d.content?.toLowerCase().includes(query) || d.title?.toLowerCase().includes(query)
    }
    return true
  })

  const getTypeIcon = (type: DiscussionType) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-5 w-5" />
      case 'discussion':
        return <MessageSquare className="h-5 w-5" />
      case 'announcement':
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Reply className="h-5 w-5" />
    }
  }

  const getTypeBadge = (type: DiscussionType) => {
    const colors = {
      question: 'bg-blue-100 text-blue-800',
      discussion: 'bg-purple-100 text-purple-800',
      announcement: 'bg-yellow-100 text-yellow-800',
      reply: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${colors[type]}`}
      >
        {type}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-20 rounded bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Discussion Forum</h2>

          {userId && (
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              New Post
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label htmlFor="discussion-filter" className="sr-only">
              Filter discussions by type
            </label>
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <select
              id="discussion-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DiscussionType | 'all')}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="question">Questions</option>
              <option value="discussion">Discussions</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
        </div>
      </div>

      {/* New Post Form */}
      {showNewPost && userId && (
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Post Type</label>
              <div className="flex gap-2">
                {(['question', 'discussion'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewPostType(type)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      newPostType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {newPostType === 'question' && (
              <div>
                <label
                  htmlFor="post-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Question Title
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="What do you want to ask?"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="post-content"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {newPostType === 'question' ? 'Details' : 'Content'}
              </label>
              <textarea
                id="post-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={
                  newPostType === 'question'
                    ? 'Provide more details about your question...'
                    : 'Share your thoughts...'
                }
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !newPostContent.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewPost(false)
                  setNewPostTitle('')
                  setNewPostContent('')
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussions List */}
      <div className="divide-y divide-gray-100">
        {error ? (
          <div className="p-6 text-center text-red-600" role="alert">
            {error}
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {searchQuery
                ? 'No discussions found matching your search.'
                : 'No discussions yet. Be the first to start one!'}
            </p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="p-6 transition-colors hover:bg-gray-50">
              {/* Discussion Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-5 w-5 text-gray-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(discussion.discussion_type)}
                      {discussion.is_answered && (
                        <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Answered
                        </span>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-sm text-gray-500">
                      {formatDate(discussion.created_at)}
                    </span>
                  </div>

                  {discussion.title && (
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{discussion.title}</h3>
                  )}

                  <p className="mb-3 whitespace-pre-wrap text-gray-700">{discussion.content}</p>

                  {/* Discussion Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => toggleReplies(discussion.id)}
                      className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600"
                    >
                      {discussion.showReplies ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span>
                        {discussion.replies_count || 0}{' '}
                        {discussion.replies_count === 1 ? 'reply' : 'replies'}
                      </span>
                    </button>

                    {userId && (
                      <button
                        onClick={() =>
                          setReplyingTo(replyingTo === discussion.id ? null : discussion.id)
                        }
                        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                    )}

                    <button className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{discussion.upvotes_count || 0}</span>
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === discussion.id && userId && (
                    <div className="mt-4 border-l-2 border-blue-200 pl-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleReply(discussion.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {discussion.showReplies &&
                    discussion.replies &&
                    discussion.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
                        {discussion.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-900">User</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDate(reply.created_at)}
                                  </span>
                                  {discussion.discussion_type === 'question' &&
                                    discussion.user_id === userId &&
                                    !discussion.is_answered && (
                                      <button
                                        onClick={() =>
                                          handleMarkAsAnswered(discussion.id, reply.id)
                                        }
                                        className="text-xs font-medium text-green-600 hover:text-green-700"
                                      >
                                        Mark as answer
                                      </button>
                                    )}
                                  {reply.id === discussion.best_answer_id && (
                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                      <CheckCircle className="h-3 w-3" />
                                      Best Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
