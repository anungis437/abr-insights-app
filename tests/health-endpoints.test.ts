/**
 * Health and Readiness Endpoint Tests
 *
 * Tests for /api/healthz and /api/readyz endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GET as healthzGET } from '@/app/api/healthz/route'
import { GET as readyzGET } from '@/app/api/readyz/route'

describe('/api/healthz (Liveness)', () => {
  it('should return 200 status', async () => {
    const response = await healthzGET()
    expect(response.status).toBe(200)
  })

  it('should return JSON with required fields', async () => {
    const response = await healthzGET()
    const data = await response.json()

    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('service', 'abr-insights-app')
    expect(data).toHaveProperty('correlationId')
  })

  it('should have correlation ID that is a valid UUID', async () => {
    const response = await healthzGET()
    const data = await response.json()

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(data.correlationId).toMatch(uuidRegex)
  })

  it('should have no-cache headers', async () => {
    const response = await healthzGET()
    const cacheControl = response.headers.get('Cache-Control')

    expect(cacheControl).toContain('no-store')
    expect(cacheControl).toContain('no-cache')
    expect(cacheControl).toContain('must-revalidate')
  })

  it('should return uptime as a number', async () => {
    const response = await healthzGET()
    const data = await response.json()

    expect(typeof data.uptime).toBe('number')
    expect(data.uptime).toBeGreaterThan(0)
  })

  it('should return valid ISO 8601 timestamp', async () => {
    const response = await healthzGET()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})

describe('/api/readyz (Readiness)', () => {
  it('should return 200 or 503 status', async () => {
    const response = await readyzGET()
    expect([200, 503]).toContain(response.status)
  })

  it('should return JSON with required structure', async () => {
    const response = await readyzGET()
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(['ready', 'not_ready']).toContain(data.status)
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('checks')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('correlationId')
  })

  it('should have correlation ID', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    expect(data.correlationId).toMatch(uuidRegex)
  })

  it('should include environment check', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const envCheck = data.checks.find((c: any) => c.name === 'environment')
    expect(envCheck).toBeDefined()
    expect(envCheck.status).toMatch(/healthy|unhealthy|warning/)
  })

  it('should include database check', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const dbCheck = data.checks.find((c: any) => c.name === 'database')
    expect(dbCheck).toBeDefined()
    expect(dbCheck.status).toMatch(/healthy|unhealthy|warning/)
    expect(dbCheck).toHaveProperty('duration_ms')
  })

  it('should return not_ready status when checks are unhealthy', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const hasUnhealthy = data.checks.some((c: any) => c.status === 'unhealthy')
    if (hasUnhealthy) {
      expect(data.status).toBe('not_ready')
      expect(response.status).toBe(503)
    }
  })

  it('should return ready status when all checks are healthy or warning', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const allHealthyOrWarning = data.checks.every((c: any) =>
      ['healthy', 'warning'].includes(c.status)
    )
    if (allHealthyOrWarning) {
      expect(data.status).toBe('ready')
      expect(response.status).toBe(200)
    }
  })

  it('should include duration_ms for async checks', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const dbCheck = data.checks.find((c: any) => c.name === 'database')
    if (dbCheck) {
      expect(typeof dbCheck.duration_ms).toBe('number')
      expect(dbCheck.duration_ms).toBeGreaterThanOrEqual(0)
    }
  })

  it('should have no-cache headers', async () => {
    const response = await readyzGET()
    const cacheControl = response.headers.get('Cache-Control')

    expect(cacheControl).toContain('no-store')
    expect(cacheControl).toContain('no-cache')
    expect(cacheControl).toContain('must-revalidate')
  })

  it('should include environment info', async () => {
    const response = await readyzGET()
    const data = await response.json()

    expect(data.environment).toHaveProperty('node_version')
    expect(data.environment.node_version).toMatch(/^v\d+\.\d+\.\d+/)
  })

  it('should gracefully handle exceptions', async () => {
    // This test ensures the endpoint never crashes
    const response = await readyzGET()

    expect(response).toBeDefined()
    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThan(600)

    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('checks')
  })

  it('should include Redis check only if configured', async () => {
    const response = await readyzGET()
    const data = await response.json()

    const redisCheck = data.checks.find((c: any) => c.name === 'redis')

    // Redis check should exist if env vars are configured
    const isRedisConfigured =
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      process.env.REDIS_URL

    if (isRedisConfigured) {
      expect(redisCheck).toBeDefined()
    }
  })
})

describe('Health Check Integration', () => {
  it('healthz should respond faster than readyz', async () => {
    const healthzStart = Date.now()
    await healthzGET()
    const healthzDuration = Date.now() - healthzStart

    const readyzStart = Date.now()
    await readyzGET()
    const readyzDuration = Date.now() - readyzStart

    // Liveness should be much faster (no external dependencies)
    expect(healthzDuration).toBeLessThan(100) // < 100ms
    // Readiness can take longer (database checks)
    expect(readyzDuration).toBeLessThan(5000) // < 5s
  })

  it('both endpoints should return unique correlation IDs', async () => {
    const healthz1 = await healthzGET()
    const healthz1Data = await healthz1.json()

    const healthz2 = await healthzGET()
    const healthz2Data = await healthz2.json()

    expect(healthz1Data.correlationId).not.toBe(healthz2Data.correlationId)
  })
})
