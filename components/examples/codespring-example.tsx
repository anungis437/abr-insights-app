'use client'

import { logger } from '@/lib/utils/production-logger'
/**
 * Example component demonstrating Codespring API integration
 *
 * Location: This is a reference example, not meant to be imported directly
 * Copy this code to your actual component files as needed
 */


import { useState } from 'react'
import {
  useCodespringAnalyze,
  useCodespringVerify,
  useCodespringHealth,
} from '@/lib/hooks/use-codespring'

export function CodespringExample() {
  const [code, setCode] = useState('logger.info(\'Hello, World!\', { context: \'CodespringExample\' });')
  const [language, setLanguage] = useState('javascript')

  const { analyzeCode, data, error, isLoading } = useCodespringAnalyze({
    onSuccess: (data) => {
      logger.info('Analysis complete:', { data, context: 'CodespringExample' })
    },
    onError: (error) => {
      logger.error('Analysis failed:', { error: error, context: 'CodespringExample' })
    },
  })

  const verify = useCodespringVerify()
  const health = useCodespringHealth()

  const handleAnalyze = async () => {
    await analyzeCode(code, language)
  }

  const handleVerify = async () => {
    await verify.verify()
  }

  const handleHealthCheck = async () => {
    await health.checkHealth()
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Codespring API Integration</h1>

      {/* API Status Section */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">API Status</h2>

        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            disabled={verify.isLoading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {verify.isLoading ? 'Verifying...' : 'Verify API Key'}
          </button>

          <button
            onClick={handleHealthCheck}
            disabled={health.isLoading}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {health.isLoading ? 'Checking...' : 'Check Health'}
          </button>
        </div>

        {verify.isValid !== null && (
          <div
            className={`rounded p-4 ${verify.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {verify.isValid ? 'âœ… API key is valid' : 'âŒ API key is invalid'}
            {verify.error && <div className="mt-1 text-sm">{verify.error}</div>}
          </div>
        )}

        {health.status && (
          <div
            className={`rounded p-4 ${health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
          >
            Status: {health.status}
            {health.data && (
              <pre className="mt-2 overflow-auto text-xs">
                {JSON.stringify(health.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Code Analysis Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Code Analysis</h2>

        <div>
          <label htmlFor="language-select" className="mb-2 block text-sm font-medium">
            Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded border p-2"
            aria-label="Select programming language"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            className="w-full rounded border p-2 font-mono text-sm"
            placeholder="Enter your code here..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !code}
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Code'}
        </button>

        {error && (
          <div className="rounded bg-red-100 p-4 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && (
          <div className="rounded bg-gray-100 p-4">
            <h3 className="mb-2 font-semibold">Analysis Result:</h3>
            <pre className="overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Usage in your pages/components:
 *
 * import { CodespringExample } from '@/components/examples/codespring-example';
 *
 * export default function TestPage() {
 *   return <CodespringExample />;
 * }
 */
