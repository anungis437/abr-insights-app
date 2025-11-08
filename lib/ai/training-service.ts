import { createClient } from '@/lib/supabase/server'

export interface ClassificationFeedback {
  id: string
  created_at: string
  updated_at: string
  case_id: string
  case_title: string
  case_text_excerpt: string
  ai_classification: any
  manual_classification: any
  quality_score: number
  reviewed_by: string | null
  reviewed_date: string
  used_for_training: boolean
  training_batch_id: string | null
  feedback_notes: string | null
}

export interface TrainingJob {
  id: string
  created_at: string
  updated_at: string
  job_name: string
  version: string
  status: 'pending' | 'preparing' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  provider: 'openai' | 'anthropic' | 'azure'
  provider_job_id: string | null
  base_model: string
  fine_tuned_model: string | null
  feedback_count: number
  feedback_ids: string[]
  training_data_url: string
  validation_data_url: string | null
  hyperparameters: {
    n_epochs: number
    batch_size: number
    learning_rate_multiplier: number
  }
  started_at: string | null
  completed_at: string | null
  training_log: Array<{
    timestamp: string
    event: string
    message: string
  }>
  training_metrics: any
  validation_metrics: any
  is_deployed: boolean
  deployed_at: string | null
  deployed_by: string | null
  created_by: string | null
  notes: string | null
  error_message: string | null
}

export interface AutomatedTrainingConfig {
  id: string
  created_at: string
  updated_at: string
  config_name: string
  is_enabled: boolean
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'threshold'
  schedule_day_of_week: number | null
  schedule_day_of_month: number | null
  schedule_hour: number
  feedback_threshold: number
  min_quality_score: number
  base_model: string
  hyperparameters: {
    n_epochs: number
    batch_size: number
    learning_rate_multiplier: number
  }
  auto_deploy: boolean
  min_validation_accuracy: number
  notification_emails: string[]
  created_by: string | null
  last_run_at: string | null
  last_run_job_id: string | null
  next_run_at: string | null
}

// Classification Feedback Functions
export async function getClassificationFeedback(options?: {
  usedForTraining?: boolean
  minQualityScore?: number
  orderBy?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('classification_feedback')
    .select('*')
  
  if (options?.usedForTraining !== undefined) {
    query = query.eq('used_for_training', options.usedForTraining)
  }
  
  if (options?.minQualityScore) {
    query = query.gte('quality_score', options.minQualityScore)
  }
  
  query = query.order(options?.orderBy || 'reviewed_date', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data as ClassificationFeedback[]
}

export async function createClassificationFeedback(feedback: Omit<ClassificationFeedback, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('classification_feedback')
    .insert(feedback)
    .select()
    .single()
  
  if (error) throw error
  return data as ClassificationFeedback
}

export async function updateClassificationFeedback(id: string, updates: Partial<ClassificationFeedback>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('classification_feedback')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ClassificationFeedback
}

export async function markFeedbackAsUsed(feedbackIds: string[], trainingBatchId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('classification_feedback')
    .update({
      used_for_training: true,
      training_batch_id: trainingBatchId
    })
    .in('id', feedbackIds)
  
  if (error) throw error
}

// Training Job Functions
export async function getTrainingJobs(options?: {
  status?: string
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('training_jobs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.status) {
    query = query.eq('status', options.status)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as TrainingJob[]
}

export async function getTrainingJob(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('training_jobs')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as TrainingJob
}

export async function createTrainingJob(job: Omit<TrainingJob, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('training_jobs')
    .insert(job)
    .select()
    .single()
  
  if (error) throw error
  return data as TrainingJob
}

export async function updateTrainingJob(id: string, updates: Partial<TrainingJob>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('training_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as TrainingJob
}

export async function deployModel(jobId: string, userId: string) {
  const supabase = await createClient()
  
  // First, undeploy any currently deployed model
  await supabase
    .from('training_jobs')
    .update({ is_deployed: false })
    .eq('is_deployed', true)
  
  // Deploy the new model
  const { data, error } = await supabase
    .from('training_jobs')
    .update({
      is_deployed: true,
      deployed_at: new Date().toISOString(),
      deployed_by: userId
    })
    .eq('id', jobId)
    .select()
    .single()
  
  if (error) throw error
  return data as TrainingJob
}

export async function getDeployedModel() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('training_jobs')
    .select('*')
    .eq('is_deployed', true)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
  return data as TrainingJob | null
}

// Automated Training Config Functions
export async function getAutomationConfigs() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('automated_training_config')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as AutomatedTrainingConfig[]
}

export async function getAutomationConfig(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('automated_training_config')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as AutomatedTrainingConfig
}

export async function createAutomationConfig(config: Omit<AutomatedTrainingConfig, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('automated_training_config')
    .insert(config)
    .select()
    .single()
  
  if (error) throw error
  return data as AutomatedTrainingConfig
}

export async function updateAutomationConfig(id: string, updates: Partial<AutomatedTrainingConfig>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('automated_training_config')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as AutomatedTrainingConfig
}

export async function deleteAutomationConfig(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('automated_training_config')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function toggleAutomation(id: string, isEnabled: boolean) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('automated_training_config')
    .update({ is_enabled: isEnabled })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as AutomatedTrainingConfig
}

// Statistics
export async function getTrainingStatistics() {
  const supabase = await createClient()
  
  const [feedbackResult, jobsResult, configsResult] = await Promise.all([
    supabase.from('classification_feedback').select('*', { count: 'exact' }),
    supabase.from('training_jobs').select('*', { count: 'exact' }),
    supabase.from('automated_training_config').select('*', { count: 'exact' })
  ])
  
  const feedbackData = feedbackResult.data as ClassificationFeedback[] || []
  const jobsData = jobsResult.data as TrainingJob[] || []
  const configsData = configsResult.data as AutomatedTrainingConfig[] || []
  
  return {
    totalFeedback: feedbackResult.count || 0,
    usedForTraining: feedbackData.filter(f => f.used_for_training).length,
    readyForTraining: feedbackData.filter(f => !f.used_for_training && f.quality_score >= 3).length,
    totalJobs: jobsResult.count || 0,
    activeJobs: jobsData.filter(j => j.status === 'running' || j.status === 'preparing').length,
    succeededJobs: jobsData.filter(j => j.status === 'succeeded').length,
    failedJobs: jobsData.filter(j => j.status === 'failed').length,
    deployedModel: jobsData.find(j => j.is_deployed) || null,
    automationConfigs: configsResult.count || 0,
    activeAutomation: configsData.find(c => c.is_enabled) || null
  }
}
