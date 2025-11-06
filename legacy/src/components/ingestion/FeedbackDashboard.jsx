import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  Target,
  Sparkles,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function FeedbackDashboard({ feedbackData, user, onExportTrainingData }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Calculate statistics
  const totalFeedback = feedbackData.length;
  const falsePositives = feedbackData.filter(f => f.feedback_type === "false_positive").length;
  const falseNegatives = feedbackData.filter(f => f.feedback_type === "false_negative").length;
  const partialCorrections = feedbackData.filter(f => f.feedback_type === "partial_correction").length;
  const confirmed = feedbackData.filter(f => f.feedback_type === "confirmed_correct").length;
  const usedForTraining = feedbackData.filter(f => f.used_for_training).length;
  const readyForTraining = feedbackData.filter(f => !f.used_for_training && (f.quality_score || 3) >= 3).length;

  // Calculate accuracy improvement potential
  const totalErrors = falsePositives + falseNegatives + partialCorrections;
  const accuracyRate = totalFeedback > 0 
    ? ((confirmed / totalFeedback) * 100).toFixed(1)
    : 0;

  // Group by severity
  const criticalIssues = feedbackData.filter(f => f.severity === "critical").length;
  const majorIssues = feedbackData.filter(f => f.severity === "major").length;

  const stats = [
    {
      label: "Total Feedback",
      value: totalFeedback,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Current Accuracy",
      value: `${accuracyRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Ready for Training",
      value: readyForTraining,
      icon: Brain,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Critical Issues",
      value: criticalIssues,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];

  const FeedbackTypeCard = ({ type, count, icon: Icon, color, description }) => (
    <Card className={`${color.bg} border-2`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-6 h-6 ${color.text}`} />
          <span className={`text-2xl font-bold ${color.text}`}>{count}</span>
        </div>
        <div className="text-sm font-medium text-gray-900">{type}</div>
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="w-7 h-7 text-purple-600" />
                AI Classification Feedback Loop
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Continuously improve AI accuracy through human feedback and active learning
              </p>
            </div>
            <Button
              onClick={onExportTrainingData}
              disabled={readyForTraining === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Training Data ({readyForTraining})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.bg} border-2`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback Breakdown */}
      <div className="grid md:grid-cols-4 gap-4">
        <FeedbackTypeCard
          type="False Positives"
          count={falsePositives}
          icon={XCircle}
          color={{ text: "text-red-600", bg: "bg-red-50" }}
          description="AI flagged as race-related incorrectly"
        />
        <FeedbackTypeCard
          type="False Negatives"
          count={falseNegatives}
          icon={AlertCircle}
          color={{ text: "text-orange-600", bg: "bg-orange-50" }}
          description="AI missed race-related cases"
        />
        <FeedbackTypeCard
          type="Partial Corrections"
          count={partialCorrections}
          icon={Target}
          color={{ text: "text-yellow-600", bg: "bg-yellow-50" }}
          description="Classification needed refinement"
        />
        <FeedbackTypeCard
          type="Confirmed Correct"
          count={confirmed}
          icon={CheckCircle}
          color={{ text: "text-green-600", bg: "bg-green-50" }}
          description="AI classification validated"
        />
      </div>

      {/* Detailed Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Records</CardTitle>
          <p className="text-sm text-gray-600">
            Review and manage classification feedback for AI improvement
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="all">All ({totalFeedback})</TabsTrigger>
              <TabsTrigger value="false_positive">False + ({falsePositives})</TabsTrigger>
              <TabsTrigger value="false_negative">False - ({falseNegatives})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalIssues})</TabsTrigger>
              <TabsTrigger value="training">Ready ({readyForTraining})</TabsTrigger>
            </TabsList>

            {["all", "false_positive", "false_negative", "critical", "training"].map(tab => {
              let filtered = feedbackData;
              if (tab !== "all") {
                if (tab === "training") {
                  filtered = feedbackData.filter(f => !f.used_for_training && (f.quality_score || 3) >= 3);
                } else if (tab === "critical") {
                  filtered = feedbackData.filter(f => f.severity === "critical");
                } else {
                  filtered = feedbackData.filter(f => f.feedback_type === tab);
                }
              }

              return (
                <TabsContent key={tab} value={tab} className="space-y-3">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No feedback records in this category</p>
                    </div>
                  ) : (
                    filtered.map((feedback, index) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border-2 rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900">{feedback.case_title}</h4>
                              <Badge className={
                                feedback.feedback_type === "false_positive" ? "bg-red-100 text-red-800" :
                                feedback.feedback_type === "false_negative" ? "bg-orange-100 text-orange-800" :
                                feedback.feedback_type === "partial_correction" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }>
                                {feedback.feedback_type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={
                                feedback.severity === "critical" ? "border-red-500 text-red-700" :
                                feedback.severity === "major" ? "border-orange-500 text-orange-700" :
                                "border-gray-300"
                              }>
                                {feedback.severity}
                              </Badge>
                              {feedback.used_for_training && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Used for Training
                                </Badge>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 mb-3">
                              <strong>Admin Reason:</strong> {feedback.admin_reason}
                            </div>

                            {feedback.changes_made && feedback.changes_made.length > 0 && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <div className="font-semibold text-sm text-gray-700 mb-2">Changes Made:</div>
                                <div className="space-y-1">
                                  {feedback.changes_made.map((change, i) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-medium">{change.field}:</span>
                                      <span className="text-red-600 ml-2 line-through">{change.from}</span>
                                      <span className="mx-2">→</span>
                                      <span className="text-green-600 font-semibold">{change.to}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(feedback.reviewed_date), 'MMM dd, yyyy')}
                              </Badge>
                              <Badge variant="outline">
                                Reviewed by: {feedback.reviewer_email}
                              </Badge>
                              <Badge variant="outline">
                                Case: {feedback.case_number}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {!feedback.used_for_training && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Training Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Training Recommendations */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            AI Improvement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {readyForTraining >= 10 && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Ready for Model Fine-Tuning</h4>
                  <p className="text-sm text-green-800">
                    You have <strong>{readyForTraining} high-quality feedback records</strong> ready for training. 
                    Export the training data and use it to fine-tune your LLM classifier.
                  </p>
                  <Button
                    onClick={onExportTrainingData}
                    className="mt-3 bg-green-600 text-white hover:bg-green-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Training Dataset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {criticalIssues > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Critical Classification Errors Detected</h4>
                  <p className="text-sm text-red-800">
                    <strong>{criticalIssues} critical misclassifications</strong> have been identified. 
                    These represent cases where the AI completely missed race-related discrimination. 
                    Priority should be given to incorporating this feedback.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">How to Use Training Data:</h4>
            <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
              <li><strong>Export Training Data:</strong> Click the export button to download feedback in JSON format</li>
              <li><strong>Format for Fine-Tuning:</strong> Convert to your LLM provider's training format (OpenAI, Anthropic, etc.)</li>
              <li><strong>Create Training Examples:</strong> Each feedback record becomes a training example with correct classification</li>
              <li><strong>Fine-Tune Model:</strong> Submit to your LLM provider's fine-tuning API</li>
              <li><strong>Deploy Updated Model:</strong> Replace the existing classifier with the fine-tuned version</li>
              <li><strong>Monitor Improvement:</strong> Track accuracy metrics after deployment</li>
            </ol>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Expected Improvements:
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <strong>Reduced False Negatives:</strong>
                <p className="text-xs mt-1">Better detection of subtle anti-Black racism cases</p>
              </div>
              <div>
                <strong>Reduced False Positives:</strong>
                <p className="text-xs mt-1">More accurate filtering of non-relevant cases</p>
              </div>
              <div>
                <strong>Improved Confidence:</strong>
                <p className="text-xs mt-1">More reliable confidence scores for classifications</p>
              </div>
              <div>
                <strong>Better Context Understanding:</strong>
                <p className="text-xs mt-1">Enhanced recognition of coded language and patterns</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}