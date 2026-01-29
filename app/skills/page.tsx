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
  type RecommendedCourse,
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
  Activity,
} from 'lucide-react'

export default async function SkillsDashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/skills')
  }

  // Fetch dashboard data
  const [dashboardData, validationHistory, recommendedCourses] = await Promise.all([
    getUserSkillsDashboard(user.id),
    getSkillValidationHistory(user.id, undefined, 15),
    getRecommendedCourses(user.id, 6),
  ])

  // Handle no data case
  if (!dashboardData || !dashboardData.total_stats.total_skills) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="py-20 text-center">
            <Award className="mx-auto mb-6 h-24 w-24 text-gray-400" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900">No Skills Tracked Yet</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Start taking quizzes and completing courses to build your skill profile. We&apos;ll
              track your progress and validate your competencies.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
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
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-gray-900">
              <Award className="h-10 w-10 text-purple-600" />
              Skills Dashboard
            </h1>
            <p className="text-gray-600">Track your validated skills and competency progress</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
          >
            <BookOpen className="h-5 w-5" />
            Browse Courses
          </Link>
        </div>

        {/* Expiring Skills Alert */}
        {expiring_skills && expiring_skills.length > 0 && (
          <div className="mb-8 rounded-xl border-2 border-orange-200 bg-orange-50 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600" />
              <div className="flex-1">
                <h3 className="mb-3 text-lg font-semibold text-orange-900">Skills Expiring Soon</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {expiring_skills.map((skill) => (
                    <div
                      key={skill.skill_id}
                      className="rounded-lg border border-orange-200 bg-white p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="mb-1 font-medium text-gray-900">{skill.skill_name}</h4>
                          <p className="text-sm text-gray-600">
                            {skill.category}
                            {skill.regulatory_body && ` • ${skill.regulatory_body}`}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getProficiencyColor(skill.proficiency_level)}`}
                        >
                          {formatProficiencyLevel(skill.proficiency_level)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-orange-700">
                          Expires in {skill.days_until_expiry} days
                        </span>
                        <Link
                          href={`/skills/${skill.skill_id}`}
                          className="font-medium text-purple-600 hover:text-purple-700"
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-medium text-gray-600">Total Skills</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.total_skills}</p>
            <p className="mt-1 text-sm text-gray-500">{total_stats.validated_skills} validated</p>
          </div>

          <div className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Validated</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.validated_skills}</p>
            <p className="mt-1 text-sm text-gray-500">{total_stats.expired_skills} expired</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Avg Proficiency</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatSkillScore(total_stats.avg_proficiency)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {formatSkillScore(total_stats.avg_confidence)} confidence
            </p>
          </div>

          <div className="rounded-xl border border-yellow-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Activity className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-gray-600">Assessments</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{total_stats.total_assessments}</p>
            <p className="mt-1 text-sm text-gray-500">{total_stats.passed_assessments} passed</p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <Star className="h-5 w-5 text-indigo-600" />
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
            </div>
            <p className={`text-3xl font-bold ${getPassRateColor(total_stats.pass_rate)}`}>
              {formatSkillScore(total_stats.pass_rate)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {total_stats.advanced + total_stats.expert} advanced+
            </p>
          </div>
        </div>

        {/* Proficiency Level Distribution */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Target className="h-6 w-6 text-purple-600" />
            Proficiency Distribution
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { level: 'novice', count: total_stats.novice, label: 'Novice' },
              { level: 'beginner', count: total_stats.beginner, label: 'Beginner' },
              { level: 'intermediate', count: total_stats.intermediate, label: 'Intermediate' },
              { level: 'advanced', count: total_stats.advanced, label: 'Advanced' },
              { level: 'expert', count: total_stats.expert, label: 'Expert' },
            ].map((item) => (
              <div key={item.level} className="text-center">
                <div className={`mb-2 rounded-lg p-4 ${getProficiencyColor(item.level as any)}`}>
                  <p className="text-3xl font-bold">{item.count}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills by Category */}
        {summary && summary.length > 0 && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Shield className="h-6 w-6 text-purple-600" />
              Skills by Category
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {summary.map((cat, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">{cat.category}</h3>
                      {cat.regulatory_body && (
                        <p className="text-sm text-gray-600">{cat.regulatory_body}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-4">
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
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Active Validated Skills
              </h2>
              <Link
                href="/skills/all"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {active_skills.slice(0, 9).map((skill) => {
                const expiryStatus = getExpiryStatus(skill.expires_at, 'validated')
                return (
                  <Link
                    key={skill.skill_id}
                    href={`/skills/${skill.skill_id}`}
                    className="group rounded-lg border border-gray-200 p-4 transition hover:border-purple-300 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-gray-900 transition group-hover:text-purple-600">
                          {skill.skill_name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {skill.category}
                          {skill.subcategory && ` / ${skill.subcategory}`}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getProficiencyColor(skill.proficiency_level)}`}
                      >
                        {formatProficiencyLevel(skill.proficiency_level)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="absolute inset-0 h-full rounded-full transition-all"
                          style={{
                            width: `${skill.proficiency_score}%`,
                            backgroundColor:
                              skill.proficiency_score >= 75
                                ? '#10b981'
                                : skill.proficiency_score >= 50
                                  ? '#f59e0b'
                                  : '#6366f1',
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
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
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <BookOpen className="h-6 w-6 text-purple-600" />
              Recommended Courses
              <span className="text-sm font-normal text-gray-500">(Based on skill gaps)</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course) => (
                <Link
                  key={course.course_id}
                  href={`/courses/${course.course_id}`}
                  className="group rounded-lg border border-gray-200 p-5 transition hover:border-purple-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="flex-1 font-semibold text-gray-900 transition group-hover:text-purple-600">
                      {course.course_title}
                    </h3>
                    <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-purple-600" />
                  </div>
                  <p className="mb-3 text-sm text-gray-600">{course.course_category}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">
                        {course.skill_gaps} skill{course.skill_gaps !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getProficiencyColor(course.target_proficiency)}`}
                    >
                      → {formatProficiencyLevel(course.target_proficiency)}
                    </span>
                  </div>

                  {course.estimated_improvement > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-600">
                        Est. improvement:{' '}
                        <span className="font-semibold text-green-600">
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
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Calendar className="h-6 w-6 text-purple-600" />
                Recent Validations
              </h2>
              <Link
                href="/skills/history"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Skill
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validationHistory.map((validation) => {
                    const statusInfo = getValidationStatus(validation.validation_status)
                    return (
                      <tr
                        key={validation.validation_id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/skills/${validation.skill_id}`}
                            className="font-medium text-gray-900 hover:text-purple-600"
                          >
                            {validation.skill_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{validation.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {validation.quiz_title ||
                            validation.course_title ||
                            validation.validation_type}
                        </td>
                        <td className="px-4 py-3">
                          {validation.score !== null ? (
                            <span
                              className={`font-semibold ${validation.passed ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatSkillScore(validation.score)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {validation.proficiency_level ? (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getProficiencyColor(validation.proficiency_level)}`}
                            >
                              {formatProficiencyLevel(validation.proficiency_level)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
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
