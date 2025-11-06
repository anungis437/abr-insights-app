/**
 * Shared Utilities
 * 
 * Common helper functions used across the ingestion pipeline.
 */

import type { RateLimiterConfig, RetryConfig } from '../types';

// ============================================================================
// RATE LIMITER
// ============================================================================

/**
 * Token bucket rate limiter for respectful web scraping
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.tokens = config.burstSize || config.requestsPerSecond;
    this.lastRefill = Date.now();
  }

  /**
   * Waits until a token is available, then consumes it
   */
  async acquire(): Promise<void> {
    while (this.tokens < 1) {
      await this.refill();
      await sleep(100); // Check every 100ms
    }

    this.tokens -= 1;
    
    // Enforce minimum delay between requests
    if (this.config.minDelayMs) {
      await sleep(this.config.minDelayMs);
    }
  }

  /**
   * Refills tokens based on elapsed time
   */
  private async refill(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.config.requestsPerSecond;
    
    const maxTokens = this.config.burstSize || this.config.requestsPerSecond;
    this.tokens = Math.min(this.tokens + tokensToAdd, maxTokens);
    this.lastRefill = now;
  }

  /**
   * Resets the rate limiter
   */
  reset(): void {
    this.tokens = this.config.burstSize || this.config.requestsPerSecond;
    this.lastRefill = Date.now();
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Retries an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  context?: string
): Promise<T> {
  let lastError: Error | undefined;
  let delay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if error is retryable
      const isRetryable = config.retryableErrors.some(
        errCode => lastError?.message.includes(errCode)
      );

      if (!isRetryable || attempt === config.maxAttempts) {
        throw lastError;
      }

      // Log retry attempt
      const contextStr = context ? ` (${context})` : '';
      console.warn(
        `⚠️  Attempt ${attempt}/${config.maxAttempts} failed${contextStr}: ${lastError.message}`
      );
      console.warn(`   Retrying in ${delay}ms...`);

      // Wait before retry
      await sleep(delay);

      // Exponential backoff with max cap
      delay = Math.min(
        delay * config.backoffMultiplier,
        config.maxDelayMs
      );
    }
  }

  throw lastError;
}

// ============================================================================
// SLEEP UTILITY
// ============================================================================

/**
 * Async sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEXT PROCESSING
// ============================================================================

/**
 * Cleans extracted text (remove extra whitespace, normalize)
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();
}

/**
 * Truncates text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extracts a preview from text (first N words)
 */
export function extractPreview(text: string, wordCount: number = 50): string {
  const words = text.split(/\s+/).slice(0, wordCount);
  return words.join(' ') + (words.length < wordCount ? '' : '...');
}

/**
 * Calculates text similarity using Jaccard index
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Normalizes a URL (removes fragments, trailing slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = ''; // Remove fragment
    parsed.search = ''; // Remove query params for deduplication
    let normalized = parsed.toString();
    
    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  } catch {
    return url;
  }
}

/**
 * Resolves a relative URL against a base URL
 */
export function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Parses various date formats commonly found in tribunal decisions
 */
export function parseFlexibleDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Common Canadian date formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // Month DD, YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch {
        // Continue to next format
      }
    }
  }

  return undefined;
}

/**
 * Formats date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code?: string,
  metadata?: Record<string, any>
): Error & { code?: string; metadata?: Record<string, any> } {
  const error = new Error(message) as any;
  if (code) error.code = code;
  if (metadata) error.metadata = metadata;
  return error;
}

/**
 * Extracts error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Extracts error stack safely
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Checks if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if text meets minimum quality standards
 */
export function isValidText(text: string, minLength: number = 100): boolean {
  if (!text || text.trim().length < minLength) {
    return false;
  }
  
  // Check if text is not just whitespace or repeated characters
  const uniqueChars = new Set(text.toLowerCase()).size;
  return uniqueChars > 20; // Should have at least 20 unique characters
}

/**
 * Validates case number format (basic check)
 */
export function isValidCaseNumber(caseNumber: string): boolean {
  if (!caseNumber) return false;
  
  // Should contain digits and be reasonably short
  return /\d/.test(caseNumber) && caseNumber.length < 100;
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Formats a log message with timestamp
 */
export function formatLogMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

/**
 * Progress bar utility for console output
 */
export class ProgressBar {
  private current: number = 0;
  private readonly total: number;
  private readonly width: number = 40;
  private readonly label: string;

  constructor(total: number, label: string = 'Progress') {
    this.total = total;
    this.label = label;
  }

  update(current: number): void {
    this.current = current;
    this.render();
  }

  increment(): void {
    this.current = Math.min(this.current + 1, this.total);
    this.render();
  }

  complete(): void {
    this.current = this.total;
    this.render();
    console.log(); // New line after completion
  }

  private render(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const filled = Math.round((this.current / this.total) * this.width);
    const bar = '█'.repeat(filled) + '░'.repeat(this.width - filled);
    
    process.stdout.write(
      `\r${this.label}: [${bar}] ${percentage}% (${this.current}/${this.total})`
    );
  }
}

// ============================================================================
// HASH UTILITIES
// ============================================================================

/**
 * Simple hash function for deduplication
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates a content fingerprint for duplicate detection
 */
export function generateContentFingerprint(content: string): string {
  // Normalize and hash significant portions
  const normalized = cleanText(content.toLowerCase());
  const sample = normalized.slice(0, 1000) + normalized.slice(-1000);
  return simpleHash(sample);
}
