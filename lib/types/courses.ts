/**
 * Type Definitions for Enhanced Course System
 * Phase 1 - Content Structure & Architecture
 * Generated: 2025-11-07
 */

// ============================================================================
// ENUMS
// ============================================================================

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type CourseTier = 'free' | 'professional' | 'enterprise'
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'dropped' | 'expired'
export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'
export type ContentType = 'video' | 'article' | 'quiz' | 'interactive' | 'assignment'
export type VideoProvider = 'youtube' | 'vimeo' | 'azure_media'
export type DiscussionType = 'question' | 'discussion' | 'announcement' | 'reply'
export type VersionChangeType = 'major' | 'minor' | 'patch' | 'regulatory'
export type LearningPathDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'mixed'
export type Language = 'en' | 'fr'

// ============================================================================
// COURSE MODULES
// ============================================================================

export interface CourseModule {
  id: string
  course_id: string
  
  // Basic Info
  title: string
  slug: string
  description?: string
  
  // Organization
  module_number: number
  sort_order: number
  
  // Duration
  estimated_duration_minutes?: number
  
  // Access Control
  is_published: boolean
  unlock_requirements?: {
    required_modules?: string[]
    required_quiz_score?: number
    required_lessons?: string[]
    unlock_date?: string
  }
  
  // Content
  learning_objectives?: string[]
  resources?: ModuleResource[]
  
  // Timestamps
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ModuleResource {
  id?: string
  title: string
  url: string
  type: 'pdf' | 'video' | 'link' | 'document' | 'template' | 'other'
  description?: string
  file_size?: number
  file_format?: string
}

// ============================================================================
// ENHANCED LESSONS
// ============================================================================

export interface Lesson {
  id: string
  course_id: string
  module_id?: string
  
  // Basic Info
  title: string
  slug: string
  description?: string
  
  // Content
  content_type: ContentType
  content_url?: string
  content_data?: Record<string, any>
  
  // Video-specific
  video_duration_seconds?: number
  video_provider?: VideoProvider
  video_id?: string
  thumbnail_url?: string
  
  // Article-specific
  article_body?: string
  estimated_read_time_minutes?: number
  
  // Bilingual Support
  transcript_en?: string
  transcript_fr?: string
  closed_captions_url?: string
  accessibility_notes?: string
  
  // Continuing Education
  ce_credits?: number
  regulatory_body?: string // 'MFDA', 'IIROC', 'Insurance Council', etc.
  
  // Organization
  module_number: number
  lesson_number: number
  sort_order: number
  
  // Access
  is_published: boolean
  is_preview: boolean
  completion_required: boolean
  allow_download: boolean
  
  // Resources
  resources?: LessonResource[]
  
  // Timestamps
  published_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface LessonResource {
  id?: string
  title: string
  url: string
  type: string
  description?: string
  thumbnail?: string
}

// ============================================================================
// COURSE VERSIONS
// ============================================================================

export interface CourseVersion {
  id: string
  course_id: string
  
  // Version Info
  version_number: string
  version_name?: string
  change_summary?: string
  change_type: VersionChangeType
  
  // Content Snapshot
  content_snapshot: Record<string, any>
  modules_snapshot?: CourseModule[]
  lessons_snapshot?: Lesson[]
  
  // Status
  is_active: boolean
  
  // Metadata
  created_by?: string
  published_at?: string
  retired_at?: string
  created_at: string
}

// ============================================================================
// LEARNING PATHS
// ============================================================================

export interface LearningPath {
  id: string
  
  // Basic Info
  title: string
  slug: string
  description?: string
  short_description?: string
  thumbnail_url?: string
  cover_image_url?: string
  
  // Content
  learning_objectives?: string[]
  target_audience?: string
  career_outcomes?: string
  
  // Course Sequence
  course_sequence: PathCourseItem[]
  total_courses: number
  estimated_hours?: number
  
  // Classification
  difficulty_level: LearningPathDifficulty
  category?: string
  tags?: string[]
  
  // Access Control
  is_published: boolean
  required_tier: CourseTier
  
  // Certification
  certificate_name?: string
  certificate_description?: string
  ce_credits_total?: number
  
