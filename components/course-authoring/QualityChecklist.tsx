'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Info } from 'lucide-react';
import { courseWorkflowService, type QualityChecklist } from '@/lib/services/course-workflow';

interface QualityChecklistProps {
  courseId: string;
  onUpdate?: (checklist: QualityChecklist) => void;
  readOnly?: boolean;
  showSubmitThreshold?: boolean;
}

interface ChecklistItem {
  id: keyof Omit<QualityChecklist, 'id' | 'course_id' | 'completion_percentage' | 'checked_by' | 'checked_at' | 'created_at' | 'updated_at'>;
  label: string;
  description?: string;
}

interface ChecklistCategory {
  name: string;
  description: string;
  color: string;
  items: ChecklistItem[];
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    name: 'Accessibility',
    description: 'WCAG 2.1 AA compliance for inclusive learning',
    color: 'blue',
    items: [
      {
        id: 'accessibility_wcag_aa',
        label: 'Meets WCAG 2.1 AA Standards',
        description: 'All content meets Web Content Accessibility Guidelines Level AA'
      },
      {
        id: 'accessibility_captions',
        label: 'Video Captions',
        description: 'All videos include accurate closed captions'
      },
      {
        id: 'accessibility_transcripts',
        label: 'Audio/Video Transcripts',
        description: 'Full text transcripts available for all multimedia content'
      },
      {
        id: 'accessibility_keyboard_nav',
        label: 'Keyboard Navigation',
        description: 'All interactive elements accessible via keyboard'
      },
      {
        id: 'accessibility_screen_reader',
        label: 'Screen Reader Compatible',
        description: 'Content properly structured for screen readers'
      }
    ]
  },
  {
    name: 'Bilingual Support',
    description: 'Canadian Official Languages Act compliance',
    color: 'green',
    items: [
      {
        id: 'bilingual_en_available',
        label: 'Available in English',
        description: 'Complete English version of all course materials'
      },
      {
        id: 'bilingual_fr_available',
        label: 'Available in French (Disponible en français)',
        description: 'Complete French version of all course materials'
      }
    ]
  },
  {
    name: 'Video Quality',
    description: 'Professional video production standards',
    color: 'purple',
    items: [
      {
        id: 'video_quality_standards',
        label: 'Video Quality Standards',
        description: 'Minimum 720p resolution, proper lighting and framing'
      },
      {
        id: 'video_audio_clarity',
        label: 'Audio Clarity',
        description: 'Clear audio with minimal background noise, proper volume levels'
      },
      {
        id: 'video_encoding_correct',
        label: 'Proper Encoding',
        description: 'Videos encoded for web delivery (H.264/MP4)'
      }
    ]
  },
  {
    name: 'Technical Requirements',
    description: 'Cross-platform compatibility',
    color: 'orange',
    items: [
      {
        id: 'mobile_responsive',
        label: 'Mobile Responsive',
        description: 'Content displays correctly on mobile devices'
      },
      {
        id: 'cross_browser_tested',
        label: 'Cross-Browser Tested',
        description: 'Tested on Chrome, Firefox, Safari, and Edge'
      }
    ]
  },
  {
    name: 'Content Quality',
    description: 'Educational effectiveness and accuracy',
    color: 'indigo',
    items: [
      {
        id: 'learning_objectives_clear',
        label: 'Clear Learning Objectives',
        description: 'Well-defined, measurable learning outcomes'
      },
      {
        id: 'assessments_valid',
        label: 'Appropriate Assessments',
        description: 'Quizzes and assignments aligned with learning objectives'
      },
      {
        id: 'content_accurate',
        label: 'Accurate Content',
        description: 'Content reviewed for accuracy and currency'
      },
      {
        id: 'references_cited',
        label: 'Proper Citations',
        description: 'All sources properly cited and attributed'
      }
    ]
  },
  {
    name: 'Compliance',
    description: 'Regulatory and legal requirements',
    color: 'red',
    items: [
      {
        id: 'regulatory_compliance',
        label: 'Meets Regulatory Requirements',
        description: 'Complies with applicable educational and professional standards'
      },
      {
        id: 'privacy_compliant',
        label: 'Privacy Compliant (PIPEDA)',
        description: 'Meets Canadian privacy legislation requirements'
      },
      {
        id: 'copyright_cleared',
        label: 'Copyright Cleared',
        description: 'All materials properly licensed or original'
      }
    ]
  }
];

