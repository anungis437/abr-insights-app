import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, TrendingUp, AlertTriangle } from "lucide-react";

export default function AIInsightsPanel({ cases }) {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async (customQuery = null) => {
    setLoading(true);
    try {
      const casesSummary = cases.slice(0, 50).map(c => ({
        year: c.year,
        outcome: c.outcome,
        tribunal: c.tribunal,
        race_category: c.race_category,
        monetary_award: c.monetary_award,
        discrimination_type: c.discrimination_type,
      }));

      const prompt = customQuery || `Analyze the following ${cases.length} tribunal cases on anti-Black racism in Canada. 
      
Sample data (first 50 cases): ${JSON.stringify(casesSummary)}

Please provide:
1. Key statistical patterns and trends
2. Systemic issues revealed by the data
3. Notable disparities in outcomes
4. Recommendations for workplace investigators and HR professionals
5. Areas requiring policy attention

Be specific, evidence-based, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights("Unable to generate insights at this time. Please try again.");
    }
    setLoading(false);
  };

  const quickInsights = [
    "What are the success rates for Black complainants?",
    "What systemic patterns emerge from dismissed cases?",
    "How do outcomes vary by tribunal jurisdiction?",
    "What remedies are most commonly awarded?",
  ];

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-6 h-6 text-yellow-600" />
          AI-Powered Insights
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ask questions about the data or generate comprehensive analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Insights */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Insights:</p>
          <div className="flex flex-wrap gap-2">
            {quickInsights.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery(q);
                  generateInsights(q);
                }}
                className="text-xs"
                disabled={loading}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Query */}
        <div className="space-y-2">
          <Textarea
            placeholder="Ask a specific question about the data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => generateInsights(query)}
              disabled={loading || !query}
              className="teal-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Answer
                </>
              )}
            </Button>
            <Button
              onClick={() => generateInsights()}
              disabled={loading}
              variant="outline"
            >
              Generate Full Analysis
            </Button>
          </div>
        </div>

        {/* Insights Display */}
        {insights && (
          <div className="mt-6 p-6 bg-white rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h4 className="font-semibold text-gray-900">AI Analysis Results</h4>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {insights}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            AI insights are generated based on available data and should be used as supplementary analysis. 
            Always verify findings with legal experts and consult original case documents for authoritative information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}