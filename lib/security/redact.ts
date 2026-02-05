/**
 * Security Redaction Utilities
 *
 * Provides functions to redact sensitive information from logs and audit trails.
 * Ensures compliance with privacy regulations (PIPEDA, GDPR) by removing PII.
 */

/**
 * Redaction patterns for common sensitive data
 */
const REDACTION_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone numbers (various formats)
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Social Insurance Number (Canadian)
  sin: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g,

  // JWT tokens
  jwt: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,

  // API keys (common formats)
  apiKey: /\b[a-zA-Z0-9]{32,}\b/g,

  // IPv4 addresses (partial redaction, keep first octet)
  ipv4: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,

  // Long IDs/UUIDs (over 20 chars)
  longId: /\b[a-f0-9]{20,}\b/gi,

  // UUID format
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
}

/**
 * Redact email addresses
 * Example: john.doe@example.com → j***e@e***.com
 */
function redactEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '[REDACTED_EMAIL]'

  const redactedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***'

  const domainParts = domain.split('.')
  const redactedDomain =
    domainParts.length > 1
      ? `${domainParts[0][0]}***.${domainParts[domainParts.length - 1]}`
      : '***'

  return `${redactedLocal}@${redactedDomain}`
}

/**
 * Redact phone numbers
 * Example: +1-555-123-4567 → +1-***-***-4567
 */
function redactPhone(phone: string): string {
  // Keep country code and last 4 digits
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    const last4 = digits.slice(-4)
    return `***-***-${last4}`
  }
  return '[REDACTED_PHONE]'
}

/**
 * Redact credit card numbers
 * Example: 4532-1234-5678-9010 → ****-****-****-9010
 */
function redactCreditCard(cc: string): string {
  const digits = cc.replace(/\D/g, '')
  if (digits.length >= 13) {
    const last4 = digits.slice(-4)
    return `****-****-****-${last4}`
  }
  return '[REDACTED_CC]'
}

/**
 * Redact tokens (JWT, API keys, etc.)
 * Shows first 4 and last 4 characters
 */
function redactToken(token: string): string {
  if (token.length <= 8) {
    return '[REDACTED_TOKEN]'
  }
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

/**
 * Redact IP addresses
 * Keep first octet, mask the rest
 * Example: 192.168.1.100 → 192.***.***.**
 */
function redactIpAddress(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.***.***.**`
  }
  return '[REDACTED_IP]'
}

/**
 * Redact UUIDs and long IDs
 * Keep first 4 and last 4 characters
 */
function redactId(id: string): string {
  if (id.length <= 8) {
    return '[REDACTED_ID]'
  }
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`
}

/**
 * Redact sensitive information from a string
 *
 * @param text - Text to redact
 * @param options - Redaction options
 * @returns Redacted text
 */
export function redactString(
  text: string,
  options: {
    emails?: boolean
    phones?: boolean
    creditCards?: boolean
    tokens?: boolean
    ips?: boolean
    ids?: boolean
    all?: boolean
  } = { all: true }
): string {
  let result = text

  const shouldRedact = (field: keyof typeof options) => options.all || options[field]

  if (shouldRedact('emails')) {
    result = result.replace(REDACTION_PATTERNS.email, (match) => redactEmail(match))
  }

  if (shouldRedact('phones')) {
    result = result.replace(REDACTION_PATTERNS.phone, (match) => redactPhone(match))
  }

  if (shouldRedact('creditCards')) {
    result = result.replace(REDACTION_PATTERNS.creditCard, (match) => redactCreditCard(match))
  }

  // SIN numbers (Canadian)
  if (shouldRedact('all')) {
    result = result.replace(REDACTION_PATTERNS.sin, '[REDACTED_SIN]')
  }

  if (shouldRedact('tokens')) {
    result = result.replace(REDACTION_PATTERNS.jwt, (match) => redactToken(match))
    result = result.replace(REDACTION_PATTERNS.apiKey, (match) => redactToken(match))
  }

  if (shouldRedact('ips')) {
    result = result.replace(REDACTION_PATTERNS.ipv4, (match) => redactIpAddress(match))
  }

  if (shouldRedact('ids')) {
    result = result.replace(REDACTION_PATTERNS.uuid, (match) => redactId(match))
    result = result.replace(REDACTION_PATTERNS.longId, (match) => redactId(match))
  }

  return result
}

/**
 * Redact sensitive fields from an object
 *
 * @param obj - Object to redact
 * @param sensitiveFields - Array of field names to redact
 * @returns Redacted object (shallow copy)
 */
export function redactObject<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = [
    'password',
    'secret',
    'token',
    'api_key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'privateKey',
    'creditCard',
    'ssn',
    'sin',
  ]
): T {
  const redacted = { ...obj }

  for (const key in redacted) {
    if (Object.prototype.hasOwnProperty.call(redacted, key)) {
      const lowerKey = key.toLowerCase()

      // Check if this field should be redacted
      const shouldRedact = sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))

      if (shouldRedact) {
        if (typeof redacted[key] === 'string') {
          redacted[key] = redactToken(redacted[key]) as any
        } else {
          redacted[key] = '[REDACTED]' as any
        }
      } else if (typeof redacted[key] === 'string') {
        // Redact patterns in string values
        redacted[key] = redactString(redacted[key]) as any
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        // Recursively redact nested objects
        redacted[key] = redactObject(redacted[key], sensitiveFields) as any
      }
    }
  }

  return redacted
}

/**
 * Redact AI prompts and responses
 *
 * Removes PII while preserving structure and context.
 * Useful for logging AI interactions safely.
 */
export function redactAIContent(content: string): string {
  let result = content

  // Redact common PII patterns
  result = redactString(result)

  // Redact potential names (basic heuristic)
  // Look for capitalized words that might be names
  result = result.replace(/\b([A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b/g, (match) => {
    // Don't redact if it's at the start of a sentence or common words
    const commonWords = ['The', 'This', 'That', 'These', 'Those', 'Hello', 'Hi', 'Hey']
    if (commonWords.some((word) => match.startsWith(word))) {
      return match
    }
    return '[NAME_REDACTED]'
  })

  return result
}

/**
 * Create a safe summary of data for logging
 *
 * Useful for logging request/response bodies while preserving privacy.
 */
export function createSafeSummary(data: any, maxDepth = 2, currentDepth = 0): any {
  if (currentDepth >= maxDepth) {
    return '[TRUNCATED]'
  }

  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.length > 5
      ? `[Array(${data.length})]`
      : data.map((item) => createSafeSummary(item, maxDepth, currentDepth + 1))
  }

  if (typeof data === 'object') {
    const summary: Record<string, any> = {}
    const keys = Object.keys(data)

    if (keys.length > 10) {
      return `{Object with ${keys.length} keys}`
    }

    for (const key of keys) {
      summary[key] = createSafeSummary(data[key], maxDepth, currentDepth + 1)
    }

    return redactObject(summary)
  }

  if (typeof data === 'string' && data.length > 200) {
    return `${redactString(data.substring(0, 200))}... [${data.length} chars]`
  }

  if (typeof data === 'string') {
    return redactString(data)
  }

  return data
}
