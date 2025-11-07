/**
 * Supabase Services Index
 * Central export for all Supabase service layer
 * Replaces all @base44/sdk entity usage
 */

// Core Services
export * from './organizations'
export * from './tribunalCases'

// Learning & Progress
export * from './courses'
export * from './progress'

// Gamification
export * from './achievements'

// User Engagement
export * from './notifications'
export * from './resources'

// Service Instances (for direct import)
export { organizationsService } from './organizations'
export { tribunalCasesService } from './tribunalCases'
export { coursesService } from './courses'
export { progressService } from './progress'
export { achievementsService } from './achievements'
export { notificationsService } from './notifications'
export { resourcesService } from './resources'
