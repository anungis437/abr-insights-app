/**
 * Production Logger
 *
 * Centralized logging with different levels and structured output.
 * Integrates with monitoring services in production.
 *
 * Features:
 * - Correlation ID injection for request tracing
 * - Structured JSON logging in production
 * - Human-readable logging in development
 *
 * Usage:
 *   logger.info('User logged in', { userId: '123' })
 *   logger.error('Payment failed', { error: err, orderId: 'ord_123' })
 *   logger.warn('Rate limit approaching', { userId: '456', remaining: 5 })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  correlationId?: string
  context?: LogContext
  stack?: string
}

class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Get correlation ID from AsyncLocalStorage or request headers
   * This enables distributed tracing across async operations
   */
  private getCorrelationId(): string | undefined {
    // In API routes, this will be set by middleware
    if (typeof globalThis !== 'undefined' && (globalThis as any).__correlationId) {
      return (globalThis as any).__correlationId
    }
    return undefined
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const correlationStr = entry.correlationId ? `[${entry.correlationId}] ` : ''
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
      return `[${entry.level.toUpperCase()}] ${correlationStr}${entry.message}${contextStr}`
    }

    // JSON format for production (easy parsing by monitoring tools)
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
      correlationId: this.getCorrelationId(),
      context: context || undefined,
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
        // In production, could also send to error tracking service (Sentry, etc.)
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
   */
  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    const error = errorOrContext instanceof Error ? errorOrContext : undefined
    const ctx = errorOrContext instanceof Error ? context : errorOrContext

    // Add error details to context
    const enrichedContext = {
      ...ctx,
      ...(error && {
        errorMessage: error.message,
        errorName: error.name,
      }),
    }

    this.log('error', message, enrichedContext, error)
  }
}

// Export singleton instance
export const logger = new ProductionLogger()

// Export class for testing
export { ProductionLogger }
