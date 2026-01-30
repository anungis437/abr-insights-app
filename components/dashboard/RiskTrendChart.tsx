'use client'

/**
 * Risk Trend Chart Component
 * Displays 90-day risk score timeline with line chart
 */

import { useEffect, useState } from 'react'
import { getRiskTrends, type RiskTrend } from '@/lib/services/risk-analytics'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface RiskTrendChartProps {
  organizationId: string
  department?: string
  days?: number
  title?: string
}

export default function RiskTrendChart({
  organizationId,
  department,
  days = 90,
  title,
}: RiskTrendChartProps) {
  const [trends, setTrends] = useState<RiskTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrends()
  }, [organizationId, department, days])

  async function loadTrends() {
    try {
      setLoading(true)
      const data = await getRiskTrends(organizationId, department, days)
      setTrends(data)
    } catch (error) {
      console.error('Error loading risk trends:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title || 'Risk Trend'}</h3>
        <div className="text-center py-12 text-gray-500">
          <p>No historical data available</p>
          <p className="text-sm mt-2">Trends will appear after daily snapshots are captured</p>
        </div>
      </div>
    )
  }

  // Calculate trend direction
  const firstScore = trends[0]?.risk_score || 0
  const lastScore = trends[trends.length - 1]?.risk_score || 0
  const scoreDiff = lastScore - firstScore
  const percentChange =
    firstScore > 0 ? ((scoreDiff / firstScore) * 100).toFixed(1) : '0.0'

  // Find min and max for scaling
  const scores = trends.map((t) => t.risk_score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const scoreRange = maxScore - minScore || 1

  // Calculate chart dimensions
  const chartWidth = 800
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  // Generate SVG path for line chart
  const points = trends.map((trend, index) => {
    const x = padding.left + (index / (trends.length - 1)) * plotWidth
    const y =
      padding.top + plotHeight - ((trend.risk_score - minScore) / scoreRange) * plotHeight
    return `${x},${y}`
  })
  const linePath = `M ${points.join(' L ')}`

  // Generate area fill path
  const areaPath = `${linePath} L ${padding.left + plotWidth},${padding.top + plotHeight} L ${padding.left},${padding.top + plotHeight} Z`

  // Format dates for x-axis labels
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Select evenly spaced dates for x-axis labels
  const labelCount = 5
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.floor((i * (trends.length - 1)) / (labelCount - 1))
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title || 'Risk Trend'}</h3>
          <p className="text-sm text-gray-600">Last {days} days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{lastScore.toFixed(0)}</div>
            <div className="text-xs text-gray-500">Current Score</div>
          </div>
          <div className="flex items-center gap-2">
            {scoreDiff > 0.5 ? (
              <>
                <TrendingUp className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">+{percentChange}%</span>
              </>
            ) : scoreDiff < -0.5 ? (
              <>
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">{percentChange}%</span>
              </>
            ) : (
              <>
                <Minus className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Stable</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((score) => {
            const y = padding.top + plotHeight - ((score - minScore) / scoreRange) * plotHeight
            return (
              <g key={score}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {score}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="#3b82f6" fillOpacity="0.1" />

          {/* Line */}
          <path d={linePath} stroke="#3b82f6" strokeWidth="2" fill="none" />

          {/* Data points */}
          {trends.map((trend, index) => {
            const x = padding.left + (index / (trends.length - 1)) * plotWidth
            const y =
              padding.top + plotHeight - ((trend.risk_score - minScore) / scoreRange) * plotHeight
            return (
              <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6">
                <title>
                  {formatDate(trend.date)}: {trend.risk_score.toFixed(1)}
                </title>
              </circle>
            )
          })}

          {/* X-axis labels */}
          {labelIndices.map((index) => {
            const trend = trends[index]
            const x = padding.left + (index / (trends.length - 1)) * plotWidth
            return (
              <text
                key={index}
                x={x}
                y={padding.top + plotHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {formatDate(trend.date)}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Start ({formatDate(trends[0].date)})</div>
            <div className="text-lg font-semibold">{firstScore.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-gray-600">Average</div>
            <div className="text-lg font-semibold">
              {(scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">End ({formatDate(trends[trends.length - 1].date)})</div>
            <div className="text-lg font-semibold">{lastScore.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
