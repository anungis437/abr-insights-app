/**
 * Release Acceptance Gate Tests
 *
 * Tests the shell script logic would validate correctly.
 * The actual script is tested in CI against a real server.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Release Acceptance Gate', () => {
  const scriptPath = resolve(__dirname, '../scripts/release-acceptance.sh')

  it('should have release-acceptance.sh script', () => {
    expect(existsSync(scriptPath)).toBe(true)
  })

  it('should have execute permissions check', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('#!/usr/bin/env bash')
    expect(content).toContain('set -euo pipefail')
  })

  it('should validate required commands', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('command -v curl')
    expect(content).toContain('command -v jq')
  })

  it('should check security headers', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('Content-Security-Policy')
    expect(content).toContain('x-nonce')
    expect(content).toContain('x-correlation-id')
  })

  it('should check health endpoints', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('/api/healthz')
    expect(content).toContain('/api/readyz')
  })

  it('should support BASE_URL environment variable', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('BASE_URL')
    expect(content).toContain('http://localhost:3000')
  })

  it('should have proper exit codes', () => {
    const content = readFileSync(scriptPath, 'utf-8')
    // Check for exit code documentation and usage
    expect(content).toContain('EXIT CODES')
    expect(content).toContain('exit 1')
  })
})