  // Stats
  enrollments_count: number
  completions_count: number
  average_rating?: number
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Timestamps
  published_at?: string
  created_at: string
  updated_at: string
}

export interface PathCourseItem {
  course_id: string
  course_title?: string
  course_slug?: string
  order: number
  optional?: boolean
  unlock_after?: string[] // Array of course IDs that must be completed first
  estimated_hours?: number
}

// ============================================================================
// COURSE REVIEWS
// ============================================================================

export interface CourseReview {
  id: string
  course_id: string
  user_id: string
  
  // Review Content
  rating: number // 1-5
  title?: string
  review_text?: string
  
  // Detailed Ratings
  content_quality_rating?: number
  instructor_rating?: number
  value_rating?: number
  difficulty_rating?: number
  
  // Verification
  is_verified_completion: boolean
  completion_date?: string
  
  // Moderation
  is_published: boolean
  is_flagged: boolean
  moderation_notes?: string
  moderated_by?: string
  moderated_at?: string
  
  // Engagement
  helpful_count: number
  reported_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Populated fields (from joins)
  user?: {
    id: string
    display_name?: string
    avatar_url?: string
  }
}

// ============================================================================
// COURSE DISCUSSIONS
// ============================================================================

export interface CourseDiscussion {
  id: string
  course_id: string
  lesson_id?: string
  parent_id?: string
  
  // Author
  user_id: string
  
  // Content
  title?: string
  content: string
  discussion_type: DiscussionType
  
  // Question-specific
  is_answered: boolean
  is_pinned: boolean
  is_instructor_question: boolean
  
  // Engagement
  upvotes_count: number
  replies_count: number
  views_count: number
  
  // Best Answer
  best_answer_id?: string
  marked_as_answer_at?: string
  marked_by?: string
  
  // Moderation
  is_published: boolean
  is_flagged: boolean
  is_locked: boolean
  moderation_notes?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string
  
  // Populated fields (from joins)
  user?: {
    id: string
    display_name?: string
    avatar_url?: string
    role?: string
  }
  replies?: CourseDiscussion[]
  best_answer?: CourseDiscussion
}

// ============================================================================
// ENROLLMENTS
// ============================================================================

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  learning_path_id?: string
  
  // Enrollment Info
  enrollment_date: string
  enrollment_source?: string
  
  // Progress
  status: EnrollmentStatus
  progress_percentage: number
  
  // Completion
  completed_at?: string
  completion_certificate_issued: boolean
  certificate_issued_at?: string
  certificate_id?: string
  
  // Time Tracking
  last_accessed_at?: string
  total_time_spent_minutes: number
  
  // Performance
  average_quiz_score?: number
  quizzes_passed: number
  quizzes_failed: number
  
  // Access Control
  access_expires_at?: string
  is_access_granted: boolean
  
  // Metadata
  enrollment_metadata?: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Populated fields
  course?: {
    id: string
    title: string
    slug: string
    thumbnail_url?: string
    instructor_id?: string
  }
}

// ============================================================================
// LESSON PROGRESS
// ============================================================================

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  enrollment_id?: string
  
  // Status
  status: LessonStatus
  
  // Progress Tracking
  progress_percentage: number
  last_position_seconds?: number
  
  // Completion
  completed_at?: string
  time_spent_seconds: number
  
  // Video-specific
  watch_count: number
  playback_speed: number
  
  // Bookmarks and Notes
  bookmarks?: VideoBookmark[]
  notes?: string
  
  // Timestamps
  first_accessed_at: string
  last_accessed_at: string
  created_at: string
  updated_at: string
  
  // Populated fields
  lesson?: {
    id: string
    title: string
    content_type: ContentType
    video_duration_seconds?: number
  }
}

export interface VideoBookmark {
  id?: string
  timestamp: number
  note?: string
  created_at: string
}

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  lesson_id?: string
  enrollment_id?: string
  
  // Attempt Info
  attempt_number: number
  
  // Responses
  answers: Record<string, any>
  score: number
  percentage: number
  
  // Result
  passed: boolean
  passing_score_percentage: number
  
  // Timing
  started_at: string
  submitted_at?: string
  time_taken_seconds?: number
  
  // Feedback
  feedback?: string
  detailed_results?: QuizQuestionResult[]
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface QuizQuestionResult {
  question_id: string
  question_text: string
  user_answer: any
  correct_answer: any
  is_correct: boolean
  points_earned: number
  points_possible: number
  feedback?: string
}

// ============================================================================
// LEARNING PATH ENROLLMENTS
// ============================================================================

