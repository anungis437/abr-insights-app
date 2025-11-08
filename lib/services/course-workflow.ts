/**
 * Course Workflow Service
 * 
 * Manages course development pipeline including:
 * - Version control and history
 * - Review workflows (peer, compliance, QA)
 * - Publishing pipeline
 * - Quality checklists
 * 
 * Phase 4: Content Creation & Management
 * Created: November 8, 2025
 */

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type WorkflowStatus = 'draft' | 'in_review' | 'needs_revision' | 'approved' | 'published' | 'archived';
export type ReviewDecision = 'approve' | 'reject' | 'request_changes';
export type ReviewType = 'peer_review' | 'compliance_review' | 'accessibility_review' | 'quality_assurance';

export interface CourseVersion {
  id: string;
  course_id: string;
  version_number: string;
  change_summary?: string;
  is_major_update: boolean;
  content_snapshot: Record<string, any>;
  created_by: string;
  created_at: string;
  published_at?: string;
  published_by?: string;
  file_checksums?: Record<string, any>;
  dependencies?: Record<string, any>;
}

export interface CourseReview {
  id: string;
  course_id: string;
  version_id?: string;
  review_type: ReviewType;
  reviewer_id: string;
  decision?: ReviewDecision;
  comments?: string;
  quality_score?: number; // 1-5
  checklist_results?: Record<string, any>;
  issues_found?: Array<{
    severity: 'critical' | 'major' | 'minor';
    category: string;
    description: string;
    timestamp: string;
  }>;
  recommendations?: string;
  assigned_at: string;
  completed_at?: string;
  due_date?: string;
  is_completed: boolean;
  is_blocking: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  course_id: string;
  from_status?: WorkflowStatus;
  to_status: WorkflowStatus;
  changed_by: string;
  changed_by_name?: string;
  changed_by_email?: string;
  reason?: string;
  notes?: string;
  version_at_change?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface QualityChecklist {
  id: string;
  course_id: string;
  version_id?: string;
  
  // Accessibility
  accessibility_wcag_aa?: boolean;
  accessibility_captions?: boolean;
  accessibility_transcripts?: boolean;
  accessibility_keyboard_nav?: boolean;
  accessibility_screen_reader?: boolean;
  
  // Bilingual
  bilingual_en_available?: boolean;
  bilingual_fr_available?: boolean;
  
  // Video quality
  video_quality_standards?: boolean;
  video_audio_clarity?: boolean;
  video_encoding_correct?: boolean;
  
  // Technical
  mobile_responsive?: boolean;
  cross_browser_tested?: boolean;
  
  // Content quality
  learning_objectives_clear?: boolean;
  assessments_valid?: boolean;
  content_accurate?: boolean;
  references_cited?: boolean;
  
  // Compliance
  regulatory_compliance?: boolean;
  privacy_compliant?: boolean;
  copyright_cleared?: boolean;
  
  // Summary
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  
  checked_by?: string;
  checked_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseWorkflowSummary {
  course_id: string;
  title: string;
  slug: string;
  workflow_status: WorkflowStatus;
  version_number: string;
  is_published: boolean;
  published_at?: string;
  instructor_name?: string;
  instructor_email?: string;
  total_reviews: number;
  completed_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  quality_checklist_completion?: number;
  version_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class CourseWorkflowService {
  
  // --------------------------------------------------------------------------
  // Workflow State Management
  // --------------------------------------------------------------------------
  
  /**
   * Submit course for review
   */
  async submitForReview(
    courseId: string,
    submittedBy: string,
    submissionNotes?: string
  ): Promise<{ success: boolean; message: string; review_id?: string }> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('submit_course_for_review', {
      p_course_id: courseId,
      p_submitted_by: submittedBy,
      p_submission_notes: submissionNotes || null
    });
    
    if (error) {
      console.error('Error submitting course for review:', error);
      return { success: false, message: error.message };
    }
    
    return data[0] as { success: boolean; message: string; review_id?: string };
  }
  
  /**
   * Approve course
   */
  async approveCourse(
    courseId: string,
    reviewerId: string,
    comments?: string
  ): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('approve_course', {
      p_course_id: courseId,
      p_reviewer_id: reviewerId,
      p_comments: comments || null
    });
    
    if (error) {
      console.error('Error approving course:', error);
      return { success: false, message: error.message };
    }
    
    return data[0] as { success: boolean; message: string };
  }
  
  /**
   * Reject course (send back for revision)
   */
  async rejectCourse(
    courseId: string,
    reviewerId: string,
    rejectionReason: string
  ): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('reject_course', {
      p_course_id: courseId,
      p_reviewer_id: reviewerId,
      p_rejection_reason: rejectionReason
    });
    
    if (error) {
      console.error('Error rejecting course:', error);
      return { success: false, message: error.message };
    }
    
    return data[0] as { success: boolean; message: string };
  }
  
  /**
   * Publish course
   */
  async publishCourse(
    courseId: string,
    publishedBy: string
  ): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('publish_course', {
      p_course_id: courseId,
      p_published_by: publishedBy
    });
    
    if (error) {
      console.error('Error publishing course:', error);
      return { success: false, message: error.message };
    }
    
