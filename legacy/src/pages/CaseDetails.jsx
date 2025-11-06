
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ExternalLink,
  BookOpen,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import CaseComparison from "../components/ai/CaseComparison";

export default function CaseDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [comparisonCase, setComparisonCase] = useState(null);

  const { data: tribunalCase, isLoading } = useQuery({
    queryKey: ['case-detail', caseId],
    queryFn: async () => {
      const cases = await base44.entities.TribunalCase.list();
      return cases.find(c => c.id === caseId);
    },
    enabled: !!caseId,
  });

  const { data: similarCases = [] } = useQuery({
    queryKey: ['similar-cases', tribunalCase?.discrimination_type],
    queryFn: async () => {
      if (!tribunalCase) return [];
      const cases = await base44.entities.TribunalCase.list();
      return cases
        .filter(c => 
          c.id !== caseId && 
          c.discrimination_type?.some(type => tribunalCase.discrimination_type?.includes(type))
        )
        .slice(0, 3);
    },
    enabled: !!tribunalCase,
    initialData: [],
  });

  const generateAIInsights = async () => {
    if (!tribunalCase) return;
    
    setIsLoadingInsights(true);
    try {
      const prompt = `Analyze this tribunal case involving anti-Black racism and provide comprehensive insights:

CASE: ${tribunalCase.title}
Case Number: ${tribunalCase.case_number}
Tribunal: ${tribunalCase.tribunal}
Year: ${tribunalCase.year}
Outcome: ${tribunalCase.outcome}
Monetary Award: $${tribunalCase.monetary_award || 0}
Discrimination Types: ${tribunalCase.discrimination_type?.join(', ')}
Summary: ${tribunalCase.summary_en}
Precedent Value: ${tribunalCase.precedent_value}

Please provide:
1. **Key Legal Principles**: What legal standards or principles were applied?
2. **Workplace Implications**: What does this mean for organizations?
3. **Prevention Strategies**: How could similar discrimination be prevented?
4. **Precedent Impact**: Why is this case important for future decisions?
5. **Action Items**: What should HR/managers do based on this case?

Format your response in clear sections with actionable insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      setAiInsights(response);
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
    setIsLoadingInsights(false);
  };

  useEffect(() => {
    if (tribunalCase) {
      // Don't call generateAIInsights here if ai_generated_summary is present,
      // as the manual AI Insights tab will handle it.
      // Removed the automatic generation of insights on load to prevent duplicate LLM calls
      // if ai_generated_summary is already available.
    }
  }, [tribunalCase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!tribunalCase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h2>
            <Link to={createPageUrl("DataExplorer")}>
              <Button className="mt-4 teal-gradient text-white">
                Back to Data Explorer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={
                  tribunalCase.outcome?.includes("Upheld") 
                    ? "bg-green-100 text-green-800"
                    : tribunalCase.outcome?.includes("Dismissed")
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }>
                  {tribunalCase.outcome}
                </Badge>
                {tribunalCase.precedent_value === "High" && (
                  <Badge className="gold-gradient text-gray-900">
                    High Precedent
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tribunalCase.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{tribunalCase.case_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>{tribunalCase.tribunal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{tribunalCase.year}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* NEW: AI Summary Card - displayed prominently at top */}
            {tribunalCase.ai_generated_summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Sparkles className="w-5 h-5" />
                      AI-Generated Case Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 leading-relaxed text-base mb-4">
                      {tribunalCase.ai_generated_summary}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                      <div className="flex items-center gap-4 text-xs text-purple-700">
                        {tribunalCase.summary_confidence && (
                          <span>Confidence: {(tribunalCase.summary_confidence * 100).toFixed(0)}%</span>
                        )}
                        {tribunalCase.summary_generation_date && (
                          <span>Generated: {format(new Date(tribunalCase.summary_generation_date), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                        AI-Powered
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-insights">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Case Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Case Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{tribunalCase.summary_en}</p>
                  </CardContent>
                </Card>

                {/* Key Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Protected Grounds</h4>
                      <div className="flex flex-wrap gap-2">
                        {tribunalCase.protected_ground?.map(ground => (
                          <Badge key={ground} variant="outline">{ground}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Discrimination Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {tribunalCase.discrimination_type?.map(type => (
                          <Badge key={type} variant="outline" className="border-orange-300 text-orange-700">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {tribunalCase.keywords?.map(keyword => (
                          <Badge key={keyword} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>

                    {tribunalCase.decision_date && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Decision Date</h4>
                        <p className="text-gray-900">
                          {format(new Date(tribunalCase.decision_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Remedies */}
                {tribunalCase.remedies_awarded && tribunalCase.remedies_awarded.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Remedies Awarded</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tribunalCase.remedies_awarded.map((remedy, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-700 text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-gray-700">{remedy}</p>
                          </div>
                        ))}
                      </div>
                      {tribunalCase.monetary_award > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Total Monetary Award</span>
                            <span className="text-2xl font-bold text-yellow-700 flex items-center gap-1">
                              <DollarSign className="w-5 h-5" />
                              {tribunalCase.monetary_award.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Full Decision Link */}
                {tribunalCase.full_text_url && (
                  <Card className="bg-teal-50 border-teal-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Read Full Decision</h4>
                          <p className="text-sm text-gray-600">
                            Access the complete tribunal decision document
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(tribunalCase.full_text_url, '_blank')}
                          className="teal-gradient text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="ai-insights">
                {isLoadingInsights ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Generating AI insights...</p>
                    </CardContent>
                  </Card>
                ) : aiInsights ? (
                  <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-900">
                        <Sparkles className="w-6 h-6" />
                        AI-Powered Case Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="text-gray-900 whitespace-pre-wrap">{aiInsights}</div>
                      </div>
                      <Button
                        onClick={generateAIInsights}
                        variant="outline"
                        className="mt-6 border-purple-300 text-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Regenerate Insights
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generate AI Insights</h3>
                      <p className="text-gray-600 mb-4">
                        Click below to generate a comprehensive AI analysis of this case.
                      </p>
                      <Button onClick={generateAIInsights} className="teal-gradient text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Insights
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison">
                {comparisonCase ? (
                  <div>
                    <CaseComparison case1={tribunalCase} case2={comparisonCase} />
                    <Button
                      onClick={() => setComparisonCase(null)}
                      variant="outline"
                      className="mt-4"
                    >
                      Select Different Case
                    </Button>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Case to Compare</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">
                        Choose a similar case to compare legal reasoning, outcomes, and remedies
                      </p>
                      {similarCases.map((similarCase) => (
                        <button
                          key={similarCase.id}
                          onClick={() => setComparisonCase(similarCase)}
                          className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">{similarCase.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant="outline">{similarCase.year}</Badge>
                            <Badge variant="outline">{similarCase.outcome}</Badge>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Precedent Value</div>
                  <Badge className={
                    tribunalCase.precedent_value === "High"
                      ? "gold-gradient text-gray-900"
                      : tribunalCase.precedent_value === "Medium"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }>
                    {tribunalCase.precedent_value}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Outcome</div>
                  <div className="font-semibold text-gray-900">{tribunalCase.outcome}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Award Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(tribunalCase.monetary_award || 0).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Cases */}
            {similarCases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Similar Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarCases.map((similarCase) => (
                    <Link key={similarCase.id} to={createPageUrl(`CaseDetails?id=${similarCase.id}`)}>
                      <div className="p-3 border rounded-lg hover:border-teal-500 hover:shadow-md transition-all cursor-pointer">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                          {similarCase.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">{similarCase.year}</Badge>
                          <Badge variant="outline" className="text-xs">{similarCase.tribunal}</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Related Learning */}
            <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Related Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Deepen your understanding with related courses
                </p>
                <Link to={createPageUrl("TrainingHub")}>
                  <Button className="w-full teal-gradient text-white">
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
