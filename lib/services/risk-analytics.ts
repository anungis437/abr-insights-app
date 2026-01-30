/**
 * Risk Analytics Service
 * Calculates and visualizes organizational risk based on training compliance,
 * quiz performance, incident patterns, and case intelligence
 */

import { createClient } from '@/lib/supabase/client'

export interface DepartmentRiskScore {
  department: string
  location?: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number // 0-100
  total_users: number
  training_completion_rate: number
  avg_quiz_score: number
  days_since_last_training: number
  pending_users: number
  at_risk_users: number
  factors: RiskFactor[]
}

export interface RiskFactor {
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  impact_score: number
}

export interface OrganizationRiskSummary {
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical'
  overall_risk_score: number
  total_departments: number
  high_risk_departments: number
  total_users: number
  compliant_users: number
  at_risk_users: number
  last_calculated_at: string
}

export interface RiskTrend {
  date: string
  risk_score: number
  department?: string
}

export interface UserRiskDetail {
  user_id: string
  user_name: string
  user_email: string
  department: string
  location?: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number
  training_status: 'completed' | 'in_progress' | 'not_started'
  completion_percentage: number
  quiz_score?: number
  quiz_attempts: number
  days_since_last_training?: number
  last_training_date?: string
  issues: string[]
}

/**
 * Calculate risk score for a department based on multiple factors
 */
function calculateRiskScore(metrics: {
  completionRate: number
  avgQuizScore: number
  daysSinceTraining: number
  pendingUsers: number
  totalUsers: number
}): { score: number; level: 'low' | 'medium' | 'high' | 'critical'; factors: RiskFactor[] } {
  const factors: RiskFactor[] = []
  let totalScore = 0

  // Factor 1: Training Completion Rate (30% weight)
  const completionWeight = 30
  const completionScore = metrics.completionRate * completionWeight
  totalScore += completionScore

  if (metrics.completionRate < 0.5) {
    factors.push({
      category: 'Training Completion',
      description: `Only ${(metrics.completionRate * 100).toFixed(0)}% of users have completed required training`,
      severity: metrics.completionRate < 0.3 ? 'critical' : 'high',
      impact_score: completionWeight - completionScore,
    })
  } else if (metrics.completionRate < 0.8) {
    factors.push({
      category: 'Training Completion',
      description: `${(metrics.completionRate * 100).toFixed(0)}% completion rate - below target`,
      severity: 'medium',
      impact_score: completionWeight - completionScore,
    })
  }

  // Factor 2: Quiz Performance (25% weight)
  const quizWeight = 25
  const quizScore = (metrics.avgQuizScore / 100) * quizWeight
  totalScore += quizScore

  if (metrics.avgQuizScore < 60) {
    factors.push({
      category: 'Knowledge Assessment',
      description: `Average quiz score of ${metrics.avgQuizScore.toFixed(0)}% indicates poor comprehension`,
      severity: metrics.avgQuizScore < 50 ? 'critical' : 'high',
      impact_score: quizWeight - quizScore,
    })
  } else if (metrics.avgQuizScore < 75) {
    factors.push({
      category: 'Knowledge Assessment',
      description: `Quiz scores averaging ${metrics.avgQuizScore.toFixed(0)}% - below proficiency threshold`,
      severity: 'medium',
      impact_score: quizWeight - quizScore,
    })
  }

  // Factor 3: Training Recency (25% weight)
  const recencyWeight = 25
  const maxDays = 365
  const recencyScore = Math.max(0, (1 - metrics.daysSinceTraining / maxDays)) * recencyWeight
  totalScore += recencyScore

  if (metrics.daysSinceTraining > 365) {
    factors.push({
      category: 'Training Recency',
      description: `Last training was ${Math.floor(metrics.daysSinceTraining / 30)} months ago - refresh needed`,
      severity: 'high',
      impact_score: recencyWeight - recencyScore,
    })
  } else if (metrics.daysSinceTraining > 180) {
    factors.push({
      category: 'Training Recency',
      description: `Training is ${Math.floor(metrics.daysSinceTraining / 30)} months old - approaching refresh cycle`,
      severity: 'medium',
      impact_score: recencyWeight - recencyScore,
    })
  }

  // Factor 4: Pending Users (20% weight)
  const pendingWeight = 20
  const pendingRate = metrics.totalUsers > 0 ? metrics.pendingUsers / metrics.totalUsers : 0
  const pendingScore = (1 - pendingRate) * pendingWeight
  totalScore += pendingScore

  if (pendingRate > 0.3) {
    factors.push({
      category: 'Enrollment Gap',
      description: `${metrics.pendingUsers} users (${(pendingRate * 100).toFixed(0)}%) not enrolled in required training`,
      severity: pendingRate > 0.5 ? 'critical' : 'high',
      impact_score: pendingWeight - pendingScore,
    })
  } else if (pendingRate > 0.1) {
    factors.push({
      category: 'Enrollment Gap',
      description: `${metrics.pendingUsers} users pending enrollment`,
      severity: 'medium',
      impact_score: pendingWeight - pendingScore,
    })
  }

  // Determine risk level based on total score
  let level: 'low' | 'medium' | 'high' | 'critical'
  if (totalScore >= 80) level = 'low'
  else if (totalScore >= 60) level = 'medium'
  else if (totalScore >= 40) level = 'high'
  else level = 'critical'

  return { score: totalScore, level, factors }
}

