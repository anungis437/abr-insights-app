import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  Hash
} from "lucide-react";
import { motion } from "framer-motion";

export default function DataValidationReport({ validationResults }) {
  if (!validationResults || validationResults.length === 0) {
    return null;
  }

  const totalCases = validationResults.length;
  const passedCases = validationResults.filter(r => r.passed).length;
  const failedCases = totalCases - passedCases;
  const passRate = ((passedCases / totalCases) * 100).toFixed(1);

  // Group failures by type
  const failuresByType = {};
  validationResults.forEach(result => {
    if (!result.passed) {
      result.failures.forEach(failure => {
        failuresByType[failure.rule] = (failuresByType[failure.rule] || 0) + 1;
      });
    }
  });

  const getIconForRule = (rule) => {
    if (rule.includes('title')) return FileText;
    if (rule.includes('date')) return Calendar;
    if (rule.includes('case_number')) return Hash;
    return AlertTriangle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Data Validation Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{passedCases}</div>
              <div className="text-sm text-gray-600">Passed Validation</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{failedCases}</div>
              <div className="text-sm text-gray-600">Failed Validation</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <div className="text-2xl font-bold text-blue-600">{passRate}%</div>
                <TrendingUp className={`w-5 h-5 ${passRate >= 90 ? 'text-green-600' : passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>

          {/* Failure Breakdown */}
          {failedCases > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Common Validation Failures:</h4>
              <div className="space-y-2">
                {Object.entries(failuresByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([rule, count]) => {
                    const Icon = getIconForRule(rule);
                    return (
                      <div key={rule} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-700 capitalize">{rule.replace(/_/g, ' ')}</span>
                        </div>
                        <Badge variant="outline" className="border-red-300 text-red-700">
                          {count} cases
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {failedCases > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                {Object.keys(failuresByType).includes('missing_case_number') && (
                  <li>Check case number selector: <code className="bg-yellow-100 px-1 rounded">case_number_selector</code></li>
                )}
                {Object.keys(failuresByType).includes('title_too_short') && (
                  <li>Verify title selector is capturing full text, not just fragments</li>
                )}
                {Object.keys(failuresByType).includes('invalid_date_format') && (
                  <li>Update date format regex or standardize date parsing logic</li>
                )}
                {Object.keys(failuresByType).includes('content_too_short') && (
                  <li>Content selector may be too narrow - consider broader selectors</li>
                )}
                {passRate < 70 && (
                  <li className="font-semibold">Pass rate below 70% - manual selector review recommended</li>
                )}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {passRate >= 95 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">Excellent data quality! {passRate}% of cases passed validation.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}