import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle,
  Wrench,
  CheckCircle,
  Eye,
  Code,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function StructureChangeAlert({ job, onAutoFix, onManualReview, onDismiss }) {
  if (!job.structure_change_detected || !job.structure_change_details) {
    return null;
  }

  const details = job.structure_change_details;
  const canAutoFix = job.auto_adaptation_enabled && details.confidence >= 0.7;

  const changeTypeColors = {
    selector_obsolete: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    layout_changed: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
    new_elements: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    removed_elements: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" }
  };

  const colors = changeTypeColors[details.change_type] || changeTypeColors.selector_obsolete;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className={`border-2 ${colors.border} ${colors.bg} animate-pulse`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${colors.text}`} />
              <div>
                <CardTitle className={colors.text}>Website Structure Changed!</CardTitle>
                <p className="text-sm text-gray-700 mt-1">
                  Detected on {format(new Date(details.detection_date), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <Badge className={`${colors.bg} ${colors.text}`}>
              {details.change_type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Change Details */}
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Affected Selectors:</h4>
            <div className="space-y-2">
              {details.affected_selectors?.map((selector, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-mono bg-gray-50 p-2 rounded">
                  <Code className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{selector}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Fixes */}
          {details.suggested_fixes && details.suggested_fixes.length > 0 && (
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">AI-Suggested Fixes:</h4>
              <div className="space-y-3">
                {details.suggested_fixes.map((fix, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-sm">
                        <div className="font-semibold text-blue-900 mb-1">{fix.selector_name}</div>
                        <div className="text-gray-700">
                          <span className="text-red-600 line-through">{fix.old_value}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600 font-semibold">{fix.new_value}</span>
                        </div>
                        {fix.confidence && (
                          <div className="mt-1 text-xs text-gray-600">
                            Confidence: {(fix.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Indicator */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-gray-700">AI Confidence in Suggested Fixes:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    details.confidence >= 0.8 ? 'bg-green-500' :
                    details.confidence >= 0.6 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${details.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {(details.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {canAutoFix && (
              <Button
                onClick={() => onAutoFix(job.id)}
                className="bg-green-600 text-white hover:bg-green-700 flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Apply Auto-Fix
              </Button>
            )}
            <Button
              onClick={() => onManualReview(job.id)}
              variant="outline"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Manual Review
            </Button>
            <Button
              onClick={() => onDismiss(job.id)}
              variant="ghost"
            >
              Dismiss
            </Button>
          </div>

          {/* Warning for low confidence */}
          {details.confidence < 0.7 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Low confidence detected.</strong> Manual review recommended before applying changes. 
                  The AI is less certain about these fixes due to significant structural differences.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}