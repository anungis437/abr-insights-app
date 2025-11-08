/**
 * AI-Powered Personalization Service
 * 
 * Provides intelligent learning path recommendations, adaptive content delivery,
 * completion time predictions, and smart notifications based on user behavior.
 * 
 * Features:
 * - Learning path recommendations (skill-based, progress-based)
 * - Adaptive content difficulty adjustment
 * - Completion time predictions with confidence intervals
 * - Smart notification scheduling based on engagement patterns
 * - Skill gap analysis and remediation suggestions
 */

import { supabase } from '@/lib/supabase'

// =====================================================
// Types & Interfaces
// =====================================================

export interface UserSkillProfile {
  userId: string
  strengths: SkillArea[]
  weaknesses: SkillArea[]
  learningPace: 'fast' | 'moderate' | 'slow'
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic'
  averageQuizScore: number
  averageTimePerModule: number // minutes
  consistencyScore: number // 0-100
  lastActiveDate: Date
}

export interface SkillArea {
  skill: string
  proficiency: number // 0-100
  modulesCovered: number
  averageScore: number
  confidence: number // 0-1
}

export interface LearningPathRecommendation {
  courseId: string
  courseName: string
  relevanceScore: number // 0-100
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // hours
  matchReasons: string[]
  prerequisitesMet: boolean
  potentialSkillGains: string[]
}

export interface AdaptiveContentSuggestion {
  action: 'skip' | 'review' | 'supplement' | 'continue'
  moduleId: string
  reason: string
  supplementalContent?: {
    type: 'video' | 'reading' | 'practice'
    url: string
    title: string
  }[]
}

export interface CompletionPrediction {
  courseId: string
  estimatedCompletionDate: Date
  confidenceInterval: {
    earliest: Date
    latest: Date
  }
  confidence: number // 0-1
  remainingModules: number
  estimatedHoursRemaining: number
}

