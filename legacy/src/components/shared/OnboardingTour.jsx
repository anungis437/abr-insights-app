import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Target,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingTour({ user, onboarding, steps, onComplete }) {
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(true);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      if (onboarding?.id) {
        return await base44.entities.Onboarding.update(onboarding.id, data);
      } else {
        return await base44.entities.Onboarding.create({
          user_email: user.email,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const handleNext = async () => {
    const completedSteps = [...(onboarding?.completed_steps || [])];
    if (!completedSteps.includes(currentStep.id)) {
      completedSteps.push(currentStep.id);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      await updateOnboardingMutation.mutateAsync({
        completed_steps: completedSteps,
        current_step: steps[currentStepIndex + 1].id,
      });
    } else {
      await updateOnboardingMutation.mutateAsync({
        completed_steps: completedSteps,
        tour_completed: true,
        is_complete: true,
      });
      setShowTour(false);
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleDismiss = async () => {
    await updateOnboardingMutation.mutateAsync({
      dismissed: true,
    });
    setShowTour(false);
  };

  const handleSkip = async () => {
    await updateOnboardingMutation.mutateAsync({
      tour_completed: true,
      dismissed: true,
    });
    setShowTour(false);
  };

  if (!showTour || !currentStep) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl border-2 border-teal-500">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-teal-50 to-white border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                      {currentStep.icon}
                    </div>
                    <div>
                      <Badge className="mb-2 bg-teal-100 text-teal-800">
                        Step {currentStepIndex + 1} of {steps.length}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Content */}
              <div className="p-8">
                {currentStep.image && (
                  <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={currentStep.image}
                      alt={currentStep.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                {currentStep.highlights && currentStep.highlights.length > 0 && (
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg mb-6">
                    <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {currentStep.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-teal-800">
                          <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentStep.action && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <Target className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Action Item:</h4>
                        <p className="text-sm text-gray-700 mb-3">{currentStep.action.description}</p>
                        {currentStep.action.button && (
                          <Button
                            onClick={currentStep.action.button.onClick}
                            className="teal-gradient text-white"
                            size="sm"
                          >
                            {currentStep.action.button.text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-600"
                >
                  Skip Tour
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="teal-gradient text-white"
                  >
                    {currentStepIndex === steps.length - 1 ? (
                      <>
                        Complete Tour
                        <Rocket className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}