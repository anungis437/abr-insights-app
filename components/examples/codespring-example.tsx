/**
 * Example component demonstrating Codespring API integration
 * 
 * Location: This is a reference example, not meant to be imported directly
 * Copy this code to your actual component files as needed
 */

'use client';

import { useState } from 'react';
import { useCodespringAnalyze, useCodespringVerify, useCodespringHealth } from '@/lib/hooks/use-codespring';

export function CodespringExample() {
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [language, setLanguage] = useState('javascript');

  const { analyzeCode, data, error, isLoading } = useCodespringAnalyze({
    onSuccess: (data) => {
      console.log('Analysis complete:', data);
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
    },
  });

  const verify = useCodespringVerify();
  const health = useCodespringHealth();

  const handleAnalyze = async () => {
    await analyzeCode(code, language);
  };

  const handleVerify = async () => {
    await verify.verify();
  };

  const handleHealthCheck = async () => {
    await health.checkHealth();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Codespring API Integration</h1>

      {/* API Status Section */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">API Status</h2>
        
        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            disabled={verify.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {verify.isLoading ? 'Verifying...' : 'Verify API Key'}
          </button>

          <button
            onClick={handleHealthCheck}
            disabled={health.isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {health.isLoading ? 'Checking...' : 'Check Health'}
          </button>
        </div>

        {verify.isValid !== null && (
          <div className={`p-4 rounded ${verify.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {verify.isValid ? '✅ API key is valid' : '❌ API key is invalid'}
            {verify.error && <div className="text-sm mt-1">{verify.error}</div>}
          </div>
        )}

        {health.status && (
          <div className={`p-4 rounded ${health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            Status: {health.status}
            {health.data && (
              <pre className="text-xs mt-2 overflow-auto">
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
          <label htmlFor="language-select" className="block text-sm font-medium mb-2">
            Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded"
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
          <label className="block text-sm font-medium mb-2">
            Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            className="w-full p-2 border rounded font-mono text-sm"
            placeholder="Enter your code here..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !code}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Code'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Analysis Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
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