const SUBMIT_THRESHOLD = 80; // Minimum 80% completion required to submit for review

export default function QualityChecklist({
  courseId,
  onUpdate,
  readOnly = false,
  showSubmitThreshold = true
}: QualityChecklistProps) {
  const [checklist, setChecklist] = useState<QualityChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CHECKLIST_CATEGORIES.map(cat => cat.name))
  );

  useEffect(() => {
    loadChecklist();
  }, [courseId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseWorkflowService.getQualityChecklist(courseId);
      setChecklist(data);
    } catch (err) {
      console.error('Failed to load quality checklist:', err);
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (readOnly || !checklist) return;

    const newValue = !checklist[itemId as keyof QualityChecklist];
    const updatedChecklist = { ...checklist, [itemId]: newValue };

    // Optimistic update
    setChecklist(updatedChecklist as QualityChecklist);

    try {
      setSaving(true);
      const result = await courseWorkflowService.updateQualityChecklist(
        courseId,
        { [itemId]: newValue },
        checklist.checked_by || ''
      );
      setChecklist(result);
      if (result) {
        onUpdate?.(result);
      }
    } catch (err) {
      console.error('Failed to update checklist:', err);
      setError('Failed to save changes');
      // Revert on error
      setChecklist(checklist);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage < 50) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage < 90) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage < 50) return <AlertCircle className="h-5 w-5" />;
    if (percentage < 90) return <Info className="h-5 w-5" />;
    return <CheckCircle2 className="h-5 w-5" />;
  };

  const getCategoryProgress = (category: ChecklistCategory): number => {
    if (!checklist) return 0;
    const completed = category.items.filter(
      item => checklist[item.id] === true
    ).length;
    return Math.round((completed / category.items.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={loadChecklist}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-gray-600">No checklist found for this course.</p>
      </div>
    );
  }

  const completionPercentage = checklist.completion_percentage || 0;
  const meetsThreshold = completionPercentage >= SUBMIT_THRESHOLD;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className={`rounded-lg border p-4 ${getCompletionColor(completionPercentage)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getCompletionIcon(completionPercentage)}
            <div>
              <h3 className="font-semibold">Quality Checklist Completion</h3>
              <p className="text-sm opacity-90">
                {completionPercentage}% complete ({Math.round((completionPercentage / 100) * 19)} of 19 items)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            {saving && <p className="text-xs">Saving...</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-white/50">
          <div
            className="h-2 rounded-full bg-current transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Threshold Warning */}
        {showSubmitThreshold && !meetsThreshold && (
          <div className="mt-3 flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Note:</strong> Minimum {SUBMIT_THRESHOLD}% completion required to submit for review. 
              Complete at least {Math.ceil(((SUBMIT_THRESHOLD - completionPercentage) / 100) * 19)} more items.
            </p>
          </div>
        )}

        {meetsThreshold && showSubmitThreshold && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <p>
              <strong>Ready for review!</strong> Your course meets the minimum quality standards.
            </p>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {CHECKLIST_CATEGORIES.map(category => {
          const progress = getCategoryProgress(category);
          const isExpanded = expandedCategories.has(category.name);

          return (
            <div
              key={category.name}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-2 h-2 rounded-full bg-${category.color}-500`}></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{progress}%</div>
                    <div className="text-xs text-gray-500">
                      {category.items.filter(item => checklist[item.id] === true).length}/{category.items.length}
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {category.items.map(item => {
                    const isChecked = checklist[item.id] === true;

                    return (
                      <div
                        key={item.id}
                        className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <label
                          className={`flex items-start gap-3 p-4 ${
                            readOnly ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.id)}
                            disabled={readOnly}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{item.label}</span>
                              {isChecked && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {checklist.checked_at && (
        <div className="text-sm text-gray-500 text-center pt-2 border-t border-gray-200">
          Last updated: {new Date(checklist.checked_at).toLocaleString('en-CA', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
        </div>
      )}
    </div>
  );
}