export interface LearningPathEnrollment {
  id: string
  user_id: string
  learning_path_id: string
  
  // Status
  status: EnrollmentStatus
  progress_percentage: number
  
  // Tracking
  courses_completed: number
  courses_total: number
  current_course_id?: string
  
  // Completion
  completed_at?: string
  certificate_issued: boolean
  certificate_id?: string
  
  // Timestamps
  enrolled_at: string
  last_accessed_at?: string
  created_at: string
  updated_at: string
  
  // Populated fields
  learning_path?: LearningPath
  current_course?: {
    id: string
    title: string
    slug: string
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface CourseWithDetails {
  id: string
  title: string
  slug: string
  description?: string
  thumbnail_url?: string
  cover_image_url?: string
  level: CourseLevel
  estimated_duration_minutes?: number
  is_published: boolean
  is_featured: boolean
  required_tier: CourseTier
  enrollments_count: number
  completions_count: number
  average_rating?: number
  total_reviews: number
  
  // Relations
  modules?: CourseModule[]
  lessons?: Lesson[]
  instructor?: {
    id: string
    display_name?: string
    avatar_url?: string
    bio?: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  
  // User-specific (if authenticated)
  user_enrollment?: Enrollment
  user_progress?: number
}

export interface CourseProgress {
  course_id: string
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  last_lesson_id?: string
  last_accessed_at?: string
  time_spent_minutes: number
  quizzes_passed: number
  quizzes_total: number
}

export interface CertificateData {
  certificate_id: string
  user_name: string
  course_title: string
  completion_date: string
  ce_credits?: number
  certificate_url: string
  verification_url: string
  issued_by: string
  valid_until?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface EnrollmentResponse {
  enrollment: Enrollment
  progress: CourseProgress
  next_lesson?: Lesson
  certificate?: CertificateData
}

export interface CourseListResponse {
  courses: CourseWithDetails[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface LearningPathProgress {
  learning_path_id: string
  total_courses: number
  completed_courses: number
  current_course?: CourseWithDetails
  progress_percentage: number
  estimated_time_remaining_hours?: number
}

// ============================================================================
// FORM TYPES (for creating/editing)
// ============================================================================

export interface CreateCourseModuleInput {
  course_id: string
  title: string
  slug: string
  description?: string
  module_number: number
  learning_objectives?: string[]
  estimated_duration_minutes?: number
}

export interface CreateLessonInput {
  course_id: string
  module_id?: string
  title: string
  slug: string
  description?: string
  content_type: ContentType
  content_url?: string
  content_data?: Record<string, any>
  video_duration_seconds?: number
  video_provider?: VideoProvider
  video_id?: string
  lesson_number: number
  sort_order: number
  is_preview?: boolean
}

export interface CreateReviewInput {
  course_id: string
  rating: number
  title?: string
  review_text?: string
  content_quality_rating?: number
  instructor_rating?: number
  value_rating?: number
}

export interface CreateDiscussionInput {
  course_id: string
  lesson_id?: string
  parent_id?: string
  title?: string
  content: string
  discussion_type: DiscussionType
}

export interface UpdateLessonProgressInput {
  lesson_id: string
  status?: LessonStatus
  progress_percentage?: number
  last_position_seconds?: number
  time_spent_seconds?: number
  completed_at?: string
}

export interface SubmitQuizAttemptInput {
  quiz_id: string
  lesson_id?: string
  answers: Record<string, any>
  time_taken_seconds: number
}

// ============================================================================
// QUERY FILTER TYPES
// ============================================================================

export interface CourseFilters {
  category?: string
  level?: CourseLevel
  tier?: CourseTier
  is_featured?: boolean
  instructor_id?: string
  tags?: string[]
  search?: string
  min_rating?: number
  sort_by?: 'popular' | 'recent' | 'rating' | 'title'
  page?: number
  page_size?: number
}

export interface DiscussionFilters {
  course_id?: string
  lesson_id?: string
  discussion_type?: DiscussionType
  is_answered?: boolean
  user_id?: string
  search?: string
  sort_by?: 'recent' | 'popular' | 'unanswered'
  page?: number
  page_size?: number
}

export interface ReviewFilters {
  course_id?: string
  rating?: number
  min_rating?: number
  is_verified_completion?: boolean
  sort_by?: 'recent' | 'helpful' | 'rating'
  page?: number
  page_size?: number
}
