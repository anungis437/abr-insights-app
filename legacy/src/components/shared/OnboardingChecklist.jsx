import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  X,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingChecklist({ 
  user, 
  onboarding, 
  steps, 
  onStepClick, 
  onDismiss,
  onComplete 
}) {
  const completedSteps = onboarding?.completed_steps || [];
  const completionPercentage = (completedSteps.length / steps.length) * 100;
  const isComplete = completionPercentage === 100;

  if (onboarding?.dismissed && !isComplete) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Card className="border-2 border-teal-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-6 h-6 text-teal-600" />
                  <CardTitle className="text-xl">
                    {isComplete ? "Onboarding Complete! 🎉" : "Get Started"}
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-600">
                  {isComplete 
                    ? "You've completed all setup steps. You're ready to go!"
                    : "Complete these steps to make the most of ABR Insight"
                  }
                </p>
              </div>
              {!isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
            {!isComplete && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-teal-700">
                    {completedSteps.length} of {steps.length} completed
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => !isCompleted && onStepClick && onStepClick(step)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:border-teal-500 hover:shadow-md'
                    }`}
                    whileHover={!isCompleted ? { scale: 1.02 } : {}}
                    whileTap={!isCompleted ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <Circle className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {step.icon}
                          <h4 className={`font-semibold ${
                            isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h4>
                          {step.priority === 'high' && !isCompleted && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Priority
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isCompleted ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {step.description}
                        </p>
                        {!isCompleted && step.estimatedTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            ~{step.estimatedTime} min
                          </p>
                        )}
                      </div>
                      {!isCompleted && (
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {isComplete && onComplete && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-lg">
                <p className="text-sm text-green-900 font-medium mb-3">
                  Great job! You're all set up. Ready to explore the platform?
                </p>
                <Button
                  onClick={onComplete}
                  className="w-full teal-gradient text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Exploring
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}