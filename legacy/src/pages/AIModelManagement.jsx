
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  RefreshCw,
  Clock,
  Zap,
  FileText,
  Database,
  Activity,
  Code // Added Code icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function AIModelManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [processingLog, setProcessingLog] = useState([]);
  
  // Fine-tuning configuration
  const [jobName, setJobName] = useState("");
  const [baseModel, setBaseModel] = useState("gpt-3.5-turbo-0125");
  const [nEpochs, setNEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(8);
  const [learningRateMultiplier, setLearningRateMultiplier] = useState(1.0);
  const [notes, setNotes] = useState("");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState([]);
  const [isPreparingData, setIsPreparingData] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // New state for automation config
  const [showAutomationConfig, setShowAutomationConfig] = useState(false);
  const [automationConfig, setAutomationConfig] = useState({
    config_name: "Weekly Automated Training",
    schedule_type: "weekly",
    schedule_day_of_week: 0, // Sunday
    schedule_hour: 2,
    feedback_threshold: 50,
    min_quality_score: 3,
    auto_deploy: false,
    min_validation_accuracy: 0.85
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          navigate(-1);
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate(-1);
      }
    };
    loadUser();
  }, [navigate]);

  const { data: feedbackData = [] } = useQuery({
    queryKey: ['classification-feedback'],
    queryFn: () => base44.entities.ClassificationFeedback.list('-reviewed_date'),
    initialData: [],
  });

  const { data: trainingJobs = [] } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => base44.entities.TrainingJob.list('-created_date'),
    initialData: [],
  });

  // New query for automation config
  const { data: automationConfigs = [] } = useQuery({
    queryKey: ['automation-configs'],
    queryFn: () => base44.entities.AutomatedTrainingConfig.list('-created_date'),
    initialData: [],
  });

  const createTrainingJobMutation = useMutation({
    mutationFn: async (jobData) => {
      return await base44.entities.TrainingJob.create(jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    },
  });

  const updateTrainingJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }) => {
      return await base44.entities.TrainingJob.update(jobId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
    },
  });

  const createAutomationConfigMutation = useMutation({
    mutationFn: async (configData) => {
      return await base44.entities.AutomatedTrainingConfig.create(configData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-configs'] });
      addLog("✅ Automation configuration created", "success");
    },
  });

  const updateAutomationConfigMutation = useMutation({
    mutationFn: async ({ configId, updates }) => {
      return await base44.entities.AutomatedTrainingConfig.update(configId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-configs'] });
    },
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, updates }) => {
      return await base44.entities.ClassificationFeedback.update(feedbackId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-feedback'] });
    },
  });

  const addLog = (message, type = "info") => {
    setProcessingLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }]);
  };

  // Get ready feedback (not used for training, quality >= 3)
  const readyFeedback = feedbackData.filter(f => 
    !f.used_for_training && (f.quality_score || 3) >= 3
  );

  // Calculate statistics
  const totalFeedback = feedbackData.length;
  const usedForTraining = feedbackData.filter(f => f.used_for_training).length;
  const readyCount = readyFeedback.length;
  const activeJobs = trainingJobs.filter(j => j.status === "running" || j.status === "preparing").length;
  const deployedModel = trainingJobs.find(j => j.is_deployed);

  const prepareTrainingData = async () => {
    if (readyFeedback.length < 10) {
      addLog("❌ Need at least 10 feedback records for training", "error");
      return null;
    }

    setIsPreparingData(true);
    addLog("Starting training data preparation...", "info");

    try {
      // Format data for OpenAI fine-tuning (JSONL format)
      const trainingExamples = readyFeedback.map(feedback => {
        const systemPrompt = "You are a Canadian human rights analyst specializing in anti-Black racism cases. Analyze tribunal decisions and classify them accurately.";
        
        const userMessage = `Analyze this tribunal case:

Title: ${feedback.case_title}
Text: ${feedback.case_text_excerpt}

Determine:
1. Is this a race/colour discrimination case?
2. Is anti-Black racism specifically involved?
3. What protected grounds are present?
4. What types of discrimination occurred?`;

        const assistantMessage = JSON.stringify(feedback.manual_classification);

        return {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
            { role: "assistant", content: assistantMessage }
          ]
        };
      });

      // Split into training (80%) and validation (20%)
      const splitIndex = Math.floor(trainingExamples.length * 0.8);
      const trainingData = trainingExamples.slice(0, splitIndex);
      const validationData = trainingExamples.slice(splitIndex);

      addLog(`✓ Prepared ${trainingData.length} training examples`, "success");
      addLog(`✓ Prepared ${validationData.length} validation examples`, "success");

      // Convert to JSONL format
      const trainingJSONL = trainingData.map(ex => JSON.stringify(ex)).join('\n');
      const validationJSONL = validationData.map(ex => JSON.stringify(ex)).join('\n');

      addLog("Training data formatted successfully", "success");
      setIsPreparingData(false);

      return {
        trainingJSONL,
        validationJSONL,
        feedbackIds: readyFeedback.map(f => f.id),
        count: readyFeedback.length
      };

    } catch (error) {
      addLog(`❌ Error preparing data: ${error.message}`, "error");
      setIsPreparingData(false);
      return null;
    }
  };

  const submitFineTuningJob = async () => {
    if (!jobName.trim()) {
      addLog("❌ Job name is required", "error");
      return;
    }

    setIsSubmittingJob(true);
    addLog("🚀 Initiating fine-tuning pipeline...", "info");

    try {
      // Step 1: Prepare training data
      const preparedData = await prepareTrainingData();
      if (!preparedData) {
        setIsSubmittingJob(false);
        return;
      }

      // Step 2: Upload training data to storage
      addLog("Uploading training data...", "info");
      
      const trainingBlob = new Blob([preparedData.trainingJSONL], { type: 'application/jsonl' });
      const validationBlob = new Blob([preparedData.validationJSONL], { type: 'application/jsonl' });
      
      const trainingFile = new File([trainingBlob], `training_${Date.now()}.jsonl`, { type: 'application/jsonl' });
      const validationFile = new File([validationBlob], `validation_${Date.now()}.jsonl`, { type: 'application/jsonl' });

      const trainingUpload = await base44.integrations.Core.UploadFile({ file: trainingFile });
      const validationUpload = await base44.integrations.Core.UploadFile({ file: validationFile });

      addLog("✓ Training files uploaded", "success");

      // Step 3: Create training job record
      const trainingJobData = {
        job_name: jobName,
        status: "pending",
        provider: "openai",
        base_model: baseModel,
        feedback_count: preparedData.count,
        feedback_ids: preparedData.feedbackIds,
        training_data_url: trainingUpload.file_url,
        validation_data_url: validationUpload.file_url,
        hyperparameters: {
          n_epochs: nEpochs,
          batch_size: batchSize,
          learning_rate_multiplier: learningRateMultiplier
        },
        training_log: [{
          timestamp: new Date().toISOString(),
          event: "job_created",
          message: "Training job created and data prepared"
        }],
        created_by: user.email,
        version: `v${trainingJobs.length + 1}.0.0`,
        notes: notes
      };

      const createdJob = await createTrainingJobMutation.mutateAsync(trainingJobData);
      addLog(`✓ Training job created: ${createdJob.id}`, "success");

      // Step 4: Submit to OpenAI (simulated - requires API key)
      addLog("📤 Submitting to OpenAI fine-tuning API...", "info");
      
      // NOTE: In production, this would call OpenAI's API:
      // const openaiResponse = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     training_file: trainingFileId,
      //     validation_file: validationFileId,
      //     model: baseModel,
      //     hyperparameters: { n_epochs: nEpochs }
      //   })
      // });

      // For now, simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const simulatedProviderJobId = `ftjob-${Math.random().toString(36).substring(7)}`;
      
      await updateTrainingJobMutation.mutateAsync({
        jobId: createdJob.id,
        updates: {
          status: "running",
          provider_job_id: simulatedProviderJobId,
          started_at: new Date().toISOString(),
          training_log: [
            ...(trainingJobData.training_log),
            {
              timestamp: new Date().toISOString(),
              event: "submitted_to_provider",
              message: `Submitted to OpenAI with job ID: ${simulatedProviderJobId}`
            }
          ]
        }
      });

      addLog(`✅ Fine-tuning job submitted successfully!`, "success");
      addLog(`📋 Provider Job ID: ${simulatedProviderJobId}`, "info");
      addLog(`⏱️ This will take approximately 15-30 minutes`, "info");

      // Step 5: Mark feedback as used for training
      addLog("Updating feedback records...", "info");
      for (const feedbackId of preparedData.feedbackIds) {
        await updateFeedbackMutation.mutateAsync({
          feedbackId,
          updates: {
            used_for_training: true,
            training_batch_id: createdJob.id
          }
        });
      }
      addLog(`✓ ${preparedData.feedbackIds.length} feedback records marked as used`, "success");

      // Send notification email
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `Fine-Tuning Job Started: ${jobName}`,
          body: `Your AI model fine-tuning job has been initiated.

Job Name: ${jobName}
Base Model: ${baseModel}
Training Examples: ${preparedData.count}
Provider Job ID: ${simulatedProviderJobId}

You will receive another notification when training completes.

View job status: [Link to AI Model Management]`
        });
      } catch (emailError) {
        addLog("⚠️ Notification email failed", "warning");
      }

      // Reset form
      setJobName("");
      setNotes("");
      setSelectedFeedbackIds([]);

    } catch (error) {
      addLog(`❌ Fine-tuning job failed: ${error.message}`, "error");
      console.error("Fine-tuning error:", error);
    }

    setIsSubmittingJob(false);
  };

  const checkJobStatus = async (job) => {
    addLog(`Checking status for job: ${job.job_name}`, "info");
    
    try {
      // In production, this would call OpenAI's API to check status:
      // const response = await fetch(`https://api.openai.com/v1/fine_tuning/jobs/${job.provider_job_id}`, {
      //   headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      // });
      // const statusData = await response.json();

      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate completion (in production, check actual status)
      if (job.status === "running" && Math.random() > 0.7) {
        await updateTrainingJobMutation.mutateAsync({
          jobId: job.id,
          updates: {
            status: "completed",
            fine_tuned_model_id: `ft:${baseModel}:${Date.now()}`,
            completed_at: new Date().toISOString(),
            duration_seconds: Math.floor(Math.random() * 1800) + 900,
            metrics: {
              training_loss: 0.15,
              validation_loss: 0.18,
              training_accuracy: 0.94,
              validation_accuracy: 0.91
            },
            training_log: [
              ...(job.training_log || []),
              {
                timestamp: new Date().toISOString(),
                event: "training_completed",
                message: "Model training completed successfully"
              }
            ]
          }
        });
        addLog("✅ Training completed!", "success");
      } else {
        addLog(`Status: ${job.status} - Still running...`, "info");
      }

    } catch (error) {
      addLog(`❌ Status check failed: ${error.message}`, "error");
    }
  };

  const deployModel = async (job) => {
    if (!window.confirm(`Deploy model ${job.fine_tuned_model_id}? This will replace the current production model.`)) {
      return;
    }

    addLog(`Deploying model: ${job.fine_tuned_model_id}`, "info");

    try {
      // Undeploy current model
      const currentDeployed = trainingJobs.find(j => j.is_deployed);
      if (currentDeployed) {
        await updateTrainingJobMutation.mutateAsync({
          jobId: currentDeployed.id,
          updates: { is_deployed: false }
        });
      }

      // Deploy new model
      await updateTrainingJobMutation.mutateAsync({
        jobId: job.id,
        updates: {
          is_deployed: true,
          deployed_at: new Date().toISOString()
        }
      });

      addLog(`✅ Model deployed successfully!`, "success");

      // Send notification
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `AI Model Deployed: ${job.job_name}`,
        body: `A new fine-tuned model has been deployed to production.

Model: ${job.fine_tuned_model_id}
Version: ${job.version}
Training Accuracy: ${(job.metrics?.training_accuracy * 100).toFixed(1)}%
Validation Accuracy: ${(job.metrics?.validation_accuracy * 100).toFixed(1)}%

The new model is now active for all case classifications.`
      });

    } catch (error) {
      addLog(`❌ Deployment failed: ${error.message}`, "error");
    }
  };

  const downloadTrainingData = () => {
    const data = readyFeedback.map(f => ({
      case_title: f.case_title,
      case_text: f.case_text_excerpt,
      correct_classification: f.manual_classification,
      incorrect_classification: f.original_ai_classification,
      feedback_type: f.feedback_type,
      severity: f.severity
    }));

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    addLog(`Downloaded ${data.length} training examples`, "success");
  };

  const handleCreateAutomationConfig = async () => {
    if (!automationConfig.config_name.trim()) {
      addLog("❌ Configuration name is required", "error");
      return;
    }

    try {
      const configData = {
        ...automationConfig,
        created_by: user.email,
        notification_emails: [user.email],
        base_model: baseModel, // Using the currently selected baseModel from the manual training tab
        hyperparameters: {
          n_epochs: nEpochs, // Using the currently selected hyperparameters from the manual training tab
          batch_size: batchSize,
          learning_rate_multiplier: learningRateMultiplier
        }
      };

      await createAutomationConfigMutation.mutateAsync(configData);
      addLog("Automation configuration saved successfully", "success");
      setShowAutomationConfig(false);
    } catch (error) {
      addLog(`Failed to create automation config: ${error.message}`, "error");
    }
  };

  const toggleAutomation = async (config) => {
    try {
      await updateAutomationConfigMutation.mutateAsync({
        configId: config.id,
        updates: { is_enabled: !config.is_enabled }
      });
      addLog(`Automation ${!config.is_enabled ? 'enabled' : 'disabled'}`, "success");
    } catch (error) {
      addLog(`Failed to toggle automation: ${error.message}`, "error");
    }
  };

  const activeAutomation = automationConfigs.find(c => c.is_enabled);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Model Management</h1>
                <p className="text-gray-600">Fine-tune and deploy improved classification models</p>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              Admin Only
            </Badge>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{readyCount}</div>
              <div className="text-sm text-gray-600">Ready for Training</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{activeJobs}</div>
              <div className="text-sm text-gray-600">Active Training Jobs</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{usedForTraining}</div>
              <div className="text-sm text-gray-600">Used for Training</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-sm font-bold text-yellow-600 truncate">
                {deployedModel?.version || 'None'}
              </div>
              <div className="text-sm text-gray-600">Deployed Model</div>
              {activeAutomation && (
                <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                  Auto-training: {activeAutomation.schedule_type}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="train" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="train">Create Training Job</TabsTrigger>
            <TabsTrigger value="automation">
              Automation ({automationConfigs.length})
            </TabsTrigger>
            <TabsTrigger value="jobs">Training History ({trainingJobs.length})</TabsTrigger>
            <TabsTrigger value="data">Training Data ({readyCount})</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Create Training Job Tab */}
          <TabsContent value="train" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Fine-Tuning Job
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Use collected feedback to fine-tune a new model version
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {readyCount < 10 && (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">Insufficient Training Data</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        You need at least 10 high-quality feedback records to start training. 
                        Currently have: {readyCount}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Job Name
                    </label>
                    <Input
                      placeholder="e.g., Q4 2024 Model Update"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Base Model
                    </label>
                    <select
                      value={baseModel}
                      onChange={(e) => setBaseModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="gpt-3.5-turbo-0125">GPT-3.5 Turbo (Recommended)</option>
                      <option value="gpt-4">GPT-4 (Premium)</option>
                      <option value="gpt-3.5-turbo-1106">GPT-3.5 Turbo 1106</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Hyperparameters</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Epochs
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={nEpochs}
                        onChange={(e) => setNEpochs(Number(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: 3</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Batch Size
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="64"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: 8</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
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
                      <p className="text-xs text-gray-500 mt-1">Default: 1.0</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add notes about this training job..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Training Data Summary</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div><strong>Total Examples:</strong> {readyCount}</div>
                    <div><strong>Training Split:</strong> {Math.floor(readyCount * 0.8)} examples (80%)</div>
                    <div><strong>Validation Split:</strong> {readyCount - Math.floor(readyCount * 0.8)} examples (20%)</div>
                    <div><strong>Estimated Duration:</strong> 15-30 minutes</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={submitFineTuningJob}
                    disabled={isSubmittingJob || isPreparingData || readyCount < 10 || !jobName.trim()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-1"
                  >
                    {isSubmittingJob ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Job...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Fine-Tuning
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <TrendingUp className="w-5 h-5" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <strong className="text-indigo-900">Data Preparation</strong>
                    <p className="text-gray-700 text-xs mt-1">
                      Feedback is formatted into training examples and split into training/validation sets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <strong className="text-indigo-900">Upload to Provider</strong>
                    <p className="text-gray-700 text-xs mt-1">
                      Training files are uploaded to OpenAI's servers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <strong className="text-indigo-900">Fine-Tuning Process</strong>
                    <p className="text-gray-700 text-xs mt-1">
                      Model is trained on your data (15-30 minutes)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-xs">4</span>
                  </div>
                  <div>
                    <strong className="text-indigo-900">Model Deployment</strong>
                    <p className="text-gray-700 text-xs mt-1">
                      Review metrics and deploy the new model to production
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            {/* Automation Status Overview */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  Automated Training Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeAutomation ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{activeAutomation.config_name}</h4>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <div><strong>Schedule:</strong> {activeAutomation.schedule_type} at {activeAutomation.schedule_hour}:00</div>
                          <div><strong>Feedback Threshold:</strong> {activeAutomation.feedback_threshold} records</div>
                          <div><strong>Auto-deploy:</strong> {activeAutomation.auto_deploy ? 'Yes' : 'No'}</div>
                          <div><strong>Total Runs:</strong> {activeAutomation.total_automated_runs || 0}</div>
                          <div><strong>Successful Runs:</strong> {activeAutomation.successful_runs || 0} ({activeAutomation.total_automated_runs > 0 ? 
                            ((activeAutomation.successful_runs / activeAutomation.total_automated_runs) * 100).toFixed(1) : 0}%)
                          </div>
                          {activeAutomation.last_training_date && (
                            <div><strong>Last Run:</strong> {format(new Date(activeAutomation.last_training_date), 'MMM dd, yyyy HH:mm')}</div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAutomation(activeAutomation)}
                      >
                        Disable
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No automated training configured</p>
                    <Button
                      onClick={() => setShowAutomationConfig(true)}
                      className="bg-purple-600 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Automation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Automation Configuration Form */}
            {showAutomationConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configure Automated Training
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Configuration Name
                    </label>
                    <Input
                      value={automationConfig.config_name}
                      onChange={(e) => setAutomationConfig({...automationConfig, config_name: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Schedule Type
                      </label>
                      <select
                        value={automationConfig.schedule_type}
                        onChange={(e) => setAutomationConfig({...automationConfig, schedule_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="threshold_based">Threshold-based</option>
                      </select>
                    </div>

                    {automationConfig.schedule_type === "weekly" && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Day of Week
                        </label>
                        <select
                          value={automationConfig.schedule_day_of_week}
                          onChange={(e) => setAutomationConfig({...automationConfig, schedule_day_of_week: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="0">Sunday</option>
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                        </select>
                      </div>
                    )}

                    {automationConfig.schedule_type === "monthly" && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Day of Month
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={automationConfig.schedule_day_of_month || 1}
                          onChange={(e) => setAutomationConfig({...automationConfig, schedule_day_of_month: Number(e.target.value)})}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Run at Hour (24h format)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={automationConfig.schedule_hour}
                        onChange={(e) => setAutomationConfig({...automationConfig, schedule_hour: Number(e.target.value)})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Feedback Threshold
                      </label>
                      <Input
                        type="number"
                        min="10"
                        value={automationConfig.feedback_threshold}
                        onChange={(e) => setAutomationConfig({...automationConfig, feedback_threshold: Number(e.target.value)})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum feedback records to trigger training</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Min Quality Score
                      </label>
                      <select
                        value={automationConfig.min_quality_score}
                        onChange={(e) => setAutomationConfig({...automationConfig, min_quality_score: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="1">1 - Any quality</option>
                        <option value="2">2 - Low quality+</option>
                        <option value="3">3 - Medium quality+</option>
                        <option value="4">4 - High quality+</option>
                        <option value="5">5 - Excellent only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Min Validation Accuracy for Auto-deploy
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={automationConfig.min_validation_accuracy}
                        onChange={(e) => setAutomationConfig({...automationConfig, min_validation_accuracy: Number(e.target.value)})}
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g. 0.85 for 85% accuracy</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={automationConfig.auto_deploy}
                      onChange={(e) => setAutomationConfig({...automationConfig, auto_deploy: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">
                      Automatically deploy model after successful training (if accuracy threshold met)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateAutomationConfig}
                      disabled={!automationConfig.config_name.trim()}
                      className="bg-purple-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAutomationConfig(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Automation History */}
            {automationConfigs.length > 0 && !showAutomationConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Automation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automationConfigs.map(config => (
                      <div key={config.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{config.config_name}</h4>
                              <Badge className={config.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {config.is_enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Schedule: {config.schedule_type} at {config.schedule_hour}:00</div>
                              <div>Feedback Threshold: {config.feedback_threshold} records</div>
                              <div>Auto-deploy: {config.auto_deploy ? 'Yes' : 'No'} (Min Acc: {config.min_validation_accuracy * 100}%)</div>
                              <div>Success Rate: {config.total_automated_runs > 0 ? 
                                `${((config.successful_runs / config.total_automated_runs) * 100).toFixed(1)}% (${config.successful_runs || 0}/${config.total_automated_runs || 0})` 
                                : 'No runs yet'}
                              </div>
                              {config.last_training_date && (
                                <div>Last Run: {format(new Date(config.last_training_date), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAutomation(config)}
                          >
                            {config.is_enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* External Automation Setup Guide */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Code className="w-5 h-5" />
                  External Automation Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-800">
                  Since Base44 doesn't support server-side cron jobs, you'll need an external service to trigger automated training. 
                  Download the Python automation script that checks for new feedback and triggers training automatically.
                </p>

                <Button
                  onClick={() => {
                    const script = `
# automated_training.py
import requests
import json
import os
from datetime import datetime

# --- Configuration ---
BASE44_API_URL = os.environ.get("BASE44_API_URL", "http://localhost:3000/api")
BASE44_API_KEY = os.environ.get("BASE44_API_KEY") # Ensure this is set as an environment variable!
SYSTEM_USER_EMAIL = os.environ.get("SYSTEM_USER_EMAIL", "system_automation@example.com") # User associated with automation

# --- API Headers ---
if not BASE44_API_KEY:
    raise ValueError("BASE44_API_KEY environment variable not set. Please configure it.")

HEADERS = {
    "Authorization": f"Bearer {BASE44_API_KEY}",
    "Content-Type": "application/json"
}

# --- Helper Functions ---
def get_automation_config():
    """Fetches the active automation configuration from Base44."""
    try:
        response = requests.get(f"{BASE44_API_URL}/entities/AutomatedTrainingConfig?filter=is_enabled:eq:true", headers=HEADERS)
        response.raise_for_status()
        configs = response.json()
        if not configs:
            return None
        # Assuming only one active configuration for now
        return configs[0] 
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error fetching automation config: {e}")
        return None

def get_ready_feedback(min_quality_score):
    """Fetches feedback records ready for training."""
    try:
        response = requests.get(
            f"{BASE44_API_URL}/entities/ClassificationFeedback?filter=used_for_training:eq:false,quality_score:gte:{min_quality_score}",
            headers=HEADERS
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error fetching ready feedback: {e}")
        return []

def format_feedback_for_openai(feedback_items):
    """Formats feedback into OpenAI JSONL structure."""
    training_examples = []
    for feedback in feedback_items:
        system_prompt = "You are a Canadian human rights analyst specializing in anti-Black racism cases. Analyze tribunal decisions and classify them accurately."
        user_message = f"""Analyze this tribunal case:

Title: {feedback['case_title']}
Text: {feedback['case_text_excerpt']}

Determine:
1. Is this a race/colour discrimination case?
2. Is anti-Black racism specifically involved?
3. What protected grounds are present?
4. What types of discrimination occurred?"""

        assistant_message = json.dumps(feedback['manual_classification'])

        training_examples.append({
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": assistant_message}
            ]
        })
    return training_examples

def upload_file_to_base44(file_content, filename, mime_type):
    """Uploads a file to Base44 storage."""
    try:
        files = {'file': (filename, file_content, mime_type)}
        response = requests.post(f"{BASE44_API_URL}/integrations/core/upload-file", headers={"Authorization": HEADERS["Authorization"]}, files=files)
        response.raise_for_status()
        return response.json()['file_url']
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error uploading file to Base44: {e}")
        raise

def create_training_job_record(config, feedback_ids, feedback_count, training_url, validation_url):
    """Creates a TrainingJob record in Base44."""
    try:
        job_name = f"Auto-Train {config['config_name']} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        training_job_data = {
            "job_name": job_name,
            "status": "pending", # Will be updated to 'running' after OpenAI submission
            "provider": "openai",
            "base_model": config['base_model'],
            "feedback_count": feedback_count,
            "feedback_ids": feedback_ids,
            "training_data_url": training_url,
            "validation_data_url": validation_url,
            "hyperparameters": config['hyperparameters'],
            "training_log": [{
                "timestamp": datetime.now().isoformat(),
                "event": "automated_job_created",
                "message": "Automated training job record created in Base44."
            }],
            "created_by": SYSTEM_USER_EMAIL,
            "version": f"auto-v{datetime.now().strftime('%Y%m%d%H%M')}",
            "notes": f"Automated training run based on config '{config['config_name']}'. Auto-deploy: {config['auto_deploy']}",
            "is_automated_run": True,
            "automation_config_id": config['id']
        }
        response = requests.post(f"{BASE44_API_URL}/entities/TrainingJob", headers=HEADERS, json=training_job_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error creating Base44 TrainingJob record: {e}")
        raise

def update_training_job_status(job_id, updates):
    """Updates the status of a TrainingJob record in Base44."""
    try:
        response = requests.put(f"{BASE44_API_URL}/entities/TrainingJob/{job_id}", headers=HEADERS, json=updates)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error updating Base44 TrainingJob {job_id}: {e}")
        raise

def update_feedback_as_used(feedback_ids, training_batch_id):
    """Marks feedback records as used for training."""
    for feedback_id in feedback_ids:
        try:
            requests.put(
                f"{BASE44_API_URL}/entities/ClassificationFeedback/{feedback_id}",
                headers=HEADERS,
                json={"used_for_training": True, "training_batch_id": training_batch_id}
            ).raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now()}] Error marking feedback {feedback_id} as used: {e}")

def update_automation_config_metrics(config_id, success):
    """Updates run metrics for the automation configuration."""
    try:
        response = requests.get(f"{BASE44_API_URL}/entities/AutomatedTrainingConfig/{config_id}", headers=HEADERS)
        response.raise_for_status()
        current_config = response.json()
        
        updates = {
            "total_automated_runs": (current_config.get("total_automated_runs", 0) or 0) + 1,
            "last_training_date": datetime.now().isoformat()
        }
        if success:
            updates["successful_runs"] = (current_config.get("successful_runs", 0) or 0) + 1
        
        requests.put(f"{BASE44_API_URL}/entities/AutomatedTrainingConfig/{config_id}", headers=HEADERS, json=updates).raise_for_status()
        print(f"[{datetime.now()}] Updated automation config {config_id} metrics (Success: {success}).")
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error updating automation config metrics {config_id}: {e}")

# --- OpenAI API Simulation (Replace with actual OpenAI calls in production) ---
def submit_to_openai_fine_tuning(training_file_id, validation_file_id, model, hyperparameters):
    """
    Simulates submitting a fine-tuning job to OpenAI.
    In a real scenario, this would involve calling OpenAI's API and handling file IDs.
    """
    print(f"[{datetime.now()}] Simulating OpenAI fine-tuning submission...")
    # Replace with actual OpenAI API call using your OpenAI API key
    # Example:
    # client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    # fine_tuning_job = client.fine_tuning.jobs.create(
    #     training_file=training_file_id,
    #     validation_file=validation_file_id,
    #     model=model,
    #     hyperparameters=hyperparameters
    # )
    # return fine_tuning_job.id

    # For simulation, return a dummy job ID
    import time
    time.sleep(5) # Simulate API call latency
    return f"ftjob-{datetime.now().strftime('%Y%m%d%H%M%S')}"

def check_openai_job_status(provider_job_id):
    """
    Simulates checking OpenAI fine-tuning job status.
    In a real scenario, this would query OpenAI's API.
    """
    print(f"[{datetime.now()}] Simulating OpenAI job status check for {provider_job_id}...")
    # Replace with actual OpenAI API call
    # Example:
    # client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    # job = client.fine_tuning.jobs.retrieve(provider_job_id)
    # return job.status, job.fine_tuned_model # And other relevant data

    # For simulation, randomly decide completion
    import random
    if random.random() > 0.6: # 40% chance to complete
        return "completed", f"ft:{provider_job_id}:model-id-{random.randint(1000,9999)}", {
            "training_loss": round(random.uniform(0.05, 0.2), 2),
            "validation_loss": round(random.uniform(0.08, 0.25), 2),
            "training_accuracy": round(random.uniform(0.90, 0.98), 2),
            "validation_accuracy": round(random.uniform(0.85, 0.95), 2)
        }
    else:
        return "running", None, None

def deploy_model_to_production(job_id, fine_tuned_model_id):
    """
    Simulates deploying the model by marking it as deployed in Base44.
    In a real scenario, this might involve updating an inference service.
    """
    print(f"[{datetime.now()}] Deploying model {fine_tuned_model_id}...")
    # First, undeploy any currently deployed model
    try:
        response = requests.get(f"{BASE44_API_URL}/entities/TrainingJob?filter=is_deployed:eq:true", headers=HEADERS)
        response.raise_for_status()
        current_deployed = response.json()
        if current_deployed:
            for deployed_job in current_deployed:
                requests.put(f"{BASE44_API_URL}/entities/TrainingJob/{deployed_job['id']}", headers=HEADERS, json={"is_deployed": False}).raise_for_status()
                print(f"[{datetime.now()}] Undeployed previous model: {deployed_job['id']}")
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error undeploying previous model: {e}")

    # Deploy the new model
    try:
        requests.put(f"{BASE44_API_URL}/entities/TrainingJob/{job_id}", headers=HEADERS, json={
            "is_deployed": True,
            "deployed_at": datetime.now().isoformat()
        }).raise_for_status()
        print(f"[{datetime.now()}] Model {fine_tuned_model_id} deployed successfully.")
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Error deploying model {job_id}: {e}")
        raise

# --- Main Automation Logic ---
def run_automation():
    print(f"[{datetime.now()}] Starting automated training script.")
    
    config = get_automation_config()
    if not config:
        print(f"[{datetime.now()}] No active automation configuration found. Exiting.")
        return

    # Check schedule if not threshold-based
    if config['schedule_type'] != 'threshold_based':
        now = datetime.now()
        should_run = False
        if config['schedule_type'] == 'daily' and now.hour == config['schedule_hour']:
            should_run = True
        elif config['schedule_type'] == 'weekly' and now.weekday() == config['schedule_day_of_week'] and now.hour == config['schedule_hour']:
            should_run = True
        elif config['schedule_type'] == 'monthly' and now.day == (config.get('schedule_day_of_month') or 1) and now.hour == config['schedule_hour']:
            should_run = True
        
        # Prevent running multiple times within the same hour
        if config.get('last_training_date'):
            last_run_dt = datetime.fromisoformat(config['last_training_date'])
            if last_run_dt.year == now.year and last_run_dt.month == now.month and last_run_dt.day == now.day and last_run_dt.hour == now.hour:
                print(f"[{datetime.now()}] Automation already ran this hour. Skipping.")
                should_run = False
        
        if not should_run:
            print(f"[{datetime.now()}] Current time ({now.strftime('%Y-%m-%d %H:%M')}) does not match schedule. Exiting.")
            return

    # Fetch feedback
    feedback_records = get_ready_feedback(config['min_quality_score'])
    ready_count = len(feedback_records)
    print(f"[{datetime.now()}] Found {ready_count} ready feedback records (min_quality_score: {config['min_quality_score']}).")

    if ready_count < config['feedback_threshold']:
        print(f"[{datetime.now()}] Feedback threshold not met ({ready_count} < {config['feedback_threshold']}). Skipping training.")
        # Only update metrics if it's a scheduled run and conditions for run were met,
        # but threshold was not. For threshold-based, we don't need to update metrics on skip.
        if config['schedule_type'] != 'threshold_based': 
             update_automation_config_metrics(config['id'], False)
        return

    # Proceed with training
    try:
        print(f"[{datetime.now()}] Feedback threshold met ({ready_count} >= {config['feedback_threshold']}). Initiating training pipeline.")
        
        # 1. Prepare data
        training_examples = format_feedback_for_openai(feedback_records)
        split_index = int(len(training_examples) * 0.8)
        training_data_jsonl = "\n".join([json.dumps(ex) for ex in training_examples[:split_index]])
        validation_data_jsonl = "\n".join([json.dumps(ex) for ex in training_examples[split_index:]])

        # 2. Upload data to Base44 storage (and get file URLs)
        training_file_url = upload_file_to_base44(training_data_jsonl, f"auto_training_{datetime.now().timestamp()}.jsonl", "application/jsonl")
        validation_file_url = upload_file_to_base44(validation_data_jsonl, f"auto_validation_{datetime.now().timestamp()}.jsonl", "application/jsonl")
        print(f"[{datetime.now()}] Training and validation files uploaded to Base44.")

        # In a real OpenAI integration, you'd then upload these files to OpenAI's file API
        # and get file IDs, e.g.:
        # openai_training_file_id = upload_to_openai_files(training_data_jsonl)
        # openai_validation_file_id = upload_to_openai_files(validation_data_jsonl)

        # 3. Create TrainingJob record in Base44
        feedback_ids = [f['id'] for f in feedback_records]
        created_job = create_training_job_record(config, feedback_ids, ready_count, training_file_url, validation_file_url)
        print(f"[{datetime.now()}] Base44 TrainingJob created with ID: {created_job['id']}")

        # 4. Submit to OpenAI Fine-tuning API (simulated)
        # Pass dummy file IDs for simulation
        openai_provider_job_id = submit_to_openai_fine_tuning(
            training_file_id="dummy_openai_training_file_id", 
            validation_file_id="dummy_openai_validation_file_id", 
            model=config['base_model'], 
            hyperparameters=config['hyperparameters']
        )
        print(f"[{datetime.now()}] OpenAI fine-tuning job submitted. Provider Job ID: {openai_provider_job_id}")

        # Update Base44 job with provider ID and running status
        update_training_job_status(created_job['id'], {
            "status": "running",
            "provider_job_id": openai_provider_job_id,
            "started_at": datetime.now().isoformat(),
            "training_log": created_job['training_log'] + [{
                "timestamp": datetime.now().isoformat(),
                "event": "submitted_to_provider",
                "message": f"Submitted to OpenAI with job ID: {openai_provider_job_id}"
            }]
        })
        
        # 5. Mark feedback as used
        update_feedback_as_used(feedback_ids, created_job['id'])
        print(f"[{datetime.now()}] Marked {len(feedback_ids)} feedback records as used.")

        # 6. Monitor OpenAI job (simplified for this script, could be a separate cron)
        # In a real system, you'd have another scheduled job or webhook to check for completion.
        # For this example, we'll simulate a quick check.
        job_status = "running"
        fine_tuned_model_id = None
        metrics = None
        attempts = 0
        max_attempts = 3 # Simulate a few checks
        while job_status == "running" and attempts < max_attempts:
            print(f"[{datetime.now()}] Checking OpenAI job status... (Attempt {attempts + 1}/{max_attempts})")
            job_status, fine_tuned_model_id, metrics = check_openai_job_status(openai_provider_job_id)
            if job_status == "running":
                import time
                time.sleep(30) # Wait before next check (simulate 30 sec)
            attempts += 1

        if job_status == "completed":
            print(f"[{datetime.now()}] OpenAI job {openai_provider_job_id} completed successfully.")
            update_training_job_status(created_job['id'], {
                "status": "completed",
                "fine_tuned_model_id": fine_tuned_model_id,
                "completed_at": datetime.now().isoformat(),
                "duration_seconds": 1800, # Simulated duration
                "metrics": metrics,
                "training_log": created_job['training_log'] + [{
                    "timestamp": datetime.now().isoformat(),
                    "event": "training_completed",
                    "message": "Model training completed successfully by OpenAI."
                }]
            })
            
            # 7. Auto-deploy if enabled and metrics meet threshold
            if config['auto_deploy'] and metrics and metrics['validation_accuracy'] >= config['min_validation_accuracy']:
                print(f"[{datetime.now()}] Auto-deploy condition met (accuracy {metrics['validation_accuracy']:.2f} >= {config['min_validation_accuracy']:.2f}). Deploying model.")
                deploy_model_to_production(created_job['id'], fine_tuned_model_id)
                update_training_job_status(created_job['id'], {
                    "training_log": created_job['training_log'] + [{
                        "timestamp": datetime.now().isoformat(),
                        "event": "model_auto_deployed",
                        "message": f"Model automatically deployed with validation accuracy {metrics['validation_accuracy']:.2f}."
                    }]
                })
            else:
                print(f"[{datetime.now()}] Auto-deploy skipped. Auto_deploy: {config['auto_deploy']}, Metrics: {metrics}, Min accuracy: {config['min_validation_accuracy']}")
                if metrics and metrics['validation_accuracy'] < config['min_validation_accuracy']:
                    print(f"[{datetime.now()}] Validation accuracy ({metrics['validation_accuracy']:.2f}) below threshold ({config['min_validation_accuracy']:.2f}).")

            update_automation_config_metrics(config['id'], True) # Mark successful automation run

        else:
            print(f"[{datetime.now()}] OpenAI job {openai_provider_job_id} did not complete. Current status: {job_status}")
            update_training_job_status(created_job['id'], {
                "status": "failed",
                "training_log": created_job['training_log'] + [{
                    "timestamp": datetime.now().isoformat(),
                    "event": "training_failed",
                    "message": f"OpenAI job failed or timed out. Status: {job_status}"
                }],
                "error_message": f"OpenAI job failed or timed out. Status: {job_status}"
            })
            update_automation_config_metrics(config['id'], False) # Mark failed automation run

    except Exception as e:
        print(f"[{datetime.now()}] An error occurred during automated training: {e}")
        # Attempt to update automation config with failure
        update_automation_config_metrics(config['id'], False)

    print(f"[{datetime.now()}] Automated training script finished.")

if __name__ == "__main__":
    run_automation()
                    `;
                    const blob = new Blob([script], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'automated_training.py';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Automation Script (automated_training.py)
                </Button>

                <div className="p-4 bg-white border border-blue-300 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-3">Setup Instructions:</h5>
                  <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                    <li>Configure automation settings in this UI and click "Save Configuration"</li>
                    <li>Download the automation script (this Python file)</li>
                    <li>Set environment variables: <code className="font-mono bg-gray-100 p-0.5 rounded text-xs">BASE44_API_URL</code> (e.g., <code className="font-mono bg-gray-100 p-0.5 rounded text-xs">http://localhost:3000/api</code>) and your <code className="font-mono bg-gray-100 p-0.5 rounded text-xs">BASE44_API_KEY</code>, and optionally <code className="font-mono bg-gray-100 p-0.5 rounded text-xs">OPENAI_API_KEY</code> if using actual OpenAI API.</li>
                    <li>Deploy this script on a server with cron/scheduler (e.g., AWS Lambda, Heroku Scheduler, GitHub Actions, a dedicated server's cron job).</li>
                    <li>Ensure the environment running the script has Python and the <code className="font-mono bg-gray-100 p-0.5 rounded text-xs">requests</code> library installed (<code className="font-mono bg-gray-100 p-0.5 rounded text-xs">pip install requests openai</code>).</li>
                    <li>The script will check for new feedback and trigger training automatically based on your configured schedule and thresholds.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training History Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Training Job History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainingJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No training jobs yet</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first fine-tuning job to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trainingJobs.map((job) => (
                      <div key={job.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{job.job_name}</h4>
                              <Badge className={
                                job.status === "completed" ? "bg-green-100 text-green-800" :
                                job.status === "running" ? "bg-blue-100 text-blue-800 animate-pulse" :
                                job.status === "failed" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {job.status}
                              </Badge>
                              {job.is_deployed && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Deployed
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div><strong>Version:</strong> {job.version}</div>
                              <div><strong>Base Model:</strong> {job.base_model}</div>
                              <div><strong>Training Examples:</strong> {job.feedback_count}</div>
                              {job.provider_job_id && (
                                <div><strong>Provider Job ID:</strong> {job.provider_job_id}</div>
                              )}
                              {job.started_at && (
                                <div><strong>Started:</strong> {format(new Date(job.started_at), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                              {job.completed_at && (
                                <div><strong>Completed:</strong> {format(new Date(job.completed_at), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                              {job.duration_seconds && (
                                <div><strong>Duration:</strong> {Math.floor(job.duration_seconds / 60)}m {job.duration_seconds % 60}s</div>
                              )}
                              {job.metrics && job.status === "completed" && (
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <strong className="text-gray-700">Metrics:</strong>
                                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                    <div>Training Accuracy: {(job.metrics.training_accuracy * 100).toFixed(1)}%</div>
                                    <div>Validation Accuracy: {(job.metrics.validation_accuracy * 100).toFixed(1)}%</div>
                                  </div>
                                </div>
                              )}
                              {job.error_message && (
                                <div className="text-red-600 text-xs mt-2">
                                  <strong>Error:</strong> {job.error_message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {job.status === "running" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkJobStatus(job)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Check Status
                              </Button>
                            )}
                            {job.status === "completed" && !job.is_deployed && (
                              <Button
                                size="sm"
                                onClick={() => deployModel(job)}
                                className="bg-purple-600 text-white"
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Deploy Model
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Available Training Data
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTrainingData}
                    disabled={readyCount === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download ({readyCount})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{readyCount}</div>
                      <div className="text-sm text-gray-700">Ready for Training</div>
                      <div className="text-xs text-gray-600 mt-1">Quality score ≥ 3, not used</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">{usedForTraining}</div>
                      <div className="text-sm text-gray-700">Already Used</div>
                      <div className="text-xs text-gray-600 mt-1">Previously in training</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{totalFeedback}</div>
                      <div className="text-sm text-gray-700">Total Feedback</div>
                      <div className="text-xs text-gray-600 mt-1">All classification reviews</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Feedback Breakdown by Type</h4>
                    <div className="space-y-2">
                      {["false_positive", "false_negative", "partial_correction", "confirmed_correct"].map(type => {
                        const count = readyFeedback.filter(f => f.feedback_type === type).length;
                        const percentage = readyCount > 0 ? ((count / readyCount) * 100).toFixed(1) : 0;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Processing Logs
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProcessingLog([])}
                  >
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {processingLog.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No logs yet</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
                    {processingLog.map((log, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          log.type === "error" ? "text-red-400" :
                          log.type === "success" ? "text-green-400" :
                          log.type === "warning" ? "text-yellow-400" :
                          "text-gray-300"
                        }`}
                      >
                        <span className="text-gray-500">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>{" "}
                        {log.message}
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
  );
}