export interface SmartNotification {
  type: 'reminder' | 'milestone' | 'suggestion' | 'encouragement'
  title: string
  message: string
  scheduledFor: Date
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export interface EngagementPattern {
  bestDayOfWeek: string[]
  bestTimeOfDay: string[] // e.g., ['morning', 'evening']
  averageSessionLength: number // minutes
  preferredDays: number[] // 0-6 (Sunday-Saturday)
  optimalReminderTime: string // HH:MM format
}

// =====================================================
// User Skill Profile Analysis
// =====================================================

/**
 * Analyze user's skill profile based on progress and quiz performance
 */
export async function analyzeUserSkillProfile(userId: string): Promise<UserSkillProfile> {
  // Using imported supabase instance

  // Fetch user's course progress and quiz attempts
  const { data: progressData } = await supabase
    .from('user_course_progress')
    .select(`
      *,
      courses (
        id,
        title,
        category,
        difficulty
      )
    `)
    .eq('user_id', userId)

  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (!progressData || !quizAttempts) {
    throw new Error('Failed to fetch user data')
  }

  // Calculate average quiz score
  const avgQuizScore = quizAttempts.length > 0
    ? quizAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / quizAttempts.length
    : 0

  // Analyze skill areas (by course category)
  const skillAreas: Record<string, { scores: number[]; modules: number }> = {}
  
  progressData.forEach((progress) => {
    const category = (progress.courses as any)?.category || 'general'
    if (!skillAreas[category]) {
      skillAreas[category] = { scores: [], modules: 0 }
    }
    
    // Find quiz attempts for this course
    const courseQuizzes = quizAttempts.filter(
      (attempt) => attempt.quiz_id?.startsWith(progress.course_id)
    )
    
    if (courseQuizzes.length > 0) {
      const avgScore = courseQuizzes.reduce((acc, q) => acc + q.score, 0) / courseQuizzes.length
      skillAreas[category].scores.push(avgScore)
    }
    
    skillAreas[category].modules++
  })

  // Identify strengths and weaknesses
  const strengths: SkillArea[] = []
  const weaknesses: SkillArea[] = []

  Object.entries(skillAreas).forEach(([skill, data]) => {
    const avgScore = data.scores.length > 0
      ? data.scores.reduce((acc, score) => acc + score, 0) / data.scores.length
      : 0
    
    const confidence = Math.min(data.scores.length / 5, 1) // More data = higher confidence

    const skillArea: SkillArea = {
      skill,
      proficiency: avgScore,
      modulesCovered: data.modules,
      averageScore: avgScore,
      confidence,
    }

    if (avgScore >= 80) {
      strengths.push(skillArea)
    } else if (avgScore < 60 && data.scores.length >= 2) {
      weaknesses.push(skillArea)
    }
  })

  // Calculate learning pace
  const completedCourses = progressData.filter((p) => p.progress_percentage === 100)
  const avgTimePerModule = completedCourses.length > 0
    ? completedCourses.reduce((acc, p) => {
        const timeTaken = p.last_accessed_at
          ? new Date(p.last_accessed_at).getTime() - new Date(p.enrollment_date).getTime()
          : 0
        return acc + timeTaken
      }, 0) / completedCourses.length / (1000 * 60) // Convert to minutes
    : 60 // Default 60 minutes

  const learningPace: 'fast' | 'moderate' | 'slow' = 
    avgTimePerModule < 30 ? 'fast' :
    avgTimePerModule < 60 ? 'moderate' : 'slow'

  // Calculate consistency score (based on regular engagement)
  const recentProgress = progressData.filter((p) => {
    const lastAccess = new Date(p.last_accessed_at || p.enrollment_date)
    const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceAccess <= 30
  })
  const consistencyScore = Math.min((recentProgress.length / 10) * 100, 100)

  // Determine preferred learning style (placeholder - would need more data)
  const preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' = 'visual'

  return {
    userId,
    strengths,
    weaknesses,
    learningPace,
    preferredLearningStyle,
    averageQuizScore: avgQuizScore,
    averageTimePerModule: avgTimePerModule,
    consistencyScore,
    lastActiveDate: progressData.length > 0
      ? new Date(Math.max(...progressData.map((p) => new Date(p.last_accessed_at || p.enrollment_date).getTime())))
      : new Date(),
  }
}

// =====================================================
// Learning Path Recommendations
// =====================================================

/**
 * Generate personalized course recommendations
 */
export async function generateLearningPathRecommendations(
  userId: string,
  limit: number = 5
): Promise<LearningPathRecommendation[]> {
  // Using imported supabase instance
  const skillProfile = await analyzeUserSkillProfile(userId)

  // Fetch all available courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)

  if (!courses) return []

  // Fetch user's enrolled courses
  const { data: enrolledCourses } = await supabase
    .from('user_course_progress')
    .select('course_id')
    .eq('user_id', userId)

  const enrolledCourseIds = new Set(enrolledCourses?.map((e) => e.course_id) || [])

  // Score each course based on relevance
  const recommendations: LearningPathRecommendation[] = courses
    .filter((course) => !enrolledCourseIds.has(course.id))
    .map((course) => {
      let relevanceScore = 50 // Base score
      const matchReasons: string[] = []
      const potentialSkillGains: string[] = []

      // Match with weaknesses (high priority)
      const weaknessMatch = skillProfile.weaknesses.find((w) => 
        course.category === w.skill || course.title.toLowerCase().includes(w.skill.toLowerCase())
      )
      if (weaknessMatch) {
        relevanceScore += 30
        matchReasons.push(`Addresses weakness in ${weaknessMatch.skill}`)
        potentialSkillGains.push(`Improve ${weaknessMatch.skill} proficiency`)
      }

      // Match with strengths (medium priority - advanced content)
      const strengthMatch = skillProfile.strengths.find((s) =>
        course.category === s.skill || course.title.toLowerCase().includes(s.skill.toLowerCase())
      )
      if (strengthMatch && course.difficulty === 'advanced') {
        relevanceScore += 20
        matchReasons.push(`Builds on existing strength in ${strengthMatch.skill}`)
        potentialSkillGains.push(`Master advanced ${strengthMatch.skill} concepts`)
      }

      // Adjust for difficulty level
      if (course.difficulty === 'beginner' && skillProfile.averageQuizScore < 60) {
        relevanceScore += 15
        matchReasons.push('Beginner-friendly content recommended for your level')
      } else if (course.difficulty === 'advanced' && skillProfile.averageQuizScore >= 85) {
        relevanceScore += 15
        matchReasons.push('Advanced content matches your expertise')
      }

      // Trending courses
      if (course.enrollment_count && course.enrollment_count > 100) {
        relevanceScore += 10
        matchReasons.push('Popular course with high enrollment')
      }

      // Prerequisites check (placeholder - would need course relationships)
      const prerequisitesMet = true

      return {
        courseId: course.id,
        courseName: course.title,
        relevanceScore: Math.min(relevanceScore, 100),
        difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimatedDuration: course.duration_hours || 5,
        matchReasons,
        prerequisitesMet,
        potentialSkillGains,
      }
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)

  return recommendations
}

// =====================================================
// Adaptive Content Delivery
// =====================================================

/**
 * Suggest content adaptations based on user performance
 */
export async function generateAdaptiveContentSuggestions(
  userId: string,
  courseId: string,
  currentModuleId: string
): Promise<AdaptiveContentSuggestion[]> {
  // Using imported supabase instance

  // Fetch user's quiz performance for this course
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .ilike('quiz_id', `${courseId}%`)
    .order('completed_at', { ascending: false })
    .limit(5)

  if (!quizAttempts || quizAttempts.length === 0) {
    return [{
      action: 'continue',
      moduleId: currentModuleId,
      reason: 'Continue at your own pace',
    }]
  }

  const avgRecentScore = quizAttempts.reduce((acc, q) => acc + q.score, 0) / quizAttempts.length

  const suggestions: AdaptiveContentSuggestion[] = []

  // High performer - suggest skipping basics
  if (avgRecentScore >= 90) {
    suggestions.push({
      action: 'skip',
      moduleId: currentModuleId,
      reason: 'Your quiz scores indicate strong mastery (90%+). You may skip introductory content.',
    })
  }

  // Struggling learner - suggest review or supplemental content
  if (avgRecentScore < 60) {
    suggestions.push({
      action: 'review',
      moduleId: currentModuleId,
      reason: 'Quiz scores below 60% suggest reviewing previous material.',
      supplementalContent: [
        {
          type: 'video',
          url: `/courses/${courseId}/resources/review`,
          title: 'Review: Core Concepts',
        },
        {
          type: 'practice',
          url: `/courses/${courseId}/practice`,
          title: 'Practice Exercises',
        },
      ],
    })
  }

  // Moderate performer - continue with optional supplements
  if (avgRecentScore >= 60 && avgRecentScore < 90) {
    suggestions.push({
      action: 'continue',
      moduleId: currentModuleId,
      reason: 'You\'re progressing well. Continue with the course.',
      supplementalContent: [
        {
          type: 'reading',
          url: `/courses/${courseId}/resources/extended`,
          title: 'Extended Reading Materials',
        },
      ],
    })
  }

  return suggestions
}

// =====================================================
// Completion Time Predictions
// =====================================================

/**
 * Predict course completion date based on user's pace
 */
export async function predictCompletionTime(
  userId: string,
  courseId: string
): Promise<CompletionPrediction> {
  // Using imported supabase instance

  // Fetch course details
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  // Fetch user's progress
  const { data: progress } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  // Fetch user's skill profile for pace
  const skillProfile = await analyzeUserSkillProfile(userId)

  if (!course || !progress) {
    throw new Error('Course or progress not found')
  }

  const totalModules = course.module_count || 10
  const completedModules = Math.floor((progress.progress_percentage / 100) * totalModules)
  const remainingModules = totalModules - completedModules

  // Estimate hours remaining based on user's pace
  const hoursPerModule = skillProfile.averageTimePerModule / 60
  const estimatedHoursRemaining = remainingModules * hoursPerModule

  // Calculate estimated completion date
  const averageHoursPerWeek = skillProfile.consistencyScore >= 70 ? 5 : 
                               skillProfile.consistencyScore >= 40 ? 3 : 1
  
  const weeksToComplete = estimatedHoursRemaining / averageHoursPerWeek
  const daysToComplete = weeksToComplete * 7

  const estimatedCompletionDate = new Date()
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysToComplete)

  // Calculate confidence interval (+/- 30%)
  const earliestDate = new Date()
  earliestDate.setDate(earliestDate.getDate() + daysToComplete * 0.7)

  const latestDate = new Date()
  latestDate.setDate(latestDate.getDate() + daysToComplete * 1.3)

  // Confidence based on consistency
  const confidence = skillProfile.consistencyScore / 100

  return {
    courseId,
    estimatedCompletionDate,
    confidenceInterval: {
      earliest: earliestDate,
      latest: latestDate,
    },
    confidence,
    remainingModules,
    estimatedHoursRemaining,
  }
}

// =====================================================
// Smart Notifications
// =====================================================

/**
 * Analyze user's engagement patterns
 */
export async function analyzeEngagementPatterns(userId: string): Promise<EngagementPattern> {
  // Using imported supabase instance

  // Fetch user's progress access history
  const { data: progressData } = await supabase
    .from('user_course_progress')
    .select('last_accessed_at, enrollment_date')
    .eq('user_id', userId)
    .not('last_accessed_at', 'is', null)
    .order('last_accessed_at', { ascending: false })
    .limit(50)

  if (!progressData || progressData.length === 0) {
    // Default pattern for new users
    return {
      bestDayOfWeek: ['Monday', 'Wednesday'],
      bestTimeOfDay: ['evening'],
      averageSessionLength: 30,
      preferredDays: [1, 3], // Monday, Wednesday
      optimalReminderTime: '18:00',
    }
  }

  // Analyze access times
  const dayCount: Record<number, number> = {}
  const hourCount: Record<number, number> = {}

  progressData.forEach((p) => {
    const date = new Date(p.last_accessed_at!)
    const day = date.getDay()
    const hour = date.getHours()

    dayCount[day] = (dayCount[day] || 0) + 1
    hourCount[hour] = (hourCount[hour] || 0) + 1
  })

  // Find best days
  const preferredDays = Object.entries(dayCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([day]) => parseInt(day))

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const bestDayOfWeek = preferredDays.map((day) => dayNames[day])

  // Find best time of day
  const bestHours = Object.entries(hourCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour))

