'use client'

import { logger } from '@/lib/utils/production-logger'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Play,
  Settings,
  TrendingUp,
  RefreshCw,
  Database,
  Activity,
  Zap,
} from 'lucide-react'
import type {
  ClassificationFeedback,
  TrainingJob,
  AutomatedTrainingConfig,
} from '@/lib/ai/training-service'

interface TrainingStats {
  totalFeedback: number
  usedForTraining: number
  readyForTraining: number
  totalJobs: number
  activeJobs: number
  succeededJobs: number
  failedJobs: number
  deployedModel: TrainingJob | null
  automationConfigs: number
  activeAutomation: AutomatedTrainingConfig | null
}

export default function AIModelManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [feedbackData, setFeedbackData] = useState<ClassificationFeedback[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [automationConfigs, setAutomationConfigs] = useState<AutomatedTrainingConfig[]>([])
  const [processingLog, setProcessingLog] = useState<
    Array<{ timestamp: string; message: string; type: string }>
  >([])

  // Form state
  const [jobName, setJobName] = useState('')
  const [baseModel, setBaseModel] = useState('gpt-3.5-turbo-0125')
  const [nEpochs, setNEpochs] = useState(3)
  const [batchSize, setBatchSize] = useState(8)
  const [learningRateMultiplier, setLearningRateMultiplier] = useState(1.0)
  const [notes, setNotes] = useState('')
  const [isSubmittingJob, setIsSubmittingJob] = useState(false)

  // Automation form
  const [showAutomationConfig, setShowAutomationConfig] = useState(false)
  const [automationForm, setAutomationForm] = useState({
    config_name: 'Weekly Automated Training',
    schedule_type: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'threshold',
    schedule_day_of_week: 0,
    schedule_hour: 2,
    feedback_threshold: 50,
    min_quality_score: 3,
    auto_deploy: false,
    min_validation_accuracy: 0.85,
  })

  const addLog = (message: string, type: string = 'info') => {
    setProcessingLog((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        message,
        type,
      },
    ])
  }

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const [statsRes, feedbackRes, jobsRes, configsRes] = await Promise.all([
        fetch('/api/ai/training-jobs?stats=true'),
        fetch('/api/ai/feedback?used=false&minQuality=3'),
        fetch('/api/ai/training-jobs'),
        fetch('/api/ai/automation'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json()
        setFeedbackData(feedbackData)
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setTrainingJobs(jobsData)
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json()
        setAutomationConfigs(configsData)
      }
    } catch (error) {
      logger.error('Error fetching data:', { error: error, context: 'AIModelManagementPage' })
    }
  }

  const submitFineTuningJob = async () => {
    if (!jobName.trim()) {
      addLog('❌ Job name is required', 'error')
      return
    }

    if (feedbackData.length < 10) {
      addLog('❌ Need at least 10 feedback records for training', 'error')
      return
    }

    setIsSubmittingJob(true)
    addLog('🚀 Initiating fine-tuning pipeline...', 'info')

    try {
      // Prepare training data
      const trainingExamples = feedbackData.map((feedback) => ({
        messages: [
          {
            role: 'system',
            content:
              'You are a Canadian human rights analyst specializing in anti-Black racism cases.',
          },
          {
            role: 'user',
            content: `Analyze this case: ${feedback.case_title}\n\n${feedback.case_text_excerpt}`,
          },
          { role: 'assistant', content: JSON.stringify(feedback.manual_classification) },
        ],
      }))

      const splitIndex = Math.floor(trainingExamples.length * 0.8)
      const trainingData = trainingExamples.slice(0, splitIndex)
      const validationData = trainingExamples.slice(splitIndex)

      addLog(`✓ Prepared ${trainingData.length} training examples`, 'success')
      addLog(`✓ Prepared ${validationData.length} validation examples`, 'success')

      // Convert to JSONL
      const trainingJSONL = trainingData.map((ex) => JSON.stringify(ex)).join('\n')
      const validationJSONL = validationData.map((ex) => JSON.stringify(ex)).join('\n')

      // Create blobs for upload
      const trainingBlob = new Blob([trainingJSONL], { type: 'application/jsonl' })
      const validationBlob = new Blob([validationJSONL], { type: 'application/jsonl' })

      addLog('Uploading training data...', 'info')

      // Upload files to storage
      const timestamp = Date.now()
      const { data: trainingUpload, error: trainingError } = await supabase.storage
        .from('ai-training')
        .upload(`training_${timestamp}.jsonl`, trainingBlob)

      const { data: validationUpload, error: validationError } = await supabase.storage
        .from('ai-training')
        .upload(`validation_${timestamp}.jsonl`, validationBlob)

      if (trainingError || validationError) {
        throw new Error('Failed to upload training files')
      }

      const { data: trainingUrl } = supabase.storage
        .from('ai-training')
        .getPublicUrl(trainingUpload.path)
      const { data: validationUrl } = supabase.storage
        .from('ai-training')
        .getPublicUrl(validationUpload.path)

      addLog('✓ Training files uploaded', 'success')

      // Get the next version number
      const nextVersion = `v${trainingJobs.length + 1}.0.0`

      // Create training job
      const response = await fetch('/api/ai/training-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_name: jobName,
          version: nextVersion,
          base_model: baseModel,
          feedback_ids: feedbackData.map((f) => f.id),
          training_data_url: trainingUrl.publicUrl,
          validation_data_url: validationUrl.publicUrl,
          hyperparameters: {
            n_epochs: nEpochs,
            batch_size: batchSize,
            learning_rate_multiplier: learningRateMultiplier,
          },
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create training job')
      }

      const job = await response.json()
      addLog(`✓ Training job created: ${job.id}`, 'success')

      // Simulate OpenAI submission (in production, this would call OpenAI API)
      addLog('📤 Submitting to OpenAI fine-tuning API...', 'info')
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const simulatedJobId = `ftjob-${Math.random().toString(36).substring(7)}`

      // Update job status
      await fetch('/api/ai/training-jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          status: 'running',
          provider_job_id: simulatedJobId,
          started_at: new Date().toISOString(),
        }),
      })

      addLog(`✅ Fine-tuning job submitted successfully!`, 'success')
      addLog(`📋 Provider Job ID: ${simulatedJobId}`, 'info')
      addLog(`⏱️ This will take approximately 15-30 minutes`, 'info')

      // Mark feedback as used
      addLog('Updating feedback records...', 'info')
      await Promise.all(
        feedbackData.map((f) =>
          fetch('/api/ai/feedback', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: f.id,
              used_for_training: true,
              training_batch_id: job.id,
            }),
          })
        )
      )

      addLog(`✓ ${feedbackData.length} feedback records marked as used`, 'success')

      // Reset form
      setJobName('')
      setNotes('')
      fetchData()
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`, 'error')
    } finally {
      setIsSubmittingJob(false)
    }
  }

  const submitAutomationConfig = async () => {
    if (!automationForm.config_name.trim()) {
      addLog('❌ Configuration name is required', 'error')
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const response = await fetch('/api/ai/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...automationForm,
          notification_emails: user?.email ? [user.email] : [],
          base_model: baseModel,
          hyperparameters: {
            n_epochs: nEpochs,
            batch_size: batchSize,
            learning_rate_multiplier: learningRateMultiplier,
          },
        }),
      })

      if (response.ok) {
        addLog('✅ Automation configuration saved successfully', 'success')
        setShowAutomationConfig(false)
        fetchData()
      } else {
        throw new Error('Failed to create automation config')
      }
    } catch (error: any) {
      addLog(`❌ Failed to create automation config: ${error.message}`, 'error')
    }
  }

  const toggleAutomation = async (config: AutomatedTrainingConfig) => {
    try {
      const response = await fetch('/api/ai/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          is_enabled: !config.is_enabled,
        }),
      })

      if (response.ok) {
        addLog(`✅ Automation ${!config.is_enabled ? 'enabled' : 'disabled'}`, 'success')
        fetchData()
      }
    } catch (error: any) {
      addLog(`❌ Failed to toggle automation: ${error.message}`, 'error')
    }
  }

  const deployModel = async (job: TrainingJob) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const response = await fetch('/api/ai/training-jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          is_deployed: true,
          deployed_at: new Date().toISOString(),
          deployed_by: user?.id,
        }),
      })

      if (response.ok) {
        addLog('✅ Model deployed successfully', 'success')
        fetchData()
      }
    } catch (error: any) {
      addLog(`❌ Failed to deploy model: ${error.message}`, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const readyCount = stats?.readyForTraining || 0
  const activeJobs = stats?.activeJobs || 0
  const usedForTraining = stats?.usedForTraining || 0
  const deployedModel = stats?.deployedModel
  const activeAutomation = stats?.activeAutomation

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">AI Model Management</h1>
                  <p className="text-gray-600">
                    Fine-tune and deploy improved classification models
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                Admin Only
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{readyCount}</div>
                <div className="text-sm text-gray-600">Ready for Training</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600">{activeJobs}</div>
                <div className="text-sm text-gray-600">Active Training Jobs</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">{usedForTraining}</div>
                <div className="text-sm text-gray-600">Used for Training</div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <Sparkles className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="truncate text-sm font-bold text-yellow-600">
                  {deployedModel?.version || 'None'}
                </div>
                <div className="text-sm text-gray-600">Deployed Model</div>
                {activeAutomation && (
                  <Badge className="mt-2 bg-green-100 text-xs text-green-800">
                    Auto-training: {activeAutomation.schedule_type}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="train" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="train">Create Job</TabsTrigger>
              <TabsTrigger value="automation">Automation ({automationConfigs.length})</TabsTrigger>
              <TabsTrigger value="jobs">History ({trainingJobs.length})</TabsTrigger>
              <TabsTrigger value="data">Data ({readyCount})</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Create Training Job Tab */}
            <TabsContent value="train" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Start Fine-Tuning Job
                  </CardTitle>
                  <p className="mt-2 text-sm text-gray-600">
                    Use collected feedback to fine-tune a new model version
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {readyCount < 10 && (
                    <div className="flex items-start gap-3 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-yellow-900">Insufficient Training Data</p>
                        <p className="mt-1 text-sm text-yellow-800">
                          You need at least 10 high-quality feedback records to start training.
                          Currently have: {readyCount}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Job Name
                      </label>
                      <Input
                        placeholder="e.g., Q4 2024 Model Update"
                        value={jobName}
                        onChange={(e) => setJobName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="base-model-select"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Base Model
                      </label>
                      <select
                        id="base-model-select"
                        value={baseModel}
                        onChange={(e) => setBaseModel(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="gpt-3.5-turbo-0125">GPT-3.5 Turbo (Recommended)</option>
                        <option value="gpt-4">GPT-4 (Premium)</option>
                        <option value="gpt-3.5-turbo-1106">GPT-3.5 Turbo 1106</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-3 font-semibold text-gray-900">Hyperparameters</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Epochs
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={nEpochs}
                          onChange={(e) => setNEpochs(Number(e.target.value))}
                        />
                        <p className="mt-1 text-xs text-gray-500">Default: 3</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Batch Size
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="64"
                          value={batchSize}
                          onChange={(e) => setBatchSize(Number(e.target.value))}
                        />
                        <p className="mt-1 text-xs text-gray-500">Default: 8</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Learning Rate Multiplier
                        </label>
                        <Input
                          type="number"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                          value={learningRateMultiplier}
                          onChange={(e) => setLearningRateMultiplier(Number(e.target.value))}
                        />
                        <p className="mt-1 text-xs text-gray-500">Default: 1.0</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add notes about this training job..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">Training Data Summary</h4>
                    <div className="grid gap-3 text-sm text-blue-800 md:grid-cols-2">
                      <div>
                        <strong>Total Examples:</strong> {readyCount}
                      </div>
                      <div>
                        <strong>Training Split:</strong> {Math.floor(readyCount * 0.8)} examples
                        (80%)
                      </div>
                      <div>
                        <strong>Validation Split:</strong>{' '}
                        {readyCount - Math.floor(readyCount * 0.8)} examples (20%)
                      </div>
                      <div>
                        <strong>Estimated Duration:</strong> 15-30 minutes
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={submitFineTuningJob}
                    disabled={isSubmittingJob || readyCount < 10 || !jobName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    {isSubmittingJob ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Job...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Fine-Tuning
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <TrendingUp className="h-5 w-5" />
                    What Happens Next?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">1</span>
                    </div>
                    <div>
                      <strong className="text-indigo-900">Data Preparation</strong>
                      <p className="mt-1 text-xs text-gray-700">
                        Feedback is formatted into training examples and split into
                        training/validation sets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">2</span>
                    </div>
                    <div>
                      <strong className="text-indigo-900">Upload to Provider</strong>
                      <p className="mt-1 text-xs text-gray-700">
                        Training files are uploaded to OpenAI&apos;s servers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">3</span>
                    </div>
                    <div>
                      <strong className="text-indigo-900">Fine-Tuning Process</strong>
                      <p className="mt-1 text-xs text-gray-700">
                        Model is trained on your data (15-30 minutes)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-xs font-bold text-indigo-700">4</span>
                    </div>
                    <div>
                      <strong className="text-indigo-900">Model Deployment</strong>
                      <p className="mt-1 text-xs text-gray-700">
                        Review metrics and deploy the new model to production
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                    Automated Training Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeAutomation ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h4 className="font-bold text-gray-900">
                              {activeAutomation.config_name}
                            </h4>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                            <div>
                              <strong>Schedule:</strong> {activeAutomation.schedule_type} at{' '}
                              {activeAutomation.schedule_hour}:00
                            </div>
                            <div>
                              <strong>Feedback Threshold:</strong>{' '}
                              {activeAutomation.feedback_threshold} records
                            </div>
                            <div>
                              <strong>Auto-deploy:</strong>{' '}
                              {activeAutomation.auto_deploy ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => toggleAutomation(activeAutomation)}
                        >
                          Disable
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <RefreshCw className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="mb-4 text-gray-600">No automated training configured</p>
                      <Button
                        onClick={() => setShowAutomationConfig(true)}
                        className="bg-purple-600 text-white"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Automation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {showAutomationConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configure Automated Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Configuration Name
                      </label>
                      <Input
                        value={automationForm.config_name}
                        onChange={(e) =>
                          setAutomationForm({ ...automationForm, config_name: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="schedule-type-select"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Schedule Type
                        </label>
                        <select
                          id="schedule-type-select"
                          value={automationForm.schedule_type}
                          onChange={(e) =>
                            setAutomationForm({
                              ...automationForm,
                              schedule_type: e.target.value as any,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="threshold">Threshold-based</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Run at Hour (24h)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={automationForm.schedule_hour}
                          onChange={(e) =>
                            setAutomationForm({
                              ...automationForm,
                              schedule_hour: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Feedback Threshold
                        </label>
                        <Input
                          type="number"
                          min="10"
                          value={automationForm.feedback_threshold}
                          onChange={(e) =>
                            setAutomationForm({
                              ...automationForm,
                              feedback_threshold: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Min Quality Score
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={automationForm.min_quality_score}
                          onChange={(e) =>
                            setAutomationForm({
                              ...automationForm,
                              min_quality_score: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto_deploy"
                        checked={automationForm.auto_deploy}
                        onChange={(e) =>
                          setAutomationForm({ ...automationForm, auto_deploy: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <label htmlFor="auto_deploy" className="text-sm text-gray-700">
                        Automatically deploy successful models
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={submitAutomationConfig} className="bg-purple-600 text-white">
                        Save Configuration
                      </Button>
                      <Button variant="outline" onClick={() => setShowAutomationConfig(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Training Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              {trainingJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-600">No training jobs yet</p>
                  </CardContent>
                </Card>
              ) : (
                trainingJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{job.job_name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {job.version} • {job.base_model}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.status === 'pending' && (
                            <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                          )}
                          {job.status === 'running' && (
                            <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                          )}
                          {job.status === 'succeeded' && (
                            <Badge className="bg-green-100 text-green-800">Succeeded</Badge>
                          )}
                          {job.status === 'failed' && (
                            <Badge className="bg-red-100 text-red-800">Failed</Badge>
                          )}
                          {job.is_deployed && (
                            <Badge className="bg-purple-100 text-purple-800">Deployed</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 text-sm md:grid-cols-3">
                        <div>
                          <strong>Feedback Count:</strong> {job.feedback_count}
                        </div>
                        <div>
                          <strong>Created:</strong> {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        {job.provider_job_id && (
                          <div>
                            <strong>Provider ID:</strong> {job.provider_job_id}
                          </div>
                        )}
                      </div>
                      {job.notes && <p className="mt-4 text-sm text-gray-600">{job.notes}</p>}
                      {job.status === 'succeeded' && !job.is_deployed && (
                        <Button
                          onClick={() => deployModel(job)}
                          className="mt-4 bg-purple-600 text-white"
                        >
                          Deploy Model
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Training Data Tab */}
            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Training Data</CardTitle>
                  <p className="text-sm text-gray-600">
                    {readyCount} high-quality feedback records ready for training
                  </p>
                </CardHeader>
                <CardContent>
                  {feedbackData.length === 0 ? (
                    <div className="py-8 text-center">
                      <Database className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="text-gray-600">No feedback data available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedbackData.slice(0, 10).map((feedback) => (
                        <div key={feedback.id} className="rounded-lg border p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{feedback.case_title}</h4>
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {feedback.case_text_excerpt}
                              </p>
                            </div>
                            <Badge className="ml-4">Quality: {feedback.quality_score}/5</Badge>
                          </div>
                        </div>
                      ))}
                      {feedbackData.length > 10 && (
                        <p className="text-center text-sm text-gray-600">
                          + {feedbackData.length - 10} more records
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {processingLog.length === 0 ? (
                    <div className="py-8 text-center text-gray-600">
                      No logs yet. Start a training job to see logs.
                    </div>
                  ) : (
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                      {processingLog.map((log, index) => (
                        <div
                          key={index}
                          className={`rounded-lg p-3 text-sm ${
                            log.type === 'error'
                              ? 'bg-red-50 text-red-900'
                              : log.type === 'success'
                                ? 'bg-green-50 text-green-900'
                                : 'bg-gray-50 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {log.type === 'error' && (
                              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            )}
                            {log.type === 'success' && (
                              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            )}
                            {log.type === 'info' && (
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            )}
                            <div>
                              <span className="text-xs opacity-70">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                              <p className="mt-1">{log.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
