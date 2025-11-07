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
  User
} from 'lucide-react'
import { 
  getCourseDiscussions, 
  getDiscussionReplies,
  createDiscussion,
  replyToDiscussion,
  markDiscussionAsAnswered
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
  className = ''
}: DiscussionForumProps) {
  const [discussions, setDiscussions] = useState<DiscussionWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<DiscussionType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostType, setNewPostType] = useState<'question' | 'discussion' | 'announcement'>('question')
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
          const filtered = filterType === 'all' 
            ? data 
            : data.filter(d => d.discussion_type === filterType)
          
          setDiscussions(filtered.map(d => ({ ...d, showReplies: false })))
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
        const filtered = filterType === 'all' 
          ? data 
          : data.filter(d => d.discussion_type === filterType)
        
        setDiscussions(filtered.map(d => ({ ...d, showReplies: false })))
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
      
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, replies, showReplies: true }
          : d
      ))
    } catch (err) {
      console.error('Error loading replies:', err)
    }
  }

  const toggleReplies = (discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId)
    
    if (discussion?.showReplies) {
      // Collapse replies
      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, showReplies: false }
          : d
      ))
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

  const filteredDiscussions = discussions.filter(d => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        d.content?.toLowerCase().includes(query) ||
        d.title?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getTypeIcon = (type: DiscussionType) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="w-5 h-5" />
      case 'discussion':
        return <MessageSquare className="w-5 h-5" />
      case 'announcement':
        return <MessageSquare className="w-5 h-5" />
      default:
        return <Reply className="w-5 h-5" />
    }
  }

  const getTypeBadge = (type: DiscussionType) => {
    const colors = {
      question: 'bg-blue-100 text-blue-800',
      discussion: 'bg-purple-100 text-purple-800',
      announcement: 'bg-yellow-100 text-yellow-800',
      reply: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
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
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Discussion Forum</h2>
          
          {userId && (
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              New Post
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label htmlFor="discussion-filter" className="sr-only">Filter discussions by type</label>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              id="discussion-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DiscussionType | 'all')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type
              </label>
              <div className="flex gap-2">
              {(['question', 'discussion'] as const).map(type => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setNewPostType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="What do you want to ask?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                {newPostType === 'question' ? 'Details' : 'Content'}
              </label>
              <textarea
                id="post-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={newPostType === 'question' ? 'Provide more details about your question...' : 'Share your thoughts...'}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !newPostContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No discussions found matching your search.' : 'No discussions yet. Be the first to start one!'}
            </p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="p-6 hover:bg-gray-50 transition-colors">
              {/* Discussion Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(discussion.discussion_type)}
                      {discussion.is_answered && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Answered
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {formatDate(discussion.created_at)}
                    </span>
                  </div>

                  {discussion.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {discussion.title}
                    </h3>
                  )}

                  <p className="text-gray-700 whitespace-pre-wrap mb-3">
                    {discussion.content}
                  </p>

                  {/* Discussion Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => toggleReplies(discussion.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {discussion.showReplies ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>
                        {discussion.replies_count || 0} {discussion.replies_count === 1 ? 'reply' : 'replies'}
                      </span>
                    </button>

                    {userId && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    )}

                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{discussion.upvotes_count || 0}</span>
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === discussion.id && userId && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-200">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReply(discussion.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {discussion.showReplies && discussion.replies && discussion.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                      {discussion.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                User
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.created_at)}
                                </span>
                                {discussion.discussion_type === 'question' && 
                                 discussion.user_id === userId && 
                                 !discussion.is_answered && (
                                  <button
                                    onClick={() => handleMarkAsAnswered(discussion.id, reply.id)}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                  >
                                    Mark as answer
                                  </button>
                                )}
                                {reply.id === discussion.best_answer_id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" />
                                    Best Answer
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
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