    return data[0] as { success: boolean; message: string };
  }
  
  /**
   * Get workflow history for a course
   */
  async getWorkflowHistory(courseId: string): Promise<WorkflowHistoryEntry[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('get_course_workflow_history', {
      p_course_id: courseId
    });
    
    if (error) {
      console.error('Error fetching workflow history:', error);
      return [];
    }
    
    return data as WorkflowHistoryEntry[];
  }
  
  // --------------------------------------------------------------------------
  // Version Control
  // --------------------------------------------------------------------------
  
  /**
   * Create a new version snapshot
   */
  async createVersion(
    courseId: string,
    versionNumber: string,
    createdBy: string,
    changeSummary?: string,
    isMajorUpdate: boolean = false
  ): Promise<CourseVersion | null> {
    const supabase = createClient();
    
    // Get current course data
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (!course) return null;
    
    // Create content snapshot
    const contentSnapshot = {
      title: course.title,
      description: course.description,
      learning_objectives: course.learning_objectives,
      prerequisites: course.prerequisites,
      tags: course.tags,
      level: course.level,
      estimated_duration_minutes: course.estimated_duration_minutes,
      meta_title: course.meta_title,
      meta_description: course.meta_description
    };
    
    const { data, error } = await supabase
      .from('course_versions')
      .insert({
        course_id: courseId,
        version_number: versionNumber,
        change_summary: changeSummary,
        is_major_update: isMajorUpdate,
        content_snapshot: contentSnapshot,
        created_by: createdBy
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating version:', error);
      return null;
    }
    
    // Update course version number
    await supabase
      .from('courses')
      .update({ version_number: versionNumber })
      .eq('id', courseId);
    
    return data as CourseVersion;
  }
  
  /**
   * Get all versions for a course
   */
  async getVersions(courseId: string): Promise<CourseVersion[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_versions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
    
    return data as CourseVersion[];
  }
  
  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<CourseVersion | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_versions')
      .select('*')
      .eq('id', versionId)
      .single();
    
    if (error) {
      console.error('Error fetching version:', error);
      return null;
    }
    
    return data as CourseVersion;
  }
  
  // --------------------------------------------------------------------------
  // Reviews
  // --------------------------------------------------------------------------
  
  /**
   * Create a review for a course
   */
  async createReview(
    courseId: string,
    reviewType: ReviewType,
    reviewerId: string,
    dueDate?: string,
    isBlocking: boolean = false
  ): Promise<CourseReview | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_reviews')
      .insert({
        course_id: courseId,
        review_type: reviewType,
        reviewer_id: reviewerId,
        due_date: dueDate,
        is_blocking: isBlocking
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating review:', error);
      return null;
    }
    
    return data as CourseReview;
  }
  
  /**
   * Complete a review
   */
  async completeReview(
    reviewId: string,
    decision: ReviewDecision,
    comments?: string,
    qualityScore?: number,
    issuesFound?: CourseReview['issues_found']
  ): Promise<CourseReview | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_reviews')
      .update({
        decision,
        comments,
        quality_score: qualityScore,
        issues_found: issuesFound,
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) {
      console.error('Error completing review:', error);
      return null;
    }
    
    return data as CourseReview;
  }
  
  /**
   * Get reviews for a course
   */
  async getReviews(courseId: string): Promise<CourseReview[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('assigned_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    
    return data as CourseReview[];
  }
  
  /**
   * Get pending reviews for a reviewer
   */
  async getPendingReviews(reviewerId: string): Promise<CourseReview[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          slug,
          workflow_status,
          version_number
        )
      `)
      .eq('reviewer_id', reviewerId)
      .eq('is_completed', false)
      .order('due_date', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }
    
    return data as any[];
  }
  
  // --------------------------------------------------------------------------
  // Quality Checklists
  // --------------------------------------------------------------------------
  
  /**
   * Create or update quality checklist
   */
  async updateQualityChecklist(
    courseId: string,
    checklistData: Partial<QualityChecklist>,
    checkedBy: string
  ): Promise<QualityChecklist | null> {
    const supabase = createClient();
    
    // Check if checklist exists
    const { data: existing } = await supabase
      .from('content_quality_checklists')
      .select('id')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const payload = {
      ...checklistData,
      course_id: courseId,
      checked_by: checkedBy,
      checked_at: new Date().toISOString()
    };
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('content_quality_checklists')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating checklist:', error);
        return null;
      }
      
      return data as QualityChecklist;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('content_quality_checklists')
        .insert(payload)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating checklist:', error);
        return null;
      }
      
      return data as QualityChecklist;
    }
  }
  
  /**
   * Get quality checklist for a course
   */
  async getQualityChecklist(courseId: string): Promise<QualityChecklist | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('content_quality_checklists')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching checklist:', error);
      return null;
    }
    
    return data as QualityChecklist;
  }
  
  // --------------------------------------------------------------------------
  // Views & Summaries
  // --------------------------------------------------------------------------
  
  /**
   * Get courses pending review
   */
  async getCoursesPendingReview(): Promise<any[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('courses_pending_review')
      .select('*');
    
    if (error) {
      console.error('Error fetching pending courses:', error);
      return [];
    }
    
    return data;
  }
  
  /**
   * Get workflow summary for all courses or specific course
   */
  async getWorkflowSummary(courseId?: string): Promise<CourseWorkflowSummary[]> {
    const supabase = createClient();
    
    let query = supabase.from('course_workflow_summary').select('*');
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching workflow summary:', error);
      return [];
    }
    
    return data as CourseWorkflowSummary[];
  }
  
  /**
   * Get courses by workflow status
   */
  async getCoursesByStatus(status: WorkflowStatus): Promise<any[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        workflow_status,
        version_number,
        submission_notes,
        rejection_reason,
        reviewed_by,
        reviewed_at,
        published_by,
        published_at,
        updated_at,
        instructor:instructor_id (
          id,
          full_name,
          email
        )
      `)
      .eq('workflow_status', status)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching courses by status:', error);
      return [];
    }
    
    return data;
  }
}

// Export singleton instance
export const courseWorkflowService = new CourseWorkflowService();

// Named export for type checking
export default courseWorkflowService;
