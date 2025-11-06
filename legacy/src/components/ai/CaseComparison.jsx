import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GitCompare, 
  Scale,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function CaseComparison({ case1, case2 }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateComparison = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Compare these two tribunal cases involving anti-Black racism and provide insights:

CASE 1: ${case1.title}
- Year: ${case1.year}
- Tribunal: ${case1.tribunal}
- Discrimination Type: ${case1.discrimination_type?.join(', ')}
- Outcome: ${case1.outcome}
- Monetary Award: $${case1.monetary_award || 0}
- Remedies: ${case1.remedies_awarded?.join(', ')}
- Summary: ${case1.summary_en}

CASE 2: ${case2.title}
- Year: ${case2.year}
- Tribunal: ${case2.tribunal}
- Discrimination Type: ${case2.discrimination_type?.join(', ')}
- Outcome: ${case2.outcome}
- Monetary Award: $${case2.monetary_award || 0}
- Remedies: ${case2.remedies_awarded?.join(', ')}
- Summary: ${case2.summary_en}

Provide a structured comparison covering:
1. Key Similarities
2. Key Differences
3. Outcome Analysis
4. Precedent Value Comparison
5. Practical Lessons for Organizations`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setAiAnalysis(response);
    } catch (error) {
      console.error("Error generating comparison:", error);
    }
    setIsAnalyzing(false);
  };

  const ComparisonRow = ({ label, value1, value2, icon: Icon }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
      </div>
      <div className="text-sm text-gray-900">{value1}</div>
      <div className="text-sm text-gray-900">{value2}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-purple-600" />
          Case Comparison Analysis
        </h2>
        <Button
          onClick={generateComparison}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Side-by-Side Comparison */}
      <Card>
        <CardHeader className="bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-sm font-medium text-gray-600">Attribute</div>
            <div>
              <Badge className="mb-2">Case 1</Badge>
              <h3 className="font-bold text-gray-900 text-sm">{case1.title}</h3>
            </div>
            <div>
              <Badge className="mb-2">Case 2</Badge>
              <h3 className="font-bold text-gray-900 text-sm">{case2.title}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ComparisonRow
            label="Year"
            value1={case1.year}
            value2={case2.year}
            icon={Calendar}
          />
          <ComparisonRow
            label="Tribunal"
            value1={case1.tribunal}
            value2={case2.tribunal}
            icon={Scale}
          />
          <ComparisonRow
            label="Outcome"
            value1={
              <Badge className={case1.outcome?.includes("Upheld") ? "bg-green-500" : "bg-red-500"}>
                {case1.outcome}
              </Badge>
            }
            value2={
              <Badge className={case2.outcome?.includes("Upheld") ? "bg-green-500" : "bg-red-500"}>
                {case2.outcome}
              </Badge>
            }
          />
          <ComparisonRow
            label="Monetary Award"
            value1={`$${(case1.monetary_award || 0).toLocaleString()}`}
            value2={`$${(case2.monetary_award || 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <ComparisonRow
            label="Precedent Value"
            value1={
              <Badge variant="outline" className={
                case1.precedent_value === "High" ? "border-yellow-500 text-yellow-700" : ""
              }>
                {case1.precedent_value}
              </Badge>
            }
            value2={
              <Badge variant="outline" className={
                case2.precedent_value === "High" ? "border-yellow-500 text-yellow-700" : ""
              }>
                {case2.precedent_value}
              </Badge>
            }
          />
          <div className="grid grid-cols-3 gap-4 py-3">
            <div className="text-sm font-medium text-gray-700">Discrimination Types</div>
            <div className="space-y-1">
              {case1.discrimination_type?.map(type => (
                <Badge key={type} variant="outline" className="mr-1 text-xs">
                  {type}
                </Badge>
              ))}
            </div>
            <div className="space-y-1">
              {case2.discrimination_type?.map(type => (
                <Badge key={type} variant="outline" className="mr-1 text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <TrendingUp className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="text-gray-900 whitespace-pre-wrap">{aiAnalysis}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isAnalyzing && (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing cases with AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}