/**
 * Observability Logger with Request Correlation
 *
 * Production-grade structured logging with:
 * - Request correlation IDs for distributed tracing
 * - Automatic context enrichment (org_id, user_id, route)
 * - JSON formatting in production, human-readable in development
 * - Error sanitization (full errors server-side, safe messages client-side)
 * - Integration-ready for Application Insights / OpenTelemetry
 *
 * Usage in API routes:
 *   const logger = createRequestLogger(request)
 *   logger.info('User action', { action: 'login' })
 *   logger.error('Payment failed', { error, orderId })
 *
 * Usage in services/lib:
 *   logger.info('Background job started', { jobId })
 *   logger.warn('Rate limit approaching', { userId, remaining: 5 })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  request_id?: string
  org_id?: string
  user_id?: string
  route?: string
  method?: string
  context?: LogContext
  stack?: string
  error_name?: string
  error_message?: string
}

interface RequestLoggerOptions {
  request_id: string
  route?: string
  method?: string
  user_id?: string
  org_id?: string
}

class ObservabilityLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  private options?: RequestLoggerOptions

  constructor(options?: RequestLoggerOptions) {
    this.options = options
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const requestId = entry.request_id ? `[${entry.request_id.slice(0, 8)}]` : ''
      const route = entry.route ? ` ${entry.method} ${entry.route}` : ''
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
      return `[${entry.level.toUpperCase()}]${requestId}${route} ${entry.message}${contextStr}`
    }

    // Structured JSON for production (Application Insights / OpenTelemetry)
    return JSON.stringify(entry)
  }

  /**
   * Write log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      request_id: this.options?.request_id,
      org_id: this.options?.org_id,
      user_id: this.options?.user_id,
      route: this.options?.route,
      method: this.options?.method,
      context: context || undefined,
      error_name: error?.name,
      error_message: error?.message,
      stack: error?.stack,
    }

    const formatted = this.formatLog(entry)

    // Output to appropriate stream
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        // TODO: Send to Application Insights / Sentry in production
        break
    }
  }

  /**
   * Debug logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Info logging (general information)
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Warning logging (non-critical issues)
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Error logging (critical issues)
   * Accepts error object or context as second parameter
   */
  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined
    const ctx = errorOrContext instanceof Error ? context : errorOrContext

    // Add error details to context
    const enrichedContext = {
      ...ctx,
      ...(error && {
        error_type: error.constructor.name,
      }),
    }

    this.log('error', message, enrichedContext, error)
  }

  /**
   * Log API request start
   */
  logRequestStart(): void {
    this.info('Request started', {
      route: this.options?.route,
      method: this.options?.method,
    })
  }

  /**
   * Log API request end with duration
   */
  logRequestEnd(startTime: number, statusCode: number): void {
    const duration = Date.now() - startTime
    this.info('Request completed', {
      route: this.options?.route,
      method: this.options?.method,
      status_code: statusCode,
      duration_ms: duration,
    })
  }
}

/**
 * Create a logger instance with request correlation
 * Use this in API routes to get automatic request context
 */
export function createRequestLogger(request: Request): ObservabilityLogger {
  const url = new URL(request.url)
  const request_id = request.headers.get('x-correlation-id') || crypto.randomUUID()

  return new ObservabilityLogger({
    request_id,
    route: url.pathname,
    method: request.method,
  })
}

/**
 * Enhance logger with user/org context after authentication
 */
export function enrichLogger(
  logger: ObservabilityLogger,
  userId?: string,
  orgId?: string
): ObservabilityLogger {
  // Create new logger with enriched context
  const currentOptions = (logger as any).options || {}
  return new ObservabilityLogger({
    ...currentOptions,
    user_id: userId,
    org_id: orgId,
  })
}

/**
 * Global logger instance for non-request contexts (background jobs, services)
 */
export const logger = new ObservabilityLogger()

/**
 * Sanitize error for client response
 * Returns safe error message, logs full details server-side
 */
export function sanitizeError(error: unknown, logger: ObservabilityLogger): { error: string } {
  if (error instanceof Error) {
    // Log full error server-side
    logger.error('Error occurred', error)

    // Return safe message to client
    if (process.env.NODE_ENV === 'production') {
      return { error: 'An unexpected error occurred' }
    } else {
      // Include error message in development
      return { error: error.message }
    }
  }

  // Unknown error type
  logger.error('Unknown error occurred', { error })
  return { error: 'An unexpected error occurred' }
}

// Export class for testing
export { ObservabilityLogger }
