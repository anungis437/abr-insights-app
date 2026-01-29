'use client'

/**
 * Admin ML Management Page
 *
 * Comprehensive interface for managing ML features:
 * - Embedding generation and monitoring
 * - Semantic similarity search testing
 * - Outcome prediction model monitoring
 * - Performance metrics and analytics
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Database,
  Brain,
  Search,
  TrendingUp,
} from 'lucide-react'

interface EmbeddingJob {
  id: string
  job_type: string
  status: string
  total_items: number
  processed_items: number
  failed_items: number
  metrics: any
  created_at: string
}

interface SearchResult {
  case_id?: string
  course_id?: string
  case_title?: string
  course_title?: string
  similarity_score: number
  tribunal_name?: string
  difficulty?: string
}

export default function AdminMLPage() {
  const [activeTab, setActiveTab] = useState('embeddings')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Embeddings state
  const [embeddingJobs, setEmbeddingJobs] = useState<EmbeddingJob[]>([])
  const [coverageStats, setCoverageStats] = useState<any>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'cases' | 'courses'>('cases')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)

  // Outcome prediction state
  const [predictionStats, setPredictionStats] = useState<any>(null)
  const [modelPerformance, setModelPerformance] = useState<any>(null)

  useEffect(() => {
    loadEmbeddingJobs()
    loadCoverageStats()
    loadPredictionStats()
    loadModelPerformance()
  }, [])

  // =====================================================
  // Embeddings Functions
  // =====================================================

  const loadEmbeddingJobs = async () => {
    try {
      const response = await fetch('/api/admin/ml/embedding-jobs')
      const data = await response.json()
      if (data.success) {
        setEmbeddingJobs(data.jobs)
      }
    } catch (err) {
      console.error('Failed to load embedding jobs:', err)
    }
  }

  const loadCoverageStats = async () => {
    try {
      const response = await fetch('/api/admin/ml/coverage-stats')
      const data = await response.json()
      if (data.success) {
        setCoverageStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load coverage stats:', err)
    }
  }

  const generateEmbeddings = async (type: 'cases' | 'courses') => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          embeddingType: type === 'cases' ? 'full_text' : 'full_content',
          batchSize: 100,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Successfully started embedding generation for ${type}`)
        await loadEmbeddingJobs()
      } else {
        setError(data.error || 'Failed to generate embeddings')
      }
    } catch (err) {
      setError('An error occurred while generating embeddings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // Search Functions
  // =====================================================

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const endpoint =
        searchType === 'cases' ? '/api/embeddings/search-cases' : '/api/embeddings/search-courses'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          similarityThreshold,
          maxResults: 10,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSearchResults(data.results)
        setSuccess(`Found ${data.resultsCount} similar ${searchType}`)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('An error occurred during search')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // Outcome Prediction Functions
  // =====================================================

  const loadPredictionStats = async () => {
    try {
      const response = await fetch('/api/admin/ml/prediction-stats')
      const data = await response.json()
      if (data.success) {
        setPredictionStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load prediction stats:', err)
    }
  }

  const loadModelPerformance = async () => {
    try {
      const response = await fetch('/api/admin/ml/model-performance')
      const data = await response.json()
      if (data.success) {
        setModelPerformance(data.performance)
      }
    } catch (err) {
      console.error('Failed to load model performance:', err)
    }
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="container mx-auto px-4 pb-8 pt-20">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">ML Features Management</h1>
        <p className="text-muted-foreground">
          Manage embeddings, semantic search, and outcome prediction models
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="embeddings">
            <Database className="mr-2 h-4 w-4" />
            Embeddings
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Search Test
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <Brain className="mr-2 h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Embeddings Tab */}
        <TabsContent value="embeddings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Embedding Coverage</CardTitle>
              <CardDescription>
                Current embedding generation status across all content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coverageStats && coverageStats.length > 0 ? (
                <div className="space-y-4">
                  {coverageStats.map((stat: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {stat.entity_type.replace('_', ' ')}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {stat.embedded_entities}/{stat.total_entities} ({stat.coverage_percentage}
                          %)
                        </span>
                      </div>
                      <Progress value={stat.coverage_percentage} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Loading coverage statistics...</p>
              )}

              <div className="mt-6 flex gap-4">
                <Button onClick={() => generateEmbeddings('cases')} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Case Embeddings
                </Button>
                <Button
                  onClick={() => generateEmbeddings('courses')}
                  disabled={loading}
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Course Embeddings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Embedding Jobs</CardTitle>
              <CardDescription>
                Track batch embedding generation progress and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {embeddingJobs.length > 0 ? (
                    embeddingJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.job_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.status === 'completed'
                                ? 'default'
                                : job.status === 'failed'
                                  ? 'destructive'
                                  : job.status === 'running'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {job.processed_items}/{job.total_items}
                              {job.failed_items > 0 && ` (${job.failed_items} failed)`}
                            </div>
                            <Progress
                              value={(job.processed_items / job.total_items) * 100}
                              className="w-24"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.metrics?.durationSeconds
                            ? `${Math.round(job.metrics.durationSeconds)}s`
                            : '-'}
                        </TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        No embedding jobs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Test Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Similarity Search</CardTitle>
              <CardDescription>
                Test semantic search functionality across cases and courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchType">Search Type</Label>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger id="searchType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cases">Tribunal Cases</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Similarity Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchQuery">Search Query</Label>
                <Input
                  id="searchQuery"
                  placeholder={`Enter search query for ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                />
              </div>

              <Button
                onClick={performSearch}
                disabled={loading || !searchQuery.trim()}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Search
              </Button>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                  <div className="space-y-2">
                    {searchResults.map((result, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {result.case_title || result.course_title}
                              </h4>
                              {result.tribunal_name && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {result.tribunal_name}
                                </p>
                              )}
                              {result.difficulty && (
                                <Badge variant="outline" className="mt-2">
                                  {result.difficulty}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="secondary">
                              {Math.round(result.similarity_score * 100)}% match
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{predictionStats?.totalPredictions || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validated Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{predictionStats?.validatedPredictions || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {modelPerformance?.accuracy
                    ? `${Math.round(modelPerformance.accuracy * 100)}%`
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {modelPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Metrics</CardTitle>
                <CardDescription>
                  Current statistical model performance on validation set
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Precision</p>
                    <p className="text-2xl font-bold">
                      {Math.round((modelPerformance.precision || 0) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Recall</p>
                    <p className="text-2xl font-bold">
                      {Math.round((modelPerformance.recall || 0) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">F1 Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round((modelPerformance.f1Score || 0) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">AUC-ROC</p>
                    <p className="text-2xl font-bold">
                      {Math.round((modelPerformance.aucRoc || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ML Features Overview</CardTitle>
              <CardDescription>Summary of all ML capabilities and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Vector Embeddings</h4>
                    <p className="text-muted-foreground text-sm">
                      Azure OpenAI text-embedding-3-large (1536 dimensions)
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Semantic Similarity Search</h4>
                    <p className="text-muted-foreground text-sm">
                      HNSW index for fast approximate nearest neighbor search
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Outcome Prediction</h4>
                    <p className="text-muted-foreground text-sm">
                      Statistical ensemble model with confidence scoring
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Continuous Learning</h4>
                    <p className="text-muted-foreground text-sm">
                      Models improve from validated predictions feedback
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
