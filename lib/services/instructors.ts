/**
 * Instructors Service
 *
 * Manages instructor profiles, courses, analytics, and communications
 *
 * Phase 4: Content Creation & Management
 * Created: November 8, 2025
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type InstructorStatus = 'pending' | 'active' | 'inactive' | 'suspended'
export type InstructorSpecialization =
  | 'anti_racism'
  | 'equity_diversity_inclusion'
  | 'human_rights'
  | 'workplace_investigations'
  | 'compliance_training'
  | 'leadership_development'
  | 'conflict_resolution'
  | 'policy_development'
  | 'other'

export type CommunicationType =
  | 'announcement'
  | 'course_update'
  | 'direct_message'
  | 'feedback'
  | 'reminder'

export interface Credential {
  credential: string
  issuer: string
  year: number
}

export interface PreviousRole {
  title: string
  organization: string
  years: string
}

export interface Certification {
  name: string
  issuer: string
  number?: string
  expiry_date?: string
}

export interface InstructorProfile {
  id: string
  user_id: string
  bio?: string
  headline?: string
  credentials: Credential[]
  specializations: InstructorSpecialization[]
  years_of_experience?: number
  previous_roles: PreviousRole[]
  certifications: Certification[]
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  teaching_philosophy?: string
  expertise_areas: string[]
  languages_spoken: string[]
  status: InstructorStatus
  approved_by?: string
  approved_at?: string
  allow_student_messages: boolean
  notification_preferences: Record<string, any>
  is_featured: boolean
  display_on_public_profile: boolean
  profile_image_url?: string
  cover_image_url?: string
  video_intro_url?: string
  created_at: string
  updated_at: string
}

export interface CourseInstructor {
  id: string
  course_id: string
  instructor_id: string
  role: 'lead_instructor' | 'instructor' | 'teaching_assistant' | 'guest_speaker'
  is_primary: boolean
  contribution_percentage?: number
  responsibilities?: string
  revenue_share_percentage?: number
  added_at: string
  removed_at?: string
  is_active: boolean
}

export interface InstructorAnalytics {
  id: string
  instructor_id: string
  period_start: string
  period_end: string
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  total_students: number
  new_students: number
  active_students: number
  completed_students: number
  courses_taught: number
  lessons_delivered: number
  total_watch_minutes: number
  avg_completion_rate?: number
  total_discussions: number
  total_questions_answered: number
  avg_response_time_hours?: number
  avg_student_rating?: number
  total_reviews: number
  certificates_issued: number
  total_revenue: number
  currency: string
  student_satisfaction_score?: number
  teaching_effectiveness_score?: number
  created_at: string
}

export interface InstructorCommunication {
  id: string
  instructor_id: string
  course_id?: string
  type: CommunicationType
  subject?: string
  message: string
  recipient_ids: string[]
  recipient_filter?: Record<string, any>
  scheduled_for?: string
  sent_at?: string
  is_draft: boolean
  total_recipients: number
  delivered_count: number
  read_count: number
  failed_count: number
  attachments: Array<{ filename: string; url: string; size: number }>
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

export interface InstructorDashboardSummary {
  instructor_id: string
  user_id: string
  full_name: string
  email: string
  status: InstructorStatus
  headline?: string
  total_courses: number
  published_courses: number
  total_students: number
  avg_course_rating: number
  total_earnings_paid: number
  total_earnings_pending: number
  created_at: string
  updated_at: string
}

export interface InstructorCourseWithStats {
  course_id: string
  title: string
  slug: string
  status: string
  is_published: boolean
  role: string
  enrollments: number
  completions: number
  avg_rating: number
  total_reviews: number
  created_at: string
  published_at?: string
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class InstructorsService {
  // --------------------------------------------------------------------------
  // Profile Management
  // --------------------------------------------------------------------------

  /**
   * Get instructor profile by user ID
   */
  async getProfile(userId: string): Promise<InstructorProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching instructor profile:', error)
      return null
    }

    return data as InstructorProfile
  }

  /**
   * Get instructor profile by instructor ID
   */
  async getProfileById(instructorId: string): Promise<InstructorProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('id', instructorId)
      .single()

    if (error) {
      console.error('Error fetching instructor profile by ID:', error)
      return null
    }

    return data as InstructorProfile
  }

  /**
   * Create instructor profile
   */
  async createProfile(
    userId: string,
    profileData: Partial<InstructorProfile>
  ): Promise<InstructorProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating instructor profile:', error)
      return null
    }

    return data as InstructorProfile
  }

  /**
   * Update instructor profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<InstructorProfile>
  ): Promise<InstructorProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating instructor profile:', error)
      return null
    }

    return data as InstructorProfile
  }

  /**
   * Approve instructor
   */
  async approveInstructor(
    instructorId: string,
    approvedBy: string
  ): Promise<InstructorProfile | null> {
    return this.updateProfileById(instructorId, {
      status: 'active',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
  }

  /**
   * Update instructor profile by instructor ID
   */
  async updateProfileById(
    instructorId: string,
    updates: Partial<InstructorProfile>
  ): Promise<InstructorProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .update(updates)
      .eq('id', instructorId)
      .select()
      .single()

    if (error) {
      console.error('Error updating instructor profile:', error)
      return null
    }

    return data as InstructorProfile
  }

  /**
   * Get all active instructors
   */
  async getActiveInstructors(): Promise<any[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('active_instructors')
      .select('*')
      .order('total_students', { ascending: false })

    if (error) {
      console.error('Error fetching active instructors:', error)
      return []
    }

    return data
  }

  /**
   * Get featured instructors
   */
  async getFeaturedInstructors(limit: number = 6): Promise<InstructorProfile[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_profiles')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .eq('display_on_public_profile', true)
      .limit(limit)

    if (error) {
      console.error('Error fetching featured instructors:', error)
      return []
    }

    return data as InstructorProfile[]
  }

  // --------------------------------------------------------------------------
  // Course Assignments
  // --------------------------------------------------------------------------

  /**
   * Assign instructor to course
   */
  async assignToCourse(
    courseId: string,
    instructorId: string,
    role: CourseInstructor['role'] = 'instructor',
    isPrimary: boolean = false,
    revenueShare?: number
  ): Promise<CourseInstructor | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('course_instructors')
      .insert({
        course_id: courseId,
        instructor_id: instructorId,
        role,
        is_primary: isPrimary,
        revenue_share_percentage: revenueShare,
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning instructor to course:', error)
      return null
    }

    return data as CourseInstructor
  }

  /**
   * Remove instructor from course
   */
  async removeFromCourse(courseId: string, instructorId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('course_instructors')
      .update({
        is_active: false,
        removed_at: new Date().toISOString(),
      })
      .eq('course_id', courseId)
      .eq('instructor_id', instructorId)

    if (error) {
      console.error('Error removing instructor from course:', error)
      return false
    }

    return true
  }

  /**
   * Get instructors for a course
   */
  async getCourseInstructors(courseId: string): Promise<any[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('course_instructors')
      .select(
        `
        *,
        instructor:instructor_id (
          id,
          user_id,
          bio,
          headline,
          profile_image_url,
          specializations,
          years_of_experience
        )
      `
      )
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching course instructors:', error)
      return []
    }

    return data
  }

  // --------------------------------------------------------------------------
  // Analytics & Dashboard
  // --------------------------------------------------------------------------

  /**
   * Get instructor dashboard summary
   */
  async getDashboardSummary(userId: string): Promise<InstructorDashboardSummary | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_dashboard_summary')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching dashboard summary:', error)
      return null
    }

    return data as InstructorDashboardSummary
  }

  /**
   * Get instructor courses with stats
   */
  async getInstructorCourses(instructorId: string): Promise<InstructorCourseWithStats[]> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_instructor_courses', {
      p_instructor_id: instructorId,
    })

    if (error) {
      console.error('Error fetching instructor courses:', error)
      return []
    }

    return data as InstructorCourseWithStats[]
  }

  /**
   * Get instructor analytics
   */
  async getAnalytics(instructorId: string, startDate?: string, endDate?: string): Promise<any> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_instructor_analytics', {
      p_instructor_id: instructorId,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    })

    if (error) {
      console.error('Error fetching instructor analytics:', error)
      return null
    }

    return data[0]
  }

  /**
   * Get instructor analytics time series
   */
  async getAnalyticsTimeSeries(
    instructorId: string,
    periodType: InstructorAnalytics['period_type'] = 'monthly',
    limit: number = 12
  ): Promise<InstructorAnalytics[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_analytics')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching analytics time series:', error)
      return []
    }

    return (data as InstructorAnalytics[]).reverse() // Return in chronological order
  }

  /**
   * Calculate teaching effectiveness score
   */
  async getTeachingEffectiveness(instructorId: string): Promise<number> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('calculate_instructor_effectiveness', {
      p_instructor_id: instructorId,
    })

    if (error) {
      console.error('Error calculating effectiveness:', error)
      return 0
    }

    return data as number
  }

  // --------------------------------------------------------------------------
  // Communications
  // --------------------------------------------------------------------------

  /**
   * Send message to students
   */
  async sendMessage(
    instructorId: string,
    courseId: string,
    type: CommunicationType,
    subject: string,
    message: string,
    recipientFilter?: Record<string, any>
  ): Promise<{ success: boolean; message_id?: string; recipient_count?: number }> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('send_instructor_message', {
      p_instructor_id: instructorId,
      p_course_id: courseId,
      p_type: type,
      p_subject: subject,
      p_message: message,
      p_recipient_filter: recipientFilter || null,
    })

    if (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }

    return data[0] as { success: boolean; message_id: string; recipient_count: number }
  }

  /**
   * Create draft message
   */
  async createDraftMessage(
    instructorId: string,
    messageData: Partial<InstructorCommunication>
  ): Promise<InstructorCommunication | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_communications')
      .insert({
        instructor_id: instructorId,
        is_draft: true,
        ...messageData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating draft message:', error)
      return null
    }

    return data as InstructorCommunication
  }

  /**
   * Get instructor messages
   */
  async getMessages(
    instructorId: string,
    includeDrafts: boolean = false
  ): Promise<InstructorCommunication[]> {
    const supabase = createClient()

    let query = supabase
      .from('instructor_communications')
      .select('*')
      .eq('instructor_id', instructorId)

    if (!includeDrafts) {
      query = query.eq('is_draft', false)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data as InstructorCommunication[]
  }

  // --------------------------------------------------------------------------
  // Revenue & Earnings
  // --------------------------------------------------------------------------

  /**
   * Get instructor earnings summary
   */
  async getEarningsSummary(instructorId: string): Promise<{
    total_gross: number
    total_net: number
    pending: number
    paid: number
  }> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_earnings')
      .select('gross_amount, net_amount, payout_status')
      .eq('instructor_id', instructorId)

    if (error) {
      console.error('Error fetching earnings:', error)
      return { total_gross: 0, total_net: 0, pending: 0, paid: 0 }
    }

    const summary = data.reduce(
      (acc: any, row: any) => {
        acc.total_gross += parseFloat(row.gross_amount)
        acc.total_net += parseFloat(row.net_amount)
        if (row.payout_status === 'paid') {
          acc.paid += parseFloat(row.net_amount)
        } else if (row.payout_status === 'pending') {
          acc.pending += parseFloat(row.net_amount)
        }
        return acc
      },
      { total_gross: 0, total_net: 0, pending: 0, paid: 0 }
    )

    return summary
  }

  /**
   * Get instructor earnings by course
   */
  async getEarningsByCourse(instructorId: string): Promise<any[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('instructor_earnings')
      .select(
        `
        course_id,
        gross_amount,
        net_amount,
        payout_status,
        transaction_date,
        courses:course_id (
          title,
          slug
        )
      `
      )
      .eq('instructor_id', instructorId)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching earnings by course:', error)
      return []
    }

    return data
  }

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  /**
   * Check if user is an instructor
   */
  async isInstructor(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    return profile !== null && profile.status === 'active'
  }

  /**
   * Get instructor specializations (formatted)
   */
  formatSpecializations(specializations: InstructorSpecialization[]): string[] {
    const map: Record<InstructorSpecialization, string> = {
      anti_racism: 'Anti-Racism',
      equity_diversity_inclusion: 'Equity, Diversity & Inclusion',
      human_rights: 'Human Rights',
      workplace_investigations: 'Workplace Investigations',
      compliance_training: 'Compliance Training',
      leadership_development: 'Leadership Development',
      conflict_resolution: 'Conflict Resolution',
      policy_development: 'Policy Development',
      other: 'Other',
    }

    return specializations.map((s) => map[s] || s)
  }

  /**
   * Get instructor status badge color
   */
  getStatusColor(status: InstructorStatus): string {
    const colors: Record<InstructorStatus, string> = {
      pending: 'yellow',
      active: 'green',
      inactive: 'gray',
      suspended: 'red',
    }

    return colors[status] || 'gray'
  }
}

// Export singleton instance
export const instructorsService = new InstructorsService()

// Named export for type checking
export default instructorsService