  const bestTimeOfDay: string[] = []
  if (bestHours.some((h) => h >= 6 && h < 12)) bestTimeOfDay.push('morning')
  if (bestHours.some((h) => h >= 12 && h < 17)) bestTimeOfDay.push('afternoon')
  if (bestHours.some((h) => h >= 17 && h < 22)) bestTimeOfDay.push('evening')

  // Optimal reminder time (1 hour before peak time)
  const peakHour = Math.max(...bestHours)
  const reminderHour = Math.max(peakHour - 1, 8) // Earliest 8 AM
  const optimalReminderTime = `${reminderHour.toString().padStart(2, '0')}:00`

  // Average session length (placeholder - would need session tracking)
  const averageSessionLength = 30

  return {
    bestDayOfWeek,
    bestTimeOfDay,
    averageSessionLength,
    preferredDays,
    optimalReminderTime,
  }
}

/**
 * Generate smart notifications based on user behavior
 */
export async function generateSmartNotifications(userId: string): Promise<SmartNotification[]> {
  // Using imported supabase instance
  const skillProfile = await analyzeUserSkillProfile(userId)
  const engagementPattern = await analyzeEngagementPatterns(userId)

  const notifications: SmartNotification[] = []
  const now = new Date()

  // Check for inactivity
  const daysSinceLastActive = (now.getTime() - skillProfile.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceLastActive >= 7 && daysSinceLastActive < 14) {
    // Gentle reminder for 1-week inactivity
    const reminderDate = new Date()
    const nextPreferredDay = engagementPattern.preferredDays[0]
    const daysUntilPreferredDay = (nextPreferredDay - reminderDate.getDay() + 7) % 7
    reminderDate.setDate(reminderDate.getDate() + daysUntilPreferredDay)
    reminderDate.setHours(parseInt(engagementPattern.optimalReminderTime.split(':')[0]), 0, 0, 0)

    notifications.push({
      type: 'reminder',
      title: 'We miss you!',
      message: `It's been a week since your last session. Ready to continue your learning journey?`,
      scheduledFor: reminderDate,
      priority: 'medium',
      actionUrl: '/dashboard',
    })
  } else if (daysSinceLastActive >= 14) {
    // Stronger encouragement for 2-week+ inactivity
    notifications.push({
      type: 'encouragement',
      title: 'Come back and learn!',
      message: `You've made great progress so far. Let's keep the momentum going!`,
      scheduledFor: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Tomorrow
      priority: 'high',
      actionUrl: '/dashboard',
    })
  }

  // Fetch user's in-progress courses
  const { data: inProgressCourses } = await supabase
    .from('user_course_progress')
    .select(`
      *,
      courses (
        id,
        title
      )
    `)
    .eq('user_id', userId)
    .gt('progress_percentage', 0)
    .lt('progress_percentage', 100)

  // Milestone notifications for courses close to completion
  if (inProgressCourses) {
    inProgressCourses.forEach((progress) => {
      if (progress.progress_percentage >= 80 && progress.progress_percentage < 100) {
        notifications.push({
          type: 'milestone',
          title: 'Almost there!',
          message: `You're ${progress.progress_percentage}% done with "${(progress.courses as any)?.title}". Finish strong!`,
          scheduledFor: new Date(now.getTime() + 1000 * 60 * 60 * 2), // 2 hours from now
          priority: 'high',
          actionUrl: `/courses/${progress.course_id}`,
        })
      }
    })
  }

  // Get personalized recommendations
  const recommendations = await generateLearningPathRecommendations(userId, 3)
  
  if (recommendations.length > 0 && skillProfile.consistencyScore >= 70) {
    // Suggest new courses for consistent learners
    const topRecommendation = recommendations[0]
    const suggestionDate = new Date()
    suggestionDate.setDate(suggestionDate.getDate() + 3) // 3 days from now
    suggestionDate.setHours(parseInt(engagementPattern.optimalReminderTime.split(':')[0]), 0, 0, 0)

    notifications.push({
      type: 'suggestion',
      title: 'New course recommendation',
      message: `Based on your progress, we think you'll love "${topRecommendation.courseName}"`,
      scheduledFor: suggestionDate,
      priority: 'low',
      actionUrl: `/courses/${topRecommendation.courseId}`,
    })
  }

  return notifications.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
}