/**
 * Get risk scores for all departments in an organization
 */
export async function getDepartmentRiskScores(
  organizationId: string
): Promise<DepartmentRiskScore[]> {
  const supabase = createClient()

  // Get all users with their department and training data
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(
      `
      id,
      department,
      location,
      enrollments!inner(
        id,
        status,
        progress_percentage,
        completed_at,
        created_at
      )
    `
    )
    .eq('organization_id', organizationId)

  if (usersError) throw usersError

  // Get quiz attempts for assessment scores
  const userIds = users?.map((u) => u.id) || []
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('user_id, score, completed')
    .in('user_id', userIds)
    .eq('completed', true)

  // Group by department
  const departmentMap = new Map<string, any[]>()
  users?.forEach((user) => {
    const dept = user.department || 'Unassigned'
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, [])
    }
    departmentMap.get(dept)!.push(user)
  })

  // Calculate risk for each department
  const riskScores: DepartmentRiskScore[] = []

  for (const [department, deptUsers] of departmentMap.entries()) {
    const totalUsers = deptUsers.length

    // Calculate completion rate
    const completedUsers = deptUsers.filter((u) =>
      u.enrollments.some((e: any) => e.status === 'completed')
    ).length
    const completionRate = totalUsers > 0 ? completedUsers / totalUsers : 0

    // Calculate average quiz score
    const deptUserIds = deptUsers.map((u) => u.id)
    const deptQuizAttempts = quizAttempts?.filter((q) => deptUserIds.includes(q.user_id)) || []
    const avgQuizScore =
      deptQuizAttempts.length > 0
        ? deptQuizAttempts.reduce((sum, q) => sum + q.score, 0) / deptQuizAttempts.length
        : 0

    // Calculate days since last training
    const completedEnrollments = deptUsers
      .flatMap((u) => u.enrollments)
      .filter((e: any) => e.completed_at)
    const mostRecentTraining = completedEnrollments.length > 0
      ? Math.max(...completedEnrollments.map((e: any) => new Date(e.completed_at).getTime()))
      : 0
    const daysSinceTraining = mostRecentTraining > 0
      ? Math.floor((Date.now() - mostRecentTraining) / (1000 * 60 * 60 * 24))
      : 999

    // Calculate pending users
    const pendingUsers = deptUsers.filter(
      (u) => !u.enrollments.some((e: any) => e.status === 'active' || e.status === 'completed')
    ).length

    // Calculate risk score
    const { score, level, factors } = calculateRiskScore({
      completionRate,
      avgQuizScore,
      daysSinceTraining,
      pendingUsers,
      totalUsers,
    })

    // Determine at-risk users (low completion or low quiz scores)
    const atRiskUsers = deptUsers.filter((u) => {
      const userQuizAttempts = quizAttempts?.filter((q) => q.user_id === u.id) || []
      const userAvgScore =
        userQuizAttempts.length > 0
          ? userQuizAttempts.reduce((sum, q) => sum + q.score, 0) / userQuizAttempts.length
          : 0
      const hasCompletedTraining = u.enrollments.some((e: any) => e.status === 'completed')
      return !hasCompletedTraining || userAvgScore < 70
    }).length

    riskScores.push({
      department,
      location: deptUsers[0]?.location,
      risk_level: level,
      risk_score: score,
      total_users: totalUsers,
      training_completion_rate: completionRate,
      avg_quiz_score: avgQuizScore,
      days_since_last_training: daysSinceTraining,
      pending_users: pendingUsers,
      at_risk_users: atRiskUsers,
      factors,
    })
  }

  return riskScores.sort((a, b) => a.risk_score - b.risk_score)
}

