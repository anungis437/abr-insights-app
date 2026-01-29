/**
 * Codespring API Client Service
 *
 * Provides type-safe methods for interacting with the Codespring API.
 * Documentation: https://docs.codespring.ai (update with actual URL)
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CodespringConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

export interface CodespringRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  body?: any
  headers?: Record<string, string>
}

export interface CodespringResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

// Example response types - update based on actual API
export interface CodespringAnalysisResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  createdAt: string
  completedAt?: string
}

export interface CodespringHealthCheck {
  status: 'healthy' | 'degraded' | 'down'
  version: string
  timestamp: string
}

// ============================================================================
// Codespring API Client Class
// ============================================================================

export class CodespringClient {
  private apiKey: string
  private baseUrl: string
  private timeout: number

  constructor(config: CodespringConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.codespring.ai'
    this.timeout = config.timeout || 30000

    if (!this.apiKey) {
      throw new Error('Codespring API key is required')
    }
  }

  /**
   * Make a request to the Codespring API
   */
  private async makeRequest<T>(request: CodespringRequest): Promise<CodespringResponse<T>> {
    const { method = 'GET', endpoint, body, headers = {} } = request

    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        }
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: `Request timeout after ${this.timeout}ms`,
            statusCode: 408,
          }
        }
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        }
      }

      return {
        success: false,
        error: 'Unknown error occurred',
        statusCode: 500,
      }
    }
  }

  /**
   * Health check - verify API is accessible
   */
  async healthCheck(): Promise<CodespringResponse<CodespringHealthCheck>> {
    return this.makeRequest<CodespringHealthCheck>({
      method: 'GET',
      endpoint: '/health',
    })
  }

  /**
   * Verify API key is valid
   */
  async verifyApiKey(): Promise<CodespringResponse<{ valid: boolean; message?: string }>> {
    return this.makeRequest({
      method: 'GET',
      endpoint: '/auth/verify',
    })
  }

  /**
   * Example: Analyze code (update based on actual API endpoints)
   */
  async analyzeCode(
    code: string,
    language: string
  ): Promise<CodespringResponse<CodespringAnalysisResult>> {
    return this.makeRequest<CodespringAnalysisResult>({
      method: 'POST',
      endpoint: '/analyze',
      body: {
        code,
        language,
      },
    })
  }

  /**
   * Example: Get analysis result by ID
   */
  async getAnalysisResult(
    analysisId: string
  ): Promise<CodespringResponse<CodespringAnalysisResult>> {
    return this.makeRequest<CodespringAnalysisResult>({
      method: 'GET',
      endpoint: `/analyze/${analysisId}`,
    })
  }

  /**
   * Generic method for custom endpoints
   */
  async request<T>(request: CodespringRequest): Promise<CodespringResponse<T>> {
    return this.makeRequest<T>(request)
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a Codespring client instance
 */
export function createCodespringClient(apiKey?: string): CodespringClient {
  const key = apiKey || process.env.CODESPRING_API_KEY

  if (!key) {
    throw new Error('CODESPRING_API_KEY environment variable is not set')
  }

  return new CodespringClient({ apiKey: key })
}

/**
 * Get singleton instance (use in API routes)
 */
let clientInstance: CodespringClient | null = null

export function getCodespringClient(): CodespringClient {
  if (!clientInstance) {
    clientInstance = createCodespringClient()
  }
  return clientInstance
}

/**
 * Verify API key is valid
 */
export async function verifyCodespringApiKey(apiKey?: string): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    const client = apiKey ? createCodespringClient(apiKey) : getCodespringClient()
    const response = await client.verifyApiKey()

    return {
      valid: response.success,
      error: response.error,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify API key',
    }
  }
}
