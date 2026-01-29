/**
 * React hooks for Codespring API integration
 *
 * Provides easy-to-use hooks for client-side Codespring API calls
 */

import { useState, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface UseCodespringAnalyzeOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export interface CodespringAnalyzeState {
  data: any | null
  error: string | null
  isLoading: boolean
}

export interface CodespringVerifyState {
  isValid: boolean | null
  isLoading: boolean
  error: string | null
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for analyzing code with Codespring
 *
 * @example
 * const { analyzeCode, data, isLoading, error } = useCodespringAnalyze();
 *
 * await analyzeCode('console.log("hello")', 'javascript');
 */
export function useCodespringAnalyze(options?: UseCodespringAnalyzeOptions) {
  const [state, setState] = useState<CodespringAnalyzeState>({
    data: null,
    error: null,
    isLoading: false,
  })

  const analyzeCode = useCallback(
    async (code: string, language: string) => {
      setState({ data: null, error: null, isLoading: true })

      try {
        const response = await fetch('/api/codespring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, language }),
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`
          setState({ data: null, error: errorMessage, isLoading: false })
          options?.onError?.(errorMessage)
          return { success: false, error: errorMessage }
        }

        setState({ data, error: null, isLoading: false })
        options?.onSuccess?.(data)
        return { success: true, data }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze code'
        setState({ data: null, error: errorMessage, isLoading: false })
        options?.onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [options]
  )

  return {
    analyzeCode,
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
  }
}

/**
 * Hook for verifying Codespring API key
 *
 * @example
 * const { verify, isValid, isLoading, error } = useCodespringVerify();
 *
 * await verify();
 */
export function useCodespringVerify() {
  const [state, setState] = useState<CodespringVerifyState>({
    isValid: null,
    isLoading: false,
    error: null,
  })

  const verify = useCallback(async () => {
    setState({ isValid: null, isLoading: true, error: null })

    try {
      const response = await fetch('/api/codespring/verify')
      const data = await response.json()

      if (!response.ok) {
        setState({
          isValid: false,
          isLoading: false,
          error: data.error || 'Verification failed',
        })
        return { success: false, error: data.error }
      }

      setState({
        isValid: data.valid,
        isLoading: false,
        error: null,
      })
      return { success: true, valid: data.valid }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      setState({
        isValid: false,
        isLoading: false,
        error: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  return {
    verify,
    isValid: state.isValid,
    isLoading: state.isLoading,
    error: state.error,
  }
}

/**
 * Hook for checking Codespring API health
 *
 * @example
 * const { checkHealth, status, isLoading, error } = useCodespringHealth();
 *
 * await checkHealth();
 */
export function useCodespringHealth() {
  const [state, setState] = useState<{
    status: string | null
    data: any | null
    isLoading: boolean
    error: string | null
  }>({
    status: null,
    data: null,
    isLoading: false,
    error: null,
  })

  const checkHealth = useCallback(async () => {
    setState({ status: null, data: null, isLoading: true, error: null })

    try {
      const response = await fetch('/api/codespring', {
        method: 'GET',
      })
      const data = await response.json()

      if (!response.ok) {
        setState({
          status: 'error',
          data: null,
          isLoading: false,
          error: data.error || 'Health check failed',
        })
        return { success: false, error: data.error }
      }

      setState({
        status: data.status,
        data: data.data,
        isLoading: false,
        error: null,
      })
      return { success: true, status: data.status, data: data.data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed'
      setState({
        status: 'error',
        data: null,
        isLoading: false,
        error: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  return {
    checkHealth,
    status: state.status,
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  }
}
