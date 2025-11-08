/**
 * Skills Dashboard Page
 * 
 * Displays user's skills, proficiency levels, validation status,
 * and recommended courses based on skill gaps.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getUserSkillsDashboard,
  getSkillValidationHistory,
  getRecommendedCourses,
  formatProficiencyLevel,
  getProficiencyColor,
  getValidationStatus,
  formatSkillScore,
  getPassRateColor,
  getExpiryStatus,
  type SkillsDashboardData,
  type SkillValidation,
  type RecommendedCourse
} from '@/lib/services/skills'
import { 
  Award, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Shield,
  Star,
  Calendar,
  Activity
} from 'lucide-react'

export default async function SkillsDashboardPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login?redirect=/skills')
  }
  
  // Fetch dashboard data
  const [dashboardData, validationHistory, recommendedCourses] = await Promise.all([
    getUserSkillsDashboard(user.id),
    getSkillValidationHistory(user.id, undefined, 15),
    getRecommendedCourses(user.id, 6)
  ])
  
  // Handle no data case
  if (!dashboardData || !dashboardData.total_stats.total_skills) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-20">
            <Award className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Skills Tracked Yet
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Start taking quizzes and completing courses to build your skill profile.
              We&apos;ll track your progress and validate your competencies.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
            >
              <BookOpen className="h-5 w-5" />
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const { summary, active_skills, expiring_skills, total_stats } = dashboardData
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="h-10 w-10 text-purple-600" />
              Skills Dashboard
            </h1>
            <p className="text-gray-600">
              Track your validated skills and competency progress
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
          >
            <BookOpen className="h-5 w-5" />
            Browse Courses
          </Link>
        </div>
        
        {/* Expiring Skills Alert */}
        {expiring_skills && expiring_skills.length > 0 && (
          <div className="mb-8 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  Skills Expiring Soon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiring_skills.map((skill) => (
                    <div key={skill.skill_id} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {skill.skill_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {skill.category}
                            {skill.regulatory_body && ` • ${skill.regulatory_body}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                          {formatProficiencyLevel(skill.proficiency_level)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-orange-700 font-medium">
                          Expires in {skill.days_until_expiry} days
                        </span>
                        <Link
                          href={`/skills/${skill.skill_id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Renew →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-medium text-gray-600">Total Skills</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.total_skills}</p>
            <p className="text-sm text-gray-500 mt-1">
              {total_stats.validated_skills} validated
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Validated</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.validated_skills}</p>
            <p className="text-sm text-gray-500 mt-1">
              {total_stats.expired_skills} expired
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Avg Proficiency</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatSkillScore(total_stats.avg_proficiency)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatSkillScore(total_stats.avg_confidence)} confidence
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-gray-600">Assessments</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.total_assessments}</p>
            <p className="text-sm text-gray-500 mt-1">
              {total_stats.passed_assessments} passed
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-indigo-600" />
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
            </div>
            <p className={`text-3xl font-bold ${getPassRateColor(total_stats.pass_rate)}`}>
              {formatSkillScore(total_stats.pass_rate)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {total_stats.advanced + total_stats.expert} advanced+
            </p>
          </div>
        </div>
        
        {/* Proficiency Level Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            Proficiency Distribution
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { level: 'novice', count: total_stats.novice, label: 'Novice' },
              { level: 'beginner', count: total_stats.beginner, label: 'Beginner' },
              { level: 'intermediate', count: total_stats.intermediate, label: 'Intermediate' },
              { level: 'advanced', count: total_stats.advanced, label: 'Advanced' },
              { level: 'expert', count: total_stats.expert, label: 'Expert' }
            ].map((item) => (
              <div key={item.level} className="text-center">
                <div className={`rounded-lg p-4 mb-2 ${getProficiencyColor(item.level as any)}`}>
                  <p className="text-3xl font-bold">{item.count}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skills by Category */}
        {summary && summary.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Skills by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.map((cat, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {cat.category}
                      </h3>
                      {cat.regulatory_body && (
                        <p className="text-sm text-gray-600">{cat.regulatory_body}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{cat.total_skills}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{cat.validated_skills}</p>
                      <p className="text-xs text-gray-500">Validated</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{cat.advanced_skills}</p>
                      <p className="text-xs text-gray-500">Advanced+</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Proficiency:</span>
                      <span className="font-semibold text-gray-900">
                        {formatSkillScore(cat.avg_proficiency_score)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Quiz Score:</span>
                      <span className="font-semibold text-gray-900">
                        {formatSkillScore(cat.avg_quiz_score)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assessments:</span>
                      <span className="font-semibold text-gray-900">
                        {cat.passed_assessments}/{cat.total_assessments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Active Skills */}
        {active_skills && active_skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Active Validated Skills
              </h2>
              <Link
                href="/skills/all"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {active_skills.slice(0, 9).map((skill) => {
                const expiryStatus = getExpiryStatus(skill.expires_at, 'validated')
                return (
                  <Link
                    key={skill.skill_id}
                    href={`/skills/${skill.skill_id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition">
                          {skill.skill_name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {skill.category}
                          {skill.subcategory && ` / ${skill.subcategory}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                        {formatProficiencyLevel(skill.proficiency_level)}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="absolute inset-0 h-full rounded-full transition-all"
                          style={{ 
                            width: `${skill.proficiency_score}%`,
                            backgroundColor: skill.proficiency_score >= 75 ? '#10b981' : skill.proficiency_score >= 50 ? '#f59e0b' : '#6366f1'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatSkillScore(skill.proficiency_score)} proficiency
                      </p>
                    </div>
                    
                    {skill.expires_at && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className={expiryStatus.color.split(' ')[0]}>
                          {expiryStatus.label}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Recommended Courses */}
        {recommendedCourses && recommendedCourses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              Recommended Courses
              <span className="text-sm font-normal text-gray-500">
                (Based on skill gaps)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses.map((course) => (
                <Link
                  key={course.course_id}
                  href={`/courses/${course.course_id}`}
                  className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition flex-1">
                      {course.course_title}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{course.course_category}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">
                        {course.skill_gaps} skill{course.skill_gaps !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProficiencyColor(course.target_proficiency)}`}>
                      → {formatProficiencyLevel(course.target_proficiency)}
                    </span>
                  </div>
                  
                  {course.estimated_improvement > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        Est. improvement: <span className="font-semibold text-green-600">
                          +{formatSkillScore(course.estimated_improvement)}
                        </span>
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Validation History */}
        {validationHistory && validationHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                Recent Validations
              </h2>
              <Link
                href="/skills/history"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Skill</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {validationHistory.map((validation) => {
                    const statusInfo = getValidationStatus(validation.validation_status)
                    return (
                      <tr key={validation.validation_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link 
                            href={`/skills/${validation.skill_id}`}
                            className="font-medium text-gray-900 hover:text-purple-600"
                          >
                            {validation.skill_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {validation.category}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {validation.quiz_title || validation.course_title || validation.validation_type}
                        </td>
                        <td className="py-3 px-4">
                          {validation.score !== null ? (
                            <span className={`font-semibold ${validation.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {formatSkillScore(validation.score)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {validation.proficiency_level ? (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProficiencyColor(validation.proficiency_level)}`}>
                              {formatProficiencyLevel(validation.proficiency_level)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(validation.attempted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
