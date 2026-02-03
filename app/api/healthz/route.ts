/**
 * Liveness Check Endpoint
 * 
 * Returns 200 if the application process is running.
 * Used by container orchestrators (Azure Container Apps, Kubernetes) to determine
 * if the container should be restarted.
 * 
 * CONTRACT:
 * - Always returns 200 if process is alive
 * - No dependency checks (DB, Redis, etc.)
 * - Minimal computation (< 1ms response time)
 * - Must not throw exceptions
 * 
 * Azure Container Apps Configuration:
 * ```yaml
 * livenessProbe:
 *   httpGet:
 *     path: /api/healthz
 *     port: 3000
 *   initialDelaySeconds: 10
 *   periodSeconds: 10
 *   timeoutSeconds: 1
 *   failureThreshold: 3
 * ```
 * 
 * @see https://learn.microsoft.com/azure/container-apps/health-probes
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'abr-insights-app',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    }
  )
}
