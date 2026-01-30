'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, FileText, Download, RefreshCw, AlertCircle } from 'lucide-react'
import { generateCaseDigest, type CaseDigest } from '@/lib/services/case-alerts'

export default function DigestsPage() {
  const router = useRouter()
  const [digests, setDigests] = useState<CaseDigest[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadDigests()
  }, [])

  const loadDigests = async () => {
    setLoading(true)
    try {
      // TODO: Implement getDigests function in service layer
      // const data = await getDigests('org-id-placeholder')
      // setDigests(data)
      setDigests([])
    } catch (error) {
      console.error('Failed to load digests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDigest = async () => {
    setGenerating(true)
    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // TODO: Get actual org ID from auth context
      const digest = await generateCaseDigest(
        'org-id-placeholder',
        weekAgo.toISOString(),
        now.toISOString()
      )

      alert('Digest generated successfully!')
      loadDigests()
    } catch (error) {
      console.error('Failed to generate digest:', error)
      alert('Failed to generate digest. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadDigest = (digest: CaseDigest) => {
    const content = `
Case Alerts Digest
Period: ${new Date(digest.digest_period_start).toLocaleDateString()} - ${new Date(digest.digest_period_end).toLocaleDateString()}
Generated: ${new Date(digest.generated_at).toLocaleString()}

SUMMARY
${digest.summary}

STATISTICS
- Total Cases: ${digest.total_cases}
- High Priority Cases: ${digest.high_priority_cases}

CASES BY CATEGORY
${Object.entries(digest.cases_by_category)
  .map(([cat, count]) => `- ${cat}: ${count}`)
  .join('\n')}

KEY FINDINGS
${digest.key_findings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `case-digest-${new Date(digest.digest_period_start).toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading digests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Digests</h1>
          <p className="text-muted-foreground mt-1">Periodic summaries of tribunal case alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateDigest} disabled={generating}>
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Digest
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="mb-1 font-semibold text-blue-900">About Case Digests</h3>
              <p className="text-sm text-blue-800">
                Digests provide a consolidated view of all tribunal case alerts over a specified
                period. They include statistics, categorization, and key findings to help you
                quickly assess the most important developments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digests List */}
      {digests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                No digests have been generated yet. Click "Generate Digest" to create your first
                one.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {digests.map((digest) => (
            <Card key={digest.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      <Calendar className="text-muted-foreground mr-2 inline h-5 w-5" />
                      {new Date(digest.digest_period_start).toLocaleDateString()} -{' '}
                      {new Date(digest.digest_period_end).toLocaleDateString()}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Generated {new Date(digest.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-sm"
                    onClick={() => downloadDigest(digest)}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics */}
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold">{digest.total_cases}</div>
                    <div className="text-muted-foreground text-xs">Total Cases</div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-2xl font-bold text-red-600">
                      {digest.high_priority_cases}
                    </div>
                    <div className="text-muted-foreground text-xs">High Priority</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.keys(digest.cases_by_category).length}
                    </div>
                    <div className="text-muted-foreground text-xs">Categories</div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {digest.key_findings.length}
                    </div>
                    <div className="text-muted-foreground text-xs">Key Findings</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h4 className="mb-2 font-semibold">Summary</h4>
                  <p className="text-muted-foreground text-sm">{digest.summary}</p>
                </div>

                {/* Cases by Category */}
                {Object.keys(digest.cases_by_category).length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 font-semibold">Cases by Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(digest.cases_by_category).map(([category, count]) => (
                        <Badge key={category} variant="secondary">
                          {category.replace('_', ' ')}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Findings */}
                {digest.key_findings.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold">
                      <TrendingUp className="h-4 w-4" />
                      Key Findings
                    </h4>
                    <ul className="space-y-1">
                      {digest.key_findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">{idx + 1}.</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