/**
 * Get organization-wide risk summary
 */
export async function getOrganizationRiskSummary(
  organizationId: string
): Promise<OrganizationRiskSummary> {
  const departmentScores = await getDepartmentRiskScores(organizationId)

  const totalDepartments = departmentScores.length
  const highRiskDepartments = departmentScores.filter(
    (d) => d.risk_level === 'high' || d.risk_level === 'critical'
  ).length

  const totalUsers = departmentScores.reduce((sum, d) => sum + d.total_users, 0)
  const compliantUsers = departmentScores.reduce(
    (sum, d) => sum + Math.floor(d.total_users * d.training_completion_rate),
    0
  )
  const atRiskUsers = departmentScores.reduce((sum, d) => sum + d.at_risk_users, 0)

  // Calculate overall risk score (weighted average by department size)
  const overallRiskScore =
    totalUsers > 0
      ? departmentScores.reduce((sum, d) => sum + d.risk_score * d.total_users, 0) / totalUsers
      : 100

  let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (overallRiskScore >= 80) overallRiskLevel = 'low'
  else if (overallRiskScore >= 60) overallRiskLevel = 'medium'
  else if (overallRiskScore >= 40) overallRiskLevel = 'high'
  else overallRiskLevel = 'critical'

  return {
    overall_risk_level: overallRiskLevel,
    overall_risk_score: overallRiskScore,
    total_departments: totalDepartments,
    high_risk_departments: highRiskDepartments,
    total_users: totalUsers,
    compliant_users: compliantUsers,
    at_risk_users: atRiskUsers,
    last_calculated_at: new Date().toISOString(),
  }
}

/**
 * Get risk trend over time for an organization or department
 */
export async function getRiskTrends(
  organizationId: string,
  department?: string,
  days: number = 90
): Promise<RiskTrend[]> {
  // TODO: Implement historical tracking by storing risk scores daily
  // For now, return current score
  const scores = await getDepartmentRiskScores(organizationId)
  const score = department
    ? scores.find((s) => s.department === department)?.risk_score || 0
    : scores.reduce((sum, s) => sum + s.risk_score * s.total_users, 0) /
      scores.reduce((sum, s) => sum + s.total_users, 0)

  return [
    {
      date: new Date().toISOString(),
      risk_score: score,
      department,
    },
  ]
}

/**
 * Get individual user risk details for a department
 */
