/**
 * Environment-aware logging utility
 * 
 * Provides structured logging with different levels and automatic
 * suppression in production environments.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log general information (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warnings (all environments)
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Log errors (all environments)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context || '');
  }

  /**
   * Performance measurement (development only)
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`, context || '');
    }
  }

  /**
   * API request logging (development only)
   */
  api(method: string, url: string, status?: number, context?: LogContext): void {
    if (this.isDevelopment) {
      const statusText = status ? ` - ${status}` : '';
      console.log(`[API] ${method} ${url}${statusText}`, context || '');
    }
  }

  /**
   * Auth-related logging (development only)
   */
  auth(event: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[AUTH] ${event}`, context || '');
    }
  }

  /**
   * Database operation logging (development only)
   */
  db(operation: string, table: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DB] ${operation} on ${table}`, context || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
