'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Clock,
  History,
  Upload,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Loader2
} from 'lucide-react';
import QualityChecklist from '@/components/course-authoring/QualityChecklist';
import { courseWorkflowService, type WorkflowStatus } from '@/lib/services/course-workflow';
import { instructorsService } from '@/lib/services/instructors';

type TabType = 'details' | 'content' | 'quality' | 'versions' | 'preview';

export default function InstructorCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<any>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Course data
  const [course, setCourse] = useState<any>(null);
  const [workflowSummary, setWorkflowSummary] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    cover_image_url: '',
    category_id: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimated_duration_minutes: 60,
    learning_objectives: [''],
    prerequisites: [''],
    tags: [''],
    meta_title: '',
    meta_description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [courseId]);

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check authentication
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/auth/login?redirect=/instructor/courses');
        return;
      }
      setUser(authUser);

      // Check if user is an active instructor
      const instructorCheck = await instructorsService.isInstructor(authUser.id);
      if (!instructorCheck) {
        router.push('/instructor/dashboard?error=not_instructor');
        return;
      }
      setIsInstructor(true);

      // Load course data
      await loadCourse();
      await loadCategories();
      await loadWorkflowSummary();
      await loadVersions();
    } catch (error) {
      console.error('Error in checkAuthAndLoadData:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (!data) {
        router.push('/instructor/dashboard?error=course_not_found');
        return;
      }

      setCourse(data);

      // Populate form
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        thumbnail_url: data.thumbnail_url || '',
        cover_image_url: data.cover_image_url || '',
        category_id: data.category_id || '',
        level: data.level || 'beginner',
        estimated_duration_minutes: data.estimated_duration_minutes || 60,
        learning_objectives: data.learning_objectives || [''],
        prerequisites: data.prerequisites || [''],
        tags: data.tags || [''],
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || ''
      });
    } catch (error) {
      console.error('Error loading course:', error);
      setErrors({ general: 'Failed to load course data' });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadWorkflowSummary = async () => {
    try {
      const summary = await courseWorkflowService.getWorkflowSummary(courseId);
      setWorkflowSummary(summary);
    } catch (error) {
      console.error('Error loading workflow summary:', error);
    }
  };

  const loadVersions = async () => {
    try {
      const versionData = await courseWorkflowService.getVersions(courseId);
      setVersions(versionData);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});
      setSuccessMessage(null);

      // Validate
      const newErrors: Record<string, string> = {};
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.category_id) newErrors.category_id = 'Category is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Update course
      const { error } = await supabase
        .from('courses')
        .update({
          ...formData,
          last_modified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);

      if (error) throw error;

      setSuccessMessage('Course saved successfully');
      await loadCourse();
      await loadWorkflowSummary();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ general: 'Failed to save course' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      // Check quality checklist completion
      if (workflowSummary?.quality_checklist_completion < 80) {
        setErrors({
          general: 'Quality checklist must be at least 80% complete before submitting for review'
        });
        return;
      }

      // Submit for review
      const result = await courseWorkflowService.submitForReview(
        courseId,
        user.id,
        submissionNotes.trim() || undefined
      );

      if (!result.success) {
        setErrors({ general: result.message });
        return;
      }

      setSuccessMessage('Course submitted for review successfully');
      setShowSubmitModal(false);
      setSubmissionNotes('');
      await loadCourse();
      await loadWorkflowSummary();

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/instructor/dashboard?success=submitted');
      }, 2000);
    } catch (error) {
      console.error('Error submitting for review:', error);
      setErrors({ general: 'Failed to submit course for review' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/courses/${course?.slug}?preview=true`, '_blank');
  };

  const getStatusBadge = (status: WorkflowStatus) => {
    const config: Record<WorkflowStatus, { label: string; className: string; icon: any }> = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
      in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-800', icon: Clock },
      needs_revision: { label: 'Needs Revision', className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      published: { label: 'Published', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      archived: { label: 'Archived', className: 'bg-red-100 text-red-800', icon: FileText }
    };

    const { label, className, icon: Icon } = config[status] || config.draft;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  };

  const canEdit = course?.workflow_status === 'draft' || course?.workflow_status === 'needs_revision';
  const canSubmit = canEdit && workflowSummary?.quality_checklist_completion >= 80;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isInstructor || !course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/instructor/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{formData.title || 'Edit Course'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {getStatusBadge(course.workflow_status)}
                  {course.version_number && (
                    <span className="text-sm text-gray-600">Version {course.version_number}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              
              {canEdit && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>

                  {canSubmit && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      Submit for Review
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-t border-gray-200">
            {[
              { id: 'details', label: 'Course Details', icon: BookOpen },
              { id: 'content', label: 'Content & Upload', icon: Upload },
              { id: 'quality', label: 'Quality Checklist', icon: CheckCircle },
              { id: 'versions', label: 'Version History', icon: History },
              { id: 'preview', label: 'Preview Mode', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <p>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Revision Feedback */}
      {course.workflow_status === 'needs_revision' && course.rejection_reason && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Revision Required</h3>
                <p className="text-yellow-800 mt-1">{course.rejection_reason}</p>
                {course.reviewed_at && (
                  <p className="text-sm text-yellow-700 mt-2">
                    Reviewed on {new Date(course.reviewed_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Course Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Advanced Anti-Racism Training"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., advanced-anti-racism-training"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  min="0"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!canEdit}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Provide a detailed description of the course..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="https://..."
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  disabled={!canEdit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Content & Upload Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Content Upload & Management</h2>
            
            <div className="space-y-6">
              {/* Upload Areas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Upload Videos</h3>
                  <p className="text-sm text-gray-600">Drag & drop or click to browse</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Upload Documents</h3>
                  <p className="text-sm text-gray-600">PDFs, presentations, resources</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Upload Images</h3>
                  <p className="text-sm text-gray-600">Thumbnails, diagrams, photos</p>
                </div>
              </div>

              {/* Note about content upload */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Content Upload System</p>
                    <p>
                      Full content upload wizard integration is coming soon. For now, please contact the admin team 
                      to upload course materials. All content must meet quality checklist requirements before 
                      submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Checklist Tab */}
        {activeTab === 'quality' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Content Quality Checklist</h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete at least 80% of the checklist to submit your course for review
              </p>
            </div>
            
            <QualityChecklist
              courseId={courseId}
              onUpdate={(checklist) => {
                loadWorkflowSummary();
              }}
              readOnly={!canEdit}
              showSubmitThreshold={true}
            />
          </div>
        )}

        {/* Version History Tab */}
        {activeTab === 'versions' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Version History</h2>
            
            {versions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No versions yet. Versions are created when your course is published.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-gray-900">
                          Version {version.version_number}
                        </span>
                        {version.version_number === course.version_number && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(version.created_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}
                      </span>
                    </div>
                    {version.change_summary && (
                      <p className="text-sm text-gray-700">{version.change_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Mode Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preview Mode</h2>
            
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Your Course</h3>
              <p className="text-gray-600 mb-6">
                See how students will experience your course
              </p>
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-5 w-5" />
                Open Preview in New Tab
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Course for Review</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Notes (Optional)
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes for the reviewers (e.g., specific areas you'd like feedback on, recent changes made, etc.)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Your course will be reviewed by our team. You&apos;ll be notified once the review is complete.
                The review typically takes 3-5 business days.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