export async function getDepartmentUserRiskDetails(
  organizationId: string,
  department: string
): Promise<UserRiskDetail[]> {
  const supabase = createClient()

  // Get all users in the department with their profile and training data
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      first_name,
      last_name,
      department,
      location,
      enrollments!inner(
        id,
        status,
        progress_percentage,
        completed_at,
        created_at,
        course:courses(title)
      )
    `
    )
    .eq('organization_id', organizationId)
    .eq('department', department)

  if (usersError) throw usersError

  // Get quiz attempts for all users
  const userIds = users?.map((u) => u.id) || []
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('user_id, score, completed, created_at')
    .in('user_id', userIds)
    .eq('completed', true)
    .order('created_at', { ascending: false })

  const userRiskDetails: UserRiskDetail[] = []

  for (const user of users || []) {
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
    const issues: string[] = []

    // Determine training status
    const completedEnrollments = user.enrollments.filter((e: any) => e.status === 'completed')
    const inProgressEnrollments = user.enrollments.filter(
      (e: any) => e.status === 'active' && e.progress_percentage > 0
    )

    let trainingStatus: 'completed' | 'in_progress' | 'not_started'
    if (completedEnrollments.length > 0) {
      trainingStatus = 'completed'
    } else if (inProgressEnrollments.length > 0) {
      trainingStatus = 'in_progress'
    } else {
      trainingStatus = 'not_started'
      issues.push('No training started')
    }

    // Calculate completion percentage (average across all enrollments)
    const completionPercentage =
      user.enrollments.length > 0
        ? user.enrollments.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) /
          user.enrollments.length
        : 0

    if (completionPercentage < 100 && trainingStatus !== 'not_started') {
      issues.push(`Training ${completionPercentage.toFixed(0)}% complete`)
    }

    // Get quiz data
    const userQuizAttempts = quizAttempts?.filter((q) => q.user_id === user.id) || []
    const quizScore =
      userQuizAttempts.length > 0
        ? userQuizAttempts.reduce((sum, q) => sum + q.score, 0) / userQuizAttempts.length
        : undefined

    if (quizScore !== undefined && quizScore < 70) {
      issues.push(`Low quiz score: ${quizScore.toFixed(0)}%`)
    } else if (quizScore === undefined && trainingStatus !== 'not_started') {
      issues.push('No quiz attempts')
    }

    // Calculate days since last training
    const lastTrainingDate =
      completedEnrollments.length > 0
        ? completedEnrollments.reduce((latest: any, e: any) => {
            const eDate = new Date(e.completed_at)
            return !latest || eDate > new Date(latest) ? e.completed_at : latest
          }, null)
        : undefined

    const daysSinceLastTraining = lastTrainingDate
      ? Math.floor((Date.now() - new Date(lastTrainingDate).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    if (daysSinceLastTraining && daysSinceLastTraining > 365) {
      issues.push(`Training expired (${Math.floor(daysSinceLastTraining / 30)} months ago)`)
    } else if (daysSinceLastTraining && daysSinceLastTraining > 180) {
      issues.push(`Training aging (${Math.floor(daysSinceLastTraining / 30)} months old)`)
    }

    // Calculate individual risk score
    let riskScore = 100 // Start at 100 (lowest risk)

    // Deduct points for incomplete training
    if (trainingStatus === 'not_started') {
      riskScore -= 40
    } else if (completionPercentage < 100) {
      riskScore -= (100 - completionPercentage) * 0.3
    }

    // Deduct points for low quiz scores
    if (quizScore !== undefined) {
      if (quizScore < 70) {
        riskScore -= (70 - quizScore) * 0.5
      }
    } else if (trainingStatus !== 'not_started') {
      riskScore -= 20 // No quiz data
    }

    // Deduct points for training age
    if (daysSinceLastTraining) {
      if (daysSinceLastTraining > 365) {
        riskScore -= 25
      } else if (daysSinceLastTraining > 180) {
        riskScore -= 15
      }
    }

    // Ensure score is between 0 and 100
    riskScore = Math.max(0, Math.min(100, riskScore))

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (riskScore >= 80) riskLevel = 'low'
    else if (riskScore >= 60) riskLevel = 'medium'
    else if (riskScore >= 40) riskLevel = 'high'
    else riskLevel = 'critical'

    userRiskDetails.push({
      user_id: user.id,
      user_name: userName,
      user_email: user.email,
      department: user.department,
      location: user.location,
      risk_level: riskLevel,
      risk_score: riskScore,
      training_status: trainingStatus,
      completion_percentage: completionPercentage,
      quiz_score: quizScore,
      quiz_attempts: userQuizAttempts.length,
      days_since_last_training: daysSinceLastTraining,
      last_training_date: lastTrainingDate,
      issues,
    })
  }

  // Sort by risk score (lowest first = highest risk)
  return userRiskDetails.sort((a, b) => a.risk_score - b.risk_score)
}

