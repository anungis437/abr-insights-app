/**
 * Simple Logger Utility
 * Provides structured logging for the ingestion pipeline
 */

export const logger = {
  debug: (message: string, data?: Record<string, any>) => {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '')
    }
  },

  info: (message: string, data?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, data || '')
  },

  warn: (message: string, data?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, data || '')
  },

  error: (message: string, data?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, data || '')
  },
}
