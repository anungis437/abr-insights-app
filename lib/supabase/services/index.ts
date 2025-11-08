/**
 * Supabase Services Index
 * Central export for all Supabase service layer
 * Replaces all @base44/sdk entity usage
 */

// Core Services
export * from './organizations'
export * from './tribunalCases'
export * from './profiles'

// Learning & Progress
export * from './courses'
export * from './progress'
export * from './certificates'

// Gamification
export * from './achievements'

// User Engagement
export * from './notifications'

// Public Site
export * from './testimonials'
export * from './resources'
export * from './savedSearches'

// AI & Coaching
export * from './aiCoaching'

// User Onboarding
export * from './onboarding'

// Service Instances (for direct import)
export { organizationsService } from './organizations'
export { tribunalCasesService } from './tribunalCases'
export { coursesService } from './courses'
export { progressService } from './progress'
export { achievementsService } from './achievements'
export { notificationsService } from './notifications'
export { resourcesService } from './resources'
export { certificatesService } from './certificates'
export { aiCoachingService } from './aiCoaching'
export { onboardingService } from './onboarding'
export { savedSearchesService } from './savedSearches'
