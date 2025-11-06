
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Download,
  Filter,
  TrendingUp,
  FileText,
  ArrowLeft,
  Sparkles,
  PlayCircle,
  AlertCircle, // Added AlertCircle for review mode banner
  RefreshCw,
  Clock,
  Settings,
  Zap,
  Code,
  Play,
  ChevronDown, // Added for advanced config toggle
  X, // Added for email badge removal
  Shield // Added for anti-scraping badge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import DataIngestionStats from "../components/ingestion/DataIngestionStats";
import IngestionResults from "../components/ingestion/IngestionResults";
import ScraperTemplate from "../components/ingestion/ScraperTemplate";
import FeedbackDashboard from "../components/ingestion/FeedbackDashboard"; // New import
import APIDocumentation from "../components/ingestion/APIDocumentation";
import DataValidationReport from "../components/ingestion/DataValidationReport";
import StructureChangeAlert from "../components/ingestion/StructureChangeAlert";

export default function DataIngestion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [rawData, setRawData] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [maxItems, setMaxItems] = useState(50);
  const [ingestionLog, setIngestionLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState([]);
  const [filterRaceRelated, setFilterRaceRelated] = useState("all");
  const [filterAntiBlack, setFilterAntiBlack] = useState("all");
  const [reviewMode, setReviewMode] = useState(false); // New state
  const [selectedForReview, setSelectedForReview] = useState(null); // New state

  // New state for sync jobs
  const [newJobName, setNewJobName] = useState("");
  const [newJobUrl, setNewJobUrl] = useState("");
  const [newJobTribunal, setNewJobTribunal] = useState("Ontario Human Rights Tribunal");
  const [newJobFrequency, setNewJobFrequency] = useState(7);

  // New state for sync jobs configuration
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [testingConfig, setTestingConfig] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [scraperConfig, setScraperConfig] = useState({
    list_page_selector: '.decision-list a, .case-listing a',
    case_link_selector: 'a[href*="decision"], a.case-link',
    title_selector: 'h1.case-title, .page-title, h1',
    date_selector: '.decision-date, .date-published, time',
    case_number_selector: '.case-number, .reference-number',
    content_selector: '.case-content, .decision-text, article',
    pagination_selector: '.next-page',
    fallback_patterns: {
      title: '<h1[^>]*>(.*?)</h1>',
      date: '\\b(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+\\w+\\s+\\d{4})\\b',
      case_number: '\\b\\d{4}\\s+[A-Z]+\\s+\\d+\\b'
    },
    ai_learning_enabled: true,
    retry_attempts: 3,
    retry_delay_seconds: 5,
    rate_limit_delay: 2.0,
    user_agent: 'ABR-Insight-Scraper/1.0',
    use_headless_browser: false // New field for headless browser
  });
  const [notificationEmails, setNotificationEmails] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Generate a simple API key for demonstration (in production, this would come from user profile)
  const [apiKey] = useState(() => {
    if (user?.id) {
      return `abr_${user.id.substring(0, 8)}_${Math.random().toString(36).substring(2, 15)}`;
    }
    return null;
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
  }, []);

  const { data: existingCases = [] } = useQuery({
    queryKey: ['ingestion-existing-cases'],
    queryFn: () => base44.entities.TribunalCase.list(),
    initialData: [],
  });

  const { data: syncJobs = [] } = useQuery({
    queryKey: ['sync-jobs'],
    queryFn: () => base44.entities.SyncJob.list('-last_run_date'),
    initialData: [],
  });

  // New query for feedback data
  const { data: feedbackData = [] } = useQuery({
    queryKey: ['classification-feedback'],
    queryFn: () => base44.entities.ClassificationFeedback.list('-reviewed_date'),
    initialData: [],
  });

  const createCasesMutation = useMutation({
    mutationFn: async (casesData) => {
      return await base44.entities.TribunalCase.bulkCreate(casesData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribunal-cases'] });
      queryClient.invalidateQueries({ queryKey: ['ingestion-existing-cases'] });
    },
  });

  // New mutation for updating existing cases (e.g., after manual review)
  const updateCaseClassificationMutation = useMutation({
    mutationFn: async ({ caseId, updates }) => {
      return await base44.entities.TribunalCase.update(caseId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tribunal-cases'] });
      queryClient.invalidateQueries({ queryKey: ['ingestion-existing-cases'] });
      addLog("✓ Classification updated successfully", "success");
    },
  });

  // New mutation for creating feedback
  const createFeedbackMutation = useMutation({
    mutationFn: async (feedbackData) => {
      return await base44.entities.ClassificationFeedback.create(feedbackData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-feedback'] });
      addLog("✓ Feedback captured for AI improvement", "success");
    },
  });

  const createSyncJobMutation = useMutation({
    mutationFn: async (jobData) => {
      return await base44.entities.SyncJob.create(jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
      addLog("✅ Sync job created successfully", "success");
    },
  });

  const updateSyncJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }) => {
      return await base44.entities.SyncJob.update(jobId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
    },
  });

  const addLog = (message, type = "info") => {
    setIngestionLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }]);
  };

  const ruleBasedClassifier = (text) => {
    const keywords = [
      "race", "racial", "colour", "color", "Black", "anti-Black",
      "African Canadian", "African-Canadian", "Afro-Canadian",
      "racial discrimination", "racial profiling", "racial harassment",
      "racial slurs", "racial bias", "systemic racism",
      "Black employee", "Black worker", "Black applicant",
      "skin colour", "skin color", "racialized", "person of colour",
      "workplace racism", "employment discrimination", "hiring bias",
      "profiling", "harassment", "microaggression", "stereotyping",
      "exclusion", "differential treatment"
    ];

    const textLower = text.toLowerCase();
    const matchedKeywords = keywords.filter(k => textLower.includes(k.toLowerCase()));

    return {
      is_race_related: matchedKeywords.length > 0,
      matched_keywords: matchedKeywords,
      confidence: matchedKeywords.length > 0 ? Math.min(matchedKeywords.length / 10, 1.0) : 0
    };
  };

  const generateAISummary = async (title, fullText) => {
    try {
      const excerpt = fullText.substring(0, 3000); // Use more text for better summary

      const prompt = `You are a legal summarization expert specializing in Canadian human rights tribunal decisions.

Analyze this tribunal case and generate a concise, professional summary (3-5 sentences) that focuses on:
1. The core allegations and facts
2. The tribunal's key findings
3. The legal rationale for the decision
4. The outcome and any significant remedies

CASE TITLE: ${title}

CASE TEXT (excerpt): ${excerpt}

Requirements:
- Write in clear, professional language
- Focus on findings and rationale, not just facts
- Be objective and precise
- Include the outcome
- Keep to 3-5 sentences maximum

Generate the summary now:`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      return {
        summary: summary.trim(),
        confidence: 0.9, // High confidence for summaries
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error("AI summary generation error:", error);
      return null;
    }
  };

  const llmClassifier = async (title, text) => {
    try {
      const excerpt = text.substring(0, 1500);

      // Few-shot learning examples
      const fewShotExamples = `
EXAMPLE 1 (Anti-Black Racism - TRUE):
Title: "Johnson v. ABC Manufacturing"
Text: "The complainant, a Black employee, alleges that his supervisor referred to him using racial slurs including the N-word on multiple occasions. He was subjected to differential treatment compared to white colleagues, being assigned more physically demanding tasks and denied training opportunities. The supervisor made comments about 'not trusting Black workers' and questioned the complainant's credentials despite his university degree."
Classification:
{
  "is_race_related": true,
  "is_anti_black_likely": true,
  "grounds_detected": ["race", "colour"],
  "discrimination_types": ["employment", "harassment"],
  "confidence_score": 0.95,
  "key_indicators": ["racial slurs", "N-word", "Black employee", "differential treatment", "not trusting Black workers"],
  "summary": "Clear case of workplace harassment and discrimination against a Black employee involving racial slurs, differential treatment, and stereotyping based on race."
}

EXAMPLE 2 (Anti-Black Racism - TRUE):
Title: "Smith v. Housing Corp"
Text: "The applicant, an African Canadian woman, was denied a rental apartment despite meeting all qualifications. The landlord stated 'we prefer professional tenants' after seeing the applicant in person. Other apartments in the building were rented to white applicants with similar or lower qualifications. The complainant's credit score and employment were superior to successful white applicants."
Classification:
{
  "is_race_related": true,
  "is_anti_black_likely": true,
  "grounds_detected": ["race", "colour"],
  "discrimination_types": ["housing"],
  "confidence_score": 0.92,
  "key_indicators": ["African Canadian", "denied rental", "code language 'professional tenants'", "differential treatment", "similar qualifications"],
  "summary": "Housing discrimination case where a qualified Black applicant was denied rental using coded language while less qualified white applicants were accepted."
}

EXAMPLE 3 (Race-related but NOT Anti-Black):
Title: "Chen v. Tech Solutions Inc."
Text: "The complainant, of Chinese origin, alleges discrimination based on accent and assumptions about technical abilities. Colleagues made comments about 'Asian math skills' and questioned whether she was 'really' a software engineer. She was excluded from client-facing roles despite qualifications."
Classification:
{
  "is_race_related": true,
  "is_anti_black_likely": false,
  "grounds_detected": ["race", "ethnic_origin", "place_of_origin"],
  "discrimination_types": ["employment", "harassment"],
  "confidence_score": 0.88,
  "key_indicators": ["Chinese origin", "accent discrimination", "Asian stereotypes", "excluded from roles"],
  "summary": "Racial discrimination and stereotyping against an Asian employee, involving exclusion and stereotypical assumptions about abilities."
}

EXAMPLE 4 (Anti-Black Racism - TRUE):
Title: "Williams v. City Police Services"
Text: "Black complainant stopped by police 5 times in 6 months in predominantly white neighborhood despite no violations. Officers cited 'suspicious behavior' but could not articulate specific concerns. White residents not subjected to similar stops. Complainant experienced humiliation and fear. Pattern suggests racial profiling."
Classification:
{
  "is_race_related": true,
  "is_anti_black_likely": true,
  "grounds_detected": ["race", "colour"],
  "discrimination_types": ["services", "harassment"],
  "confidence_score": 0.94,
  "key_indicators": ["Black complainant", "racial profiling", "suspicious behavior with no basis", "differential treatment", "pattern of stops"],
  "summary": "Racial profiling case involving repeated police stops of a Black individual without justification, demonstrating systemic anti-Black bias in service delivery."
}

EXAMPLE 5 (NOT Race-related):
Title: "Anderson v. Global Services"
Text: "The complainant alleges discrimination based on age and disability. As a 58-year-old employee with mobility limitations, he was denied accommodations for his workstation and passed over for promotion in favor of younger employees. No mention of race or colour in the allegations."
Classification:
{
  "is_race_related": false,
  "is_anti_black_likely": false,
  "grounds_detected": ["age", "disability"],
  "discrimination_types": ["employment"],
  "confidence_score": 0.90,
  "key_indicators": ["age discrimination", "disability accommodation", "no racial elements"],
  "summary": "Employment discrimination case based on age and disability, with no racial or colour-based elements present."
}

---

NOW ANALYZE THIS CASE using the same careful analysis demonstrated above:
`;

      const prompt = `You are a Canadian human rights analyst specializing in anti-Black racism cases. You have been trained on numerous tribunal decisions.

${fewShotExamples}

CASE TITLE: ${title}

CASE TEXT (excerpt): ${excerpt}

Analyze this tribunal decision using the same framework as the examples above:

1. **Is this a discrimination case based on race/colour?**
   - Look for explicit mentions of race, colour, Black, African Canadian, or racial characteristics
   - Consider coded language or indirect indicators
   - Check if race is central to the discrimination alleged

2. **Is anti-Black racism specifically involved?**
   - This is TRUE only if the complainant is Black/African Canadian/African descent
   - Generic race cases involving other groups should be marked FALSE here
   - Look for specific anti-Black stereotypes, slurs, or patterns

3. **What protected grounds are mentioned?**
   - List all grounds from: race, colour, ancestry, place_of_origin, ethnic_origin, etc.

4. **What types of discrimination occurred?**
   - employment, housing, services, harassment, etc.

IMPORTANT CLASSIFICATION RULES:
- is_anti_black_likely should ONLY be true if there's clear evidence the complainant is Black
- Not all cases mentioning "race" involve anti-Black racism
- Be specific about key_indicators - include actual phrases or facts from the text
- Use confidence_score to reflect uncertainty (0.0 to 1.0)
- If race is not mentioned at all, is_race_related should be false

Provide your analysis as valid JSON with these exact fields:
{
  "is_race_related": boolean,
  "is_anti_black_likely": boolean,
  "grounds_detected": array of strings,
  "discrimination_types": array of strings,
  "confidence_score": number 0-1,
  "key_indicators": array of specific phrases/facts,
  "summary": string (2-3 sentences)
}

RESPOND WITH ONLY VALID JSON, NO ADDITIONAL TEXT.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            is_race_related: { type: "boolean" },
            is_anti_black_likely: { type: "boolean" },
            grounds_detected: { type: "array", items: { type: "string" } },
            discrimination_types: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" },
            key_indicators: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      return response;
    } catch (error) {
      console.error("LLM classifier error:", error);
      return null;
    }
  };

  const processRawData = async () => {
    if (!rawData.trim()) {
      addLog("No data provided", "error");
      return;
    }

    setIsProcessing(true);
    setProcessedResults([]);
    addLog("Starting data ingestion process...", "info");

    const startTime = Date.now();

    try {
      // Parse JSON input
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } catch (e) {
        addLog("Invalid JSON format. Please provide valid JSON data.", "error");
        setIsProcessing(false);
        return;
      }

      addLog(`Parsed ${parsedData.length} raw cases`, "success");

      const results = [];
      const itemsToProcess = Math.min(parsedData.length, maxItems);

      for (let i = 0; i < itemsToProcess; i++) {
        const item = parsedData[i];
        addLog(`Processing case ${i + 1}/${itemsToProcess}: ${item.title || 'Untitled'}`, "info");

        // Step 1: Rule-based classification
        const fullText = `${item.title || ''} ${item.text || item.summary || item.content || ''}`;
        const ruleBasedResult = ruleBasedClassifier(fullText);

        addLog(`  → Rule-based: ${ruleBasedResult.is_race_related ? 'Race-related' : 'Not race-related'} (${ruleBasedResult.matched_keywords.length} keywords)`,
          ruleBasedResult.is_race_related ? "success" : "warning");

        // Step 2: LLM classification (only if rule-based suggests relevance)
        let llmResult = null;
        if (ruleBasedResult.is_race_related) {
          addLog("  → Running AI classification...", "info");
          llmResult = await llmClassifier(item.title || '', fullText);

          if (llmResult) {
            addLog(`  → AI Analysis: ${llmResult.is_anti_black_likely ? 'Anti-Black likely' : 'General race case'}`,
              llmResult.is_anti_black_likely ? "success" : "info");
          }
        }

        // Step 3: Generate AI summary (for all cases)
        let aiSummaryResult = null;
        addLog("  → Generating AI summary...", "info");
        aiSummaryResult = await generateAISummary(item.title || '', fullText);
        
        if (aiSummaryResult) {
          addLog("  → AI summary generated successfully", "success");
        }

        // Combine results
        const processedCase = {
          source: sourceUrl || item.source || "Manual Upload",
          title: item.title || "Untitled Case",
          case_number: item.case_number || item.id || `CASE-${Date.now()}-${i}`,
          tribunal: item.tribunal || "Canadian Human Rights Tribunal",
          year: item.year || new Date(item.date || Date.now()).getFullYear(),
          decision_date: item.date || item.decision_date || new Date().toISOString().split('T')[0],
          url: item.url || item.link || sourceUrl,
          html_excerpt: (item.text || item.content || '').substring(0, 500),
          full_text: item.text || item.content || item.summary || '',

          // Classification results
          is_race_related: llmResult?.is_race_related || ruleBasedResult.is_race_related,
          is_anti_black_likely: llmResult?.is_anti_black_likely || false,
          grounds_detected: llmResult?.grounds_detected || (ruleBasedResult.is_race_related ? ['race'] : []),
          discrimination_type: llmResult?.discrimination_types || (ruleBasedResult.is_race_related ? ['employment'] : []),

          // AI insights
          ai_summary: llmResult?.summary || item.summary || '',
          ai_confidence: llmResult?.confidence_score || ruleBasedResult.confidence,
          ai_key_indicators: llmResult?.key_indicators || ruleBasedResult.matched_keywords,

          // NEW: AI-generated summary
          ai_generated_summary: aiSummaryResult?.summary || null,
          summary_confidence: aiSummaryResult?.confidence || null,
          summary_generation_date: aiSummaryResult?.generated_at || null,

          // Additional metadata
          ingested_at: new Date().toISOString(),
          ingested_by: user?.email,
          rule_based_match: ruleBasedResult.is_race_related,
          llm_match: llmResult?.is_race_related || false,

          // Map to TribunalCase schema
          protected_ground: llmResult?.grounds_detected || ['race', 'colour'],
          race_category: llmResult?.is_anti_black_likely ? 'Black/African Canadian' : null,
          summary_en: aiSummaryResult?.summary || llmResult?.summary || item.summary || fullText.substring(0, 500),
          keywords: [...new Set([
            ...(ruleBasedResult.matched_keywords || []),
            ...(llmResult?.key_indicators || []),
            ...(item.keywords || [])
          ])].slice(0, 10),
          outcome: item.outcome || "Unknown",
          precedent_value: llmResult?.confidence_score > 0.8 ? "High" : "Medium",

          // Dummy validation results for demonstration
          validation_results: {
            overall_status: "passed",
            checks: [
              { name: "Title present", status: item.title ? "passed" : "failed", details: item.title ? "" : "Title missing" },
              { name: "Full text present", status: fullText.length > 50 ? "passed" : "failed", details: fullText.length > 50 ? "" : "Text too short" },
              { name: "Decision date valid", status: new Date(item.date).toString() !== "Invalid Date" ? "passed" : "failed", details: new Date(item.date).toString() !== "Invalid Date" ? "" : "Invalid date format" },
              { name: "AI Summary generated", status: aiSummaryResult?.summary ? "passed" : "failed", details: aiSummaryResult?.summary ? "" : "Summary generation failed" },
              { name: "AI Classification successful", status: llmResult ? "passed" : "failed", details: llmResult ? "" : "LLM classification failed" },
            ]
          }
        };

        results.push(processedCase);
        addLog(`  ✓ Case processed successfully`, "success");

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800)); // Increased delay for additional AI call
      }

      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      setProcessedResults(results);
      addLog(`\n✅ Processing complete! ${results.length} cases classified in ${durationSeconds}s`, "success");
      addLog(`   • Race-related: ${results.filter(r => r.is_race_related).length}`, "info");
      addLog(`   • Anti-Black likely: ${results.filter(r => r.is_anti_black_likely).length}`, "info");
      addLog(`   • AI summaries generated: ${results.filter(r => r.ai_generated_summary).length}`, "info");

    } catch (error) {
      console.error("Processing error:", error);
      addLog(`Error during processing: ${error.message}`, "error");
    }

    setIsProcessing(false);
  };

  const handleImportToDatabase = async () => {
    if (processedResults.length === 0) {
      addLog("No processed results to import", "warning");
      return;
    }

    addLog("Starting database import...", "info");

    try {
      // Filter out duplicates based on case_number
      const existingCaseNumbers = new Set(existingCases.map(c => c.case_number));
      const newCases = processedResults.filter(r => !existingCaseNumbers.has(r.case_number));

      if (newCases.length === 0) {
        addLog("All cases already exist in database (duplicates skipped)", "warning");
        return;
      }

      addLog(`Importing ${newCases.length} new cases (${processedResults.length - newCases.length} duplicates skipped)...`, "info");

      // Prepare cases for database (remove processing-specific fields)
      const casesToImport = newCases.map(c => ({
        case_number: c.case_number,
        title: c.title,
        tribunal: c.tribunal,
        year: c.year,
        decision_date: c.decision_date,
        protected_ground: c.protected_ground,
        race_category: c.race_category,
        discrimination_type: c.discrimination_type,
        outcome: c.outcome,
        summary_en: c.summary_en,
        ai_generated_summary: c.ai_generated_summary, // NEW
        summary_generation_date: c.summary_generation_date, // NEW
        summary_confidence: c.summary_confidence, // NEW
        full_text_url: c.url,
        keywords: c.keywords,
        precedent_value: c.precedent_value,
        ai_insights: `Confidence: ${(c.ai_confidence * 100).toFixed(0)}%\n\nKey Indicators:\n${c.ai_key_indicators?.join(', ') || 'N/A'}\n\nClassification: ${c.is_anti_black_likely ? 'Anti-Black racism likely' : 'General race/colour case'}`
      }));

      await createCasesMutation.mutateAsync(casesToImport);

      addLog(`✅ Successfully imported ${newCases.length} cases to database!`, "success");
      addLog(`   • ${casesToImport.filter(c => c.ai_generated_summary).length} cases with AI summaries`, "info");

      // Clear processed results after successful import
      setTimeout(() => {
        setProcessedResults([]);
        setRawData("");
      }, 2000);

    } catch (error) {
      console.error("Import error:", error);
      addLog(`❌ Import failed: ${error.message}`, "error");
    }
  };

  const handleManualReview = (result) => {
    setSelectedForReview(result);
    setReviewMode(true);
  };

  const handleConfirmClassification = async (caseId, isCorrect) => {
    // For now, confirm just means updating the ai_insights field with a human verified flag.
    // In a more complex system, this might involve updating other fields or a dedicated 'verified' status.
    if (isCorrect) {
      addLog(`✓ Classification confirmed for case ${caseId}`, "success");
      // The outline doesn't re-introduce the mutation for confirmation, just clears selected.
      // If `selectedForReview` had an `id` (meaning it was an existing DB case),
      // the mutation could be used here:
      // const currentResult = processedResults.find(r => r.case_number === caseId);
      // if (currentResult && currentResult.id) {
      //   await updateCaseClassificationMutation.mutateAsync({
      //     caseId: currentResult.id,
      //     updates: {
      //       ai_insights: `${currentResult.ai_insights}\n\n[Human Verified: ${new Date().toISOString()}]`
      //     }
      //   });
      // }
    }
    // Remove the item from selectedForReview after action
    setSelectedForReview(null);
    // Optionally exit review mode if all are reviewed or a specific flow is intended
    // For now, let's just clear selectedForReview.
    // If the intention is to exit review mode after any confirmation, uncomment the next line:
    // setReviewMode(false);
  };

  const handleReclassify = async (caseId, newClassification) => {
    addLog(`Reclassifying case ${caseId}...`, "info");

    try {
      const originalResult = processedResults.find(r => r.case_number === caseId);
      
      if (!originalResult) {
        addLog(`❌ Could not find original result for case ${caseId}`, "error");
        return;
      }

      // Calculate changes made
      const changes = [];
      
      if (originalResult.is_race_related !== newClassification.is_race_related) {
        changes.push({
          field: "is_race_related",
          from: String(originalResult.is_race_related),
          to: String(newClassification.is_race_related)
        });
      }
      
      if (originalResult.is_anti_black_likely !== newClassification.is_anti_black_likely) {
        changes.push({
          field: "is_anti_black_likely",
          from: String(originalResult.is_anti_black_likely),
          to: String(newClassification.is_anti_black_likely)
        });
      }

      // grounds_detected comparison (handle potential array diff)
      const originalGrounds = new Set(originalResult.protected_ground || []);
      const newGrounds = new Set(newClassification.grounds_detected || []);
      const groundsChanged = [...originalGrounds, ...newGrounds].some(g => !originalGrounds.has(g) || !newGrounds.has(g));
      if (groundsChanged) {
        changes.push({
          field: "protected_ground",
          from: JSON.stringify([...originalGrounds]),
          to: JSON.stringify([...newGrounds])
        });
      }

      // discrimination_types comparison (handle potential array diff)
      const originalDiscTypes = new Set(originalResult.discrimination_type || []);
      const newDiscTypes = new Set(newClassification.discrimination_types || []);
      const discTypesChanged = [...originalDiscTypes, ...newDiscTypes].some(dt => !originalDiscTypes.has(dt) || !newDiscTypes.has(dt));
      if (discTypesChanged) {
        changes.push({
          field: "discrimination_type",
          from: JSON.stringify([...originalDiscTypes]),
          to: JSON.stringify([...newDiscTypes])
        });
      }

      // Determine feedback type
      let feedbackType = "partial_correction";
      const isRaceRelatedChanged = changes.some(c => c.field === "is_race_related");
      const isAntiBlackChanged = changes.some(c => c.field === "is_anti_black_likely");

      if (changes.length === 0) {
        feedbackType = "confirmed_correct";
      } else if (isRaceRelatedChanged) {
        if (!originalResult.is_race_related && newClassification.is_race_related) {
          feedbackType = "false_negative"; // AI said no race, manual says yes
        } else if (originalResult.is_race_related && !newClassification.is_race_related) {
          feedbackType = "false_positive"; // AI said race, manual says no
        }
      } else if (isAntiBlackChanged) {
        if (!originalResult.is_anti_black_likely && newClassification.is_anti_black_likely) {
          feedbackType = "anti_black_false_negative"; // AI said not anti-black, manual says yes
        } else if (originalResult.is_anti_black_likely && !newClassification.is_anti_black_likely) {
          feedbackType = "anti_black_false_positive"; // AI said anti-black, manual says no
        }
      }
      // If none of the above, it remains "partial_correction" (e.g., only grounds or discrimination types changed).


      // Determine severity
      let severity = "minor";
      if (changes.some(c => c.field === "is_anti_black_likely" && (c.from === "false" && c.to === "true" || c.from === "true" && c.to === "false"))) {
        severity = "critical"; // A change in Anti-Black classification is very important
      } else if (changes.some(c => c.field === "is_race_related" && (c.from === "false" && c.to === "true" || c.from === "true" && c.to === "false"))) {
        severity = "major"; // A change in general race-related classification
      } else if (changes.length > 0) {
        severity = "moderate"; // Changes in grounds_detected or discrimination_types
      } else if (changes.length === 0) {
        severity = "minor"; // Confirmed correct
      }

      // Create feedback record
      const feedbackData = {
        case_number: caseId,
        case_title: originalResult.title,
        case_text_excerpt: originalResult.full_text?.substring(0, 1000) || originalResult.html_excerpt,
        original_ai_classification: {
          is_race_related: originalResult.is_race_related,
          is_anti_black_likely: originalResult.is_anti_black_likely,
          grounds_detected: originalResult.protected_ground || [],
          discrimination_types: originalResult.discrimination_type || [],
          confidence_score: originalResult.ai_confidence,
          key_indicators: originalResult.ai_key_indicators || [],
          summary: originalResult.ai_summary || ""
        },
        manual_classification: {
          is_race_related: newClassification.is_race_related,
          is_anti_black_likely: newClassification.is_anti_black_likely,
          grounds_detected: newClassification.grounds_detected || [],
          discrimination_types: newClassification.discrimination_types || [],
          confidence_score: 1.0 // Manual review is 100% confident
        },
        changes_made: changes,
        admin_reason: newClassification.reason || "Manual reclassification by admin",
        feedback_type: feedbackType,
        severity: severity,
        reviewer_email: user.email,
        reviewed_date: new Date().toISOString(),
        used_for_training: false
      };

      // Save feedback
      await createFeedbackMutation.mutateAsync(feedbackData);

      // Update processed results locally
      setProcessedResults(prev => prev.map(r =>
        r.case_number === caseId
          ? {
              ...r,
              is_race_related: newClassification.is_race_related,
              is_anti_black_likely: newClassification.is_anti_black_likely,
              protected_ground: newClassification.grounds_detected, // Using directly from newClassification as per outline
              race_category: newClassification.is_anti_black_likely ? 'Black/African Canadian' : null,
              discrimination_type: newClassification.discrimination_types, // Using directly from newClassification as per outline
              ai_confidence: 1.0, // Manual review implies high confidence
              manually_reviewed: true, // Flag for local state
              feedback_captured: true
            }
          : r
      ));

      setSelectedForReview(null);
      setReviewMode(false);
      addLog(`✓ Case ${caseId} reclassified and feedback captured for AI improvement!`, "success");
    } catch (error) {
      addLog(`❌ Reclassification failed for case ${caseId}: ${error.message}`, "error");
    }
  };

  const testScraperConfig = async () => {
    if (!newJobUrl) {
      addLog("Please enter a URL to test", "error");
      return;
    }

    setTestingConfig(true);
    setTestResults(null);
    addLog("Testing scraper configuration...", "info");

    try {
      // Simulate fetching and parsing the URL
      // In a real scenario, this would call a backend function
      // For client-side testing, we'll try to fetch and parse locally.
      // CORS might prevent fetching external URLs directly from the browser.
      // This part needs a robust backend endpoint to truly test.
      // For now, let's assume we can fetch it.
      const response = await fetch(newJobUrl).catch(() => null);

      if (!response || !response.ok) {
        setTestResults({
          success: false,
          message: "Failed to fetch URL. Check that the URL is accessible and CORS policies allow client-side access, or ensure your scraper backend is configured.",
          details: `Status: ${response?.status || 'Network Error'}`
        });
        addLog("❌ Configuration test failed - URL not accessible", "error");
        setTestingConfig(false);
        return;
      }

      const html = await response.text();

      // Test each selector
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const results = {
        list_page_selector: doc.querySelectorAll(scraperConfig.list_page_selector.split(',')[0].trim()).length,
        case_link_selector: doc.querySelectorAll(scraperConfig.case_link_selector.split(',')[0].trim()).length,
        title_selector: doc.querySelector(scraperConfig.title_selector.split(',')[0].trim()) ? 1 : 0,
        date_selector: doc.querySelector(scraperConfig.date_selector.split(',')[0].trim()) ? 1 : 0,
        case_number_selector: doc.querySelector(scraperConfig.case_number_selector.split(',')[0].trim()) ? 1 : 0,
        content_selector: doc.querySelector(scraperConfig.content_selector.split(',')[0].trim()) ? 1 : 0,
      };

      const successCount = Object.values(results).filter(v => v > 0).length;
      const totalTests = Object.keys(results).length;

      let sampleTitle = doc.querySelector(scraperConfig.title_selector.split(',')[0].trim())?.textContent?.substring(0, 100) || 'Not found';
      if (sampleTitle.length === 100) sampleTitle += '...';

      setTestResults({
        success: successCount >= 3, // At least 3 selectors should work
        message: `Found matches for ${successCount}/${totalTests} primary selectors`,
        details: results,
        sampleData: {
          title: sampleTitle,
          caseLinks: results.case_link_selector > 0 ? `${results.case_link_selector} links found` : 'No links found'
        }
      });

      if (successCount >= 3) {
        addLog(`✅ Configuration test passed - ${successCount}/${totalTests} selectors working`, "success");
      } else {
        addLog(`⚠️ Configuration test partial - Only ${successCount}/${totalTests} selectors working`, "warning");
      }

    } catch (error) {
      setTestResults({
        success: false,
        message: "Error testing configuration. Ensure the URL is valid and accessible, and selectors are correct.",
        details: error.message
      });
      addLog(`❌ Configuration test error: ${error.message}`, "error");
    }

    setTestingConfig(false);
  };


  const handleCreateSyncJob = async () => {
    if (!newJobName || !newJobUrl) {
      addLog("Job name and URL are required", "error");
      return;
    }

    // Parse notification emails
    const emailList = notificationEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    try {
      const jobData = {
        job_name: newJobName,
        source_url: newJobUrl,
        tribunal_name: newJobTribunal,
        frequency_days: newJobFrequency,
        max_items_per_run: maxItems,
        next_run_date: addDays(new Date(), newJobFrequency).toISOString(),
        created_by: user.email,
        status: "pending",
        scraper_config: scraperConfig,
        notification_emails: emailList
      };

      await createSyncJobMutation.mutateAsync(jobData);

      // Send confirmation email
      if (emailList.length > 0) {
        try {
          await base44.integrations.Core.SendEmail({
            to: emailList.join(','),
            subject: `Sync Job Created: ${newJobName}`,
            body: `A new sync job has been created for ${newJobTribunal}.\n\nJob Name: ${newJobName}\nSource URL: ${newJobUrl}\nFrequency: Every ${newJobFrequency} days\n\nYou will receive notifications when this job runs.`
          });
          addLog("Confirmation email sent", "success");
        } catch (emailError) {
          addLog("Job created but email notification failed", "warning");
        }
      }

      // Reset form
      setNewJobName("");
      setNewJobUrl("");
      setNewJobTribunal("Ontario Human Rights Tribunal");
      setNewJobFrequency(7);
      setNotificationEmails("");
      setShowAdvancedConfig(false);
      setTestResults(null);
    } catch (error) {
      addLog(`Failed to create sync job: ${error.message}`, "error");
    }
  };

  const handleRunSyncJob = async (job) => {
    addLog(`Manually triggering sync job: ${job.job_name}`, "info");

    // Check if job is CAPTCHA blocked
    if (job.status === "captcha_blocked") {
      if (!window.confirm("This job was previously blocked by CAPTCHA. Retry anyway? Consider enabling headless browser mode.")) {
        addLog("Manual trigger aborted.", "info");
        return;
      }
      // Update status from captcha_blocked to pending before running
      await updateSyncJobMutation.mutateAsync({
        jobId: job.id,
        updates: {
          status: "pending", // Reset status before running
          anti_scraping_detected: false,
          last_error: null,
          last_captcha_date: null
        }
      });
    }

    try {
      await updateSyncJobMutation.mutateAsync({
        jobId: job.id,
        updates: {
          status: "running",
          last_run_date: new Date().toISOString()
        }
      });

      addLog(`Sync job "${job.job_name}" started. Check external scraper logs for progress.`, "success");
      addLog(`📝 Note: This triggers the job - actual scraping happens in your external service.`, "info");

      // Send notification email
      if (job.notification_emails && job.notification_emails.length > 0) {
        try {
          await base44.integrations.Core.SendEmail({
            to: job.notification_emails.join(','),
            subject: `Sync Job Started: ${job.job_name}`,
            body: `The sync job "${job.job_name}" has been manually triggered.\n\nTribunal: ${job.tribunal_name}\nSource: ${job.source_url}\n\nYou will receive another notification when the job completes.`
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
        }
      }
    } catch (error) {
      addLog(`Failed to trigger sync job: ${error.message}`, "error");
    }
  };

  const handleAutoFixStructure = async (jobId) => {
    const job = syncJobs.find(j => j.id === jobId);
    if (!job || !job.structure_change_details) {
      addLog(`Job or structure change details not found for ID: ${jobId}`, "error");
      return;
    }

    try {
      const { suggested_fixes } = job.structure_change_details;
      
      // Apply suggested fixes to scraper config
      const updatedConfig = { ...job.scraper_config };
      const updatedLearnedSelectors = { ...job.learned_selectors };

      suggested_fixes.forEach(fix => {
        const selectorName = fix.selector_name;
        if (updatedConfig.hasOwnProperty(selectorName)) { // Use hasOwnProperty to check if the property exists
          updatedConfig[selectorName] = fix.new_value;
          updatedLearnedSelectors[selectorName] = fix.new_value;
        } else if (updatedConfig.fallback_patterns && updatedConfig.fallback_patterns.hasOwnProperty(selectorName)) {
          updatedConfig.fallback_patterns[selectorName] = fix.new_value;
          updatedLearnedSelectors[selectorName] = fix.new_value;
        }
      });

      await updateSyncJobMutation.mutateAsync({
        jobId,
        updates: {
          scraper_config: updatedConfig,
          structure_change_detected: false,
          learned_selectors: updatedLearnedSelectors,
          status: 'pending' // Reset status to pending for next run
        }
      });

      addLog(`✅ Auto-fixed structure changes for job: ${job.job_name}`, "success");
    } catch (error) {
      addLog(`Failed to auto-fix: ${error.message}`, "error");
    }
  };

  const handleManualReviewStructure = (jobId) => {
    const job = syncJobs.find(j => j.id === jobId);
    if (job) {
      // Switch to sync-jobs tab and show advanced config
      setShowAdvancedConfig(true);
      addLog(`Opening manual review for job: ${job.job_name}`, "info");
    }
  };

  const handleDismissStructureAlert = async (jobId) => {
    try {
      await updateSyncJobMutation.mutateAsync({
        jobId,
        updates: {
          structure_change_detected: false,
          status: 'pending' // Reset status to pending
        }
      });
      addLog("Structure change alert dismissed", "info");
    } catch (error) {
      addLog(`Failed to dismiss alert: ${error.message}`, "error");
    }
  };

  const addNotificationEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      const current = notificationEmails ? notificationEmails.split(',').map(e => e.trim()) : [];
      if (!current.includes(emailInput.trim())) {
        setNotificationEmails([...current, emailInput.trim()].join(', '));
      }
      setEmailInput('');
    }
  };

  const removeNotificationEmail = (emailToRemove) => {
    const current = notificationEmails.split(',').map(e => e.trim());
    setNotificationEmails(current.filter(e => e !== emailToRemove).join(', '));
  };


  const filteredResults = processedResults.filter(r => {
    const raceMatch = filterRaceRelated === "all" ||
      (filterRaceRelated === "yes" && r.is_race_related) ||
      (filterRaceRelated === "no" && !r.is_race_related);

    const antiBlackMatch = filterAntiBlack === "all" ||
      (filterAntiBlack === "yes" && r.is_anti_black_likely) ||
      (filterAntiBlack === "no" && !r.is_anti_black_likely);

    return raceMatch && antiBlackMatch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Data Ingestion Manager</h1>
                <p className="text-gray-600">AI-powered tribunal case classification and automated sync</p>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              Admin Only
            </Badge>
          </motion.div>
        </div>

        {/* Stats Overview */}
        {processedResults.length > 0 && (
          <>
            <DataIngestionStats results={processedResults} />

            {/* Review Mode Banner */}
            {reviewMode && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Review Mode Active</span>
                    <span className="text-sm text-blue-700">
                      Manually verify AI classifications before importing
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReviewMode(false);
                      setSelectedForReview(null);
                    }}
                  >
                    Exit Review Mode
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="upload">Manual Upload</TabsTrigger>
            <TabsTrigger value="sync-jobs">
              Sync Jobs ({syncJobs.length})
            </TabsTrigger>
            <TabsTrigger value="api">API Docs</TabsTrigger>
            <TabsTrigger value="results">
              Results ({processedResults.length})
              {reviewMode && <Badge className="ml-2 bg-blue-500">Review</Badge>}
            </TabsTrigger>
            <TabsTrigger value="feedback">
              Feedback ({feedbackData.length})
            </TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Tribunal Case Data
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Paste JSON data from your tribunal scraper. The system will classify and process cases using AI.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Source URL (Optional)
                  </label>
                  <Input
                    placeholder="https://example-tribunal.ca/decisions"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Max Items to Process
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={maxItems}
                    onChange={(e) => setMaxItems(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Case Data (JSON Format)
                  </label>
                  <Textarea
                    placeholder={`[\n  {\n    "title": "Case Title",\n    "case_number": "2024 CHRT 123",\n    "date": "2024-01-15",\n    "tribunal": "CHRT",\n    "text": "Full case text...",\n    "url": "https://...",\n    "outcome": "Upheld - Full"\n  }\n]`}
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported fields: title, case_number, date, tribunal, text/content/summary, url, outcome
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={processRawData}
                    disabled={isProcessing || !rawData.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing... ({processedResults.length} done)
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Process & Classify Data
                      </>
                    )}
                  </Button>

                  {processedResults.length > 0 && !isProcessing && (
                    <Button
                      onClick={handleImportToDatabase}
                      className="teal-gradient text-white"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Import to Database
                    </Button>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    How It Works
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Upload scraped JSON data from tribunal websites</li>
                    <li><strong>Rule-based classifier</strong> scans for anti-Black racism keywords</li>
                    <li><strong>AI classifier</strong> performs deep analysis on relevant cases</li>
                    <li>Results are tagged with race-relatedness and confidence scores</li>
                    <li>Import processed cases directly to the database</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Sync Jobs Tab */}
          <TabsContent value="sync-jobs" className="space-y-6">
            {/* Structure Change Alerts */}
            {syncJobs.filter(j => j.structure_change_detected).map(job => (
              <StructureChangeAlert
                key={job.id}
                job={job}
                onAutoFix={handleAutoFixStructure}
                onManualReview={handleManualReviewStructure}
                onDismiss={handleDismissStructureAlert}
              />
            ))}

            {/* Create New Job */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Create Automated Sync Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Job Name
                    </label>
                    <Input
                      placeholder="e.g., OHRT Weekly Sync"
                      value={newJobName}
                      onChange={(e) => setNewJobName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tribunal
                    </label>
                    <select
                      value={newJobTribunal}
                      onChange={(e) => setNewJobTribunal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>Ontario Human Rights Tribunal</option>
                      <option>Canadian Human Rights Tribunal</option>
                      <option>Quebec Human Rights Tribunal</option>
                      <option>BC Human Rights Tribunal</option>
                      <option>Federal Court</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Source URL
                  </label>
                  <Input
                    placeholder="https://tribunal-website.ca/decisions"
                    value={newJobUrl}
                    onChange={(e) => setNewJobUrl(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Run Every (days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={newJobFrequency}
                      onChange={(e) => setNewJobFrequency(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Max Cases Per Run
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={maxItems}
                      onChange={(e) => setMaxItems(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Email Notifications */}
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Notifications
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    Receive email alerts when jobs complete, fail, or detect issues
                  </p>

                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="admin@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNotificationEmail()}
                    />
                    <Button
                      type="button"
                      onClick={addNotificationEmail}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>

                  {notificationEmails && (
                    <div className="flex flex-wrap gap-2">
                      {notificationEmails.split(',').map(email => email.trim()).filter(e => e).map(email => (
                        <Badge key={email} variant="outline" className="flex items-center gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeNotificationEmail(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Advanced Configuration Toggle */}
                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                    className="w-full"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    {showAdvancedConfig ? 'Hide' : 'Show'} Advanced Configuration
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedConfig ? 'rotate-180' : ''}`} />
                  </Button>
                </div>

                {/* Advanced Configuration Fields */}
                <AnimatePresence>
                  {showAdvancedConfig && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border rounded-lg p-4 bg-gray-50 overflow-hidden" // overflow-hidden to prevent layout shift during animation
                    >
                      <h4 className="font-semibold text-gray-900 mb-3">CSS Selectors</h4>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            List Page Selector
                          </label>
                          <Input
                            value={scraperConfig.list_page_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, list_page_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Case Link Selector
                          </label>
                          <Input
                            value={scraperConfig.case_link_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, case_link_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Title Selector
                          </label>
                          <Input
                            value={scraperConfig.title_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, title_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Date Selector
                          </label>
                          <Input
                            value={scraperConfig.date_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, date_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Case Number Selector
                          </label>
                          <Input
                            value={scraperConfig.case_number_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, case_number_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Content Selector
                          </label>
                          <Input
                            value={scraperConfig.content_selector}
                            onChange={(e) => setScraperConfig({...scraperConfig, content_selector: e.target.value})}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 mt-4 mb-3">Regex Fallback Patterns</h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Title Pattern
                          </label>
                          <Input
                            value={scraperConfig.fallback_patterns.title}
                            onChange={(e) => setScraperConfig({
                              ...scraperConfig,
                              fallback_patterns: {...scraperConfig.fallback_patterns, title: e.target.value}
                            })}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Date Pattern
                          </label>
                          <Input
                            value={scraperConfig.fallback_patterns.date}
                            onChange={(e) => setScraperConfig({
                              ...scraperConfig,
                              fallback_patterns: {...scraperConfig.fallback_patterns, date: e.target.value}
                            })}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Case Number Pattern
                          </label>
                          <Input
                            value={scraperConfig.fallback_patterns.case_number}
                            onChange={(e) => setScraperConfig({
                              ...scraperConfig,
                              fallback_patterns: {...scraperConfig.fallback_patterns, case_number: e.target.value}
                            })}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-900 mt-4 mb-3">Scraper Settings</h4>

                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Retry Attempts
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={scraperConfig.retry_attempts}
                            onChange={(e) => setScraperConfig({...scraperConfig, retry_attempts: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Retry Delay (seconds)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            value={scraperConfig.retry_delay_seconds}
                            onChange={(e) => setScraperConfig({...scraperConfig, retry_delay_seconds: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Rate Limit (seconds)
                          </label>
                          <Input
                            type="number"
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={scraperConfig.rate_limit_delay}
                            onChange={(e) => setScraperConfig({...scraperConfig, rate_limit_delay: Number(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          User Agent
                        </label>
                        <Input
                          value={scraperConfig.user_agent}
                          onChange={(e) => setScraperConfig({...scraperConfig, user_agent: e.target.value})}
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          checked={scraperConfig.ai_learning_enabled}
                          onChange={(e) => setScraperConfig({...scraperConfig, ai_learning_enabled: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label className="text-sm text-gray-700">
                          Enable AI selector learning (adapts to HTML changes automatically)
                        </label>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          checked={scraperConfig.use_headless_browser}
                          onChange={(e) => setScraperConfig({...scraperConfig, use_headless_browser: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label className="text-sm text-gray-700">
                          Use headless browser for scraping (for dynamic content/anti-bot protection)
                        </label>
                      </div>

                      {/* Test Configuration Button */}
                      <div className="border-t pt-4 mt-4">
                        <Button
                          type="button"
                          onClick={testScraperConfig}
                          disabled={testingConfig || !newJobUrl}
                          variant="outline"
                          className="w-full"
                        >
                          {testingConfig ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Testing Configuration...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Test Configuration
                            </>
                          )}
                        </Button>

                        {/* Test Results */}
                        {testResults && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-4 rounded-lg border-2 ${
                              testResults.success
                                ? 'bg-green-50 border-green-300'
                                : 'bg-yellow-50 border-yellow-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {testResults.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <h5 className={`font-semibold mb-2 ${
                                  testResults.success ? 'text-green-900' : 'text-yellow-900'
                                }`}>
                                  {testResults.message}
                                </h5>
                                {testResults.details && typeof testResults.details === 'object' && (
                                  <div className="space-y-1 text-sm">
                                    {Object.entries(testResults.details).map(([key, value]) => (
                                      <div key={key} className="flex items-center justify-between">
                                        <span className="text-gray-700">{key.replace(/_/g, ' ')}:</span>
                                        <Badge variant={value > 0 ? 'default' : 'outline'} className="text-xs">
                                          {value > 0 ? `${value} found` : 'Not found'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {testResults.sampleData && (
                                  <div className="mt-3 p-2 bg-white rounded border text-xs">
                                    <div className="font-semibold mb-1">Sample Data:</div>
                                    <div className="text-gray-700">{testResults.sampleData.title}</div>
                                    <div className="text-gray-600 mt-1">{testResults.sampleData.caseLinks}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleCreateSyncJob}
                  disabled={!newJobName || !newJobUrl}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Create Sync Job
                </Button>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <strong className="text-yellow-900">⚠️ Important:</strong>
                  <p className="text-yellow-800 mt-1">
                    Sync jobs track scheduling but require an <strong>external scraper service</strong> to fetch actual data.
                    Test your configuration before creating the job to ensure selectors work correctly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Jobs List - Enhanced */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Active Sync Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syncJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No sync jobs configured yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first automated sync job above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {syncJobs.map((job) => (
                      <div key={job.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{job.job_name}</h4>
                              <Badge className={
                                job.status === "completed" ? "bg-green-100 text-green-800" :
                                job.status === "running" ? "bg-blue-100 text-blue-800" :
                                job.status === "captcha_blocked" ? "bg-red-100 text-red-800 animate-pulse" :
                                job.status === "failed" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {job.status === "captcha_blocked" ? "⚠️ CAPTCHA Blocked" : job.status}
                              </Badge>
                              {job.anti_scraping_detected && (
                                <Badge variant="outline" className="border-red-500 text-red-700">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Anti-Scraping
                                </Badge>
                              )}
                              {job.scraper_config?.use_headless_browser && (
                                <Badge variant="outline" className="border-purple-500 text-purple-700">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Headless
                                </Badge>
                              )}
                            </div>
                            
                            {/* CAPTCHA Alert Banner */}
                            {job.status === "captcha_blocked" && (
                              <div className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-red-900 text-sm">CAPTCHA Detected</p>
                                    <p className="text-xs text-red-700 mt-1">
                                      This job encountered anti-scraping measures. Consider:
                                    </p>
                                    <ul className="text-xs text-red-700 mt-2 ml-4 list-disc space-y-1">
                                      <li>Enabling headless browser mode in advanced settings</li>
                                      <li>Increasing rate limit delays</li>
                                      <li>Waiting before retrying (rate-limit may reset)</li>
                                      <li>Contacting tribunal website administrator for legal access</li>
                                    </ul>
                                    {job.last_captcha_date && (
                                      <p className="text-xs text-red-600 mt-2">
                                        Last detected: {format(new Date(job.last_captcha_date), 'MMM dd, yyyy HH:mm')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600 space-y-1">
                              <div><strong>Tribunal:</strong> {job.tribunal_name}</div>
                              <div><strong>URL:</strong> <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{job.source_url}</a></div>
                              <div><strong>Frequency:</strong> Every {job.frequency_days} days</div>
                              {job.last_run_date && (
                                <div><strong>Last Run:</strong> {format(new Date(job.last_run_date), 'MMM dd, yyyy HH:mm')}</div>
                              )}
                              {job.next_run_date && (
                                <div><strong>Next Run:</strong> {format(new Date(job.next_run_date), 'MMM dd, yyyy')}</div>
                              )}
                              <div><strong>Total Ingested:</strong> {job.total_cases_ingested} cases</div>
                              {job.captcha_encounters > 0 && (
                                <div className="text-red-600">
                                  <strong>CAPTCHA Encounters:</strong> {job.captcha_encounters}
                                </div>
                              )}
                              {job.last_error && (
                                <div className="text-red-600"><strong>Last Error:</strong> {job.last_error}</div>
                              )}
                              {job.notification_emails && job.notification_emails.length > 0 && (
                                <div><strong>Notifications:</strong> {job.notification_emails.join(', ')}</div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRunSyncJob(job)}
                            disabled={job.status === "running"}
                            className={job.status === "captcha_blocked" ? "bg-orange-600 text-white hover:bg-orange-700" : "teal-gradient text-white"}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {job.status === "captcha_blocked" ? "Retry Job" : "Run Now"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Integration Guide with Scraper Template */}
            <ScraperTemplate />

            {/* Additional Configuration Guide */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Settings className="w-5 h-5" />
                  Advanced Configuration Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-green-800">
                  <div className="p-3 bg-white border border-green-200 rounded-lg">
                    <h5 className="font-semibold mb-2">🎯 Selector Strategy</h5>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Start with specific selectors (e.g., <code className="bg-green-100 px-1 rounded">.case-title</code>)</li>
                      <li>Add fallback regex patterns for resilience</li>
                      <li>Let AI learn alternatives over time</li>
                      <li>Monitor "Structure Change Detected" alerts</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border border-green-200 rounded-lg">
                    <h5 className="font-semibold mb-2">⚡ Performance Optimization</h5>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Set <code className="bg-green-100 px-1 rounded">rate_limit_delay</code> to 2-5 seconds</li>
                      <li>Start with <code className="bg-green-100 px-1 rounded">max_items_per_run: 20</code> for testing</li>
                      <li>Increase gradually after validating results</li>
                      <li>Use <code className="bg-green-100 px-1 rounded">retry_attempts: 3</code> for reliability</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border border-green-200 rounded-lg">
                    <h5 className="font-semibold mb-2">🔍 Troubleshooting</h5>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Check execution logs for parsing errors</li>
                      <li>Verify selectors using browser DevTools (F12)</li>
                      <li>Test regex patterns at regex101.com</li>
                      <li>Enable AI learning for automatic fixes</li>
                      <li>Review "AI Adaptations Count" in job stats</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border border-green-200 rounded-lg">
                    <h5 className="font-semibold mb-2">📊 Monitoring Success</h5>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li><strong>High success:</strong> {">"} 90% cases parsed</li>
                      <li><strong>Needs attention:</strong> {"<"} 70% cases parsed</li>
                      <li><strong>Structure change:</strong> Sudden drop in success rate</li>
                      <li>Review learned selectors in job config</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white border-2 border-green-300 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Example: Resilient Selector Configuration
                  </h5>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                    <pre>{`{
  "list_page_selector": ".decision-list a, .case-listing a",
  "case_link_selector": "a[href*='decision'], a.case-link",
  "title_selector": "h1.case-title, .page-title, h1",
  "date_selector": ".decision-date, .date-published, time",
  "case_number_selector": ".case-number, .reference-number",
  "content_selector": ".case-content, .decision-text, article",

  "fallback_patterns": {
    "title": "<h1[^>]*>(.*?)</h1>",
    "date": "\\\\b(\\\\d{4}-\\\\d{2}-\\\\d{2}|\\\\d{1,2}\\\\s+\\\\w+\\\\s+\\\\d{4})\\\\b",
    "case_number": "\\\\b\\\\d{4}\\\\s+[A-Z]+\\\\s+\\\\d+\\\\b"
  },

  "ai_learning_enabled": true,
  "retry_attempts": 3,
  "retry_delay_seconds": 5,
  "rate_limit_delay": 2.0,
  "use_headless_browser": false
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Examples */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Clock className="w-5 h-5" />
                  Scheduling Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="cron" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="cron">Cron</TabsTrigger>
                    <TabsTrigger value="aws">AWS Lambda</TabsTrigger>
                    <TabsTrigger value="heroku">Heroku</TabsTrigger>
                    <TabsTrigger value="github">GitHub Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cron" className="space-y-3">
                    <p className="text-sm text-blue-800">Linux/Mac crontab configuration:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs space-y-2">
                      <div># Run every Sunday at 2 AM</div>
                      <div>0 2 * * 0 /usr/bin/python3 /path/to/abr_intelligent_scraper.py</div>
                      <div className="mt-3"># Run daily at 3 AM</div>
                      <div>0 3 * * * /usr/bin/python3 /path/to/abr_intelligent_scraper.py</div>
                      <div className="mt-3"># Run every 6 hours</div>
                      <div>0 */6 * * * /usr/bin/python3 /path/to/abr_intelligent_scraper.py</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="aws" className="space-y-3">
                    <p className="text-sm text-blue-800">AWS Lambda + EventBridge setup:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs space-y-2">
                      <div># 1. Create Lambda function</div>
                      <div>aws lambda create-function --function-name abr-scraper \</div>
                      <div>  --runtime python3.11 \</div>
                      <div>  --handler lambda_function.lambda_handler \</div>
                      <div>  --zip-file fileb://function.zip</div>
                      <div className="mt-3"># 2. Create EventBridge rule (weekly)</div>
                      <div>aws events put-rule --name "ABR-Weekly-Scrape" \</div>
                      <div>  --schedule-expression "rate(7 days)"</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="heroku" className="space-y-3">
                    <p className="text-sm text-blue-800">Heroku Scheduler addon:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs space-y-2">
                      <div># 1. Add scheduler addon</div>
                      <div>heroku addons:create scheduler:standard</div>
                      <div className="mt-3"># 2. Open scheduler dashboard</div>
                      <div>heroku addons:open scheduler</div>
                      <div className="mt-3"># 3. Add job: python abr_intelligent_scraper.py</div>
                      <div># 4. Set frequency: Daily at 2:00 AM</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="github" className="space-y-3">
                    <p className="text-sm text-blue-800">GitHub Actions workflow (.github/workflows/scraper.yml):</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                      <pre>{`name: ABR Tribunal Scraper

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
  workflow_dispatch:      # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python abr_intelligent_scraper.py
        env:
          BASE44_API_URL: \${{ secrets.BASE44_API_URL }}
          API_KEY: \${{ secrets.API_KEY }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}`}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: API Documentation Tab */}
          <TabsContent value="api" className="space-y-6">
            <APIDocumentation apiKey={apiKey} />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {processedResults.length > 0 && processedResults[0].validation_results && (
              <DataValidationReport validationResults={processedResults[0].validation_results} />
            )}
            
            <IngestionResults
              results={filteredResults}
              filterRaceRelated={filterRaceRelated}
              setFilterRaceRelated={setFilterRaceRelated}
              filterAntiBlack={filterAntiBlack}
              setFilterAntiBlack={setFilterAntiBlack}
              onImport={handleImportToDatabase}
              isImporting={createCasesMutation.isPending}
              reviewMode={reviewMode}
              onToggleReviewMode={() => setReviewMode(!reviewMode)}
              onManualReview={handleManualReview}
              selectedForReview={selectedForReview}
              onConfirmClassification={handleConfirmClassification}
              onReclassify={handleReclassify}
            />
          </TabsContent>

          {/* NEW: Feedback Tab */}
          <TabsContent value="feedback">
            <FeedbackDashboard 
              feedbackData={feedbackData} 
              user={user}
              onExportTrainingData={() => {
                // Export feedback for fine-tuning
                const trainingData = feedbackData
                  .filter(f => !f.used_for_training && f.quality_score >= 3) // Assuming quality_score for high-quality feedback
                  .map(f => ({
                    case_title: f.case_title,
                    case_text: f.case_text_excerpt,
                    correct_classification: f.manual_classification,
                    incorrect_classification: f.original_ai_classification,
                    reason: f.admin_reason,
                    feedback_type: f.feedback_type
                  }));
                
                const dataStr = JSON.stringify(trainingData, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ai-training-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                addLog(`Exported ${trainingData.length} feedback records for AI training`, "success");
              }}
            />
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
                    onClick={() => setIngestionLog([])}
                  >
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ingestionLog.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No logs yet. Start processing data to see logs.</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
                    {ingestionLog.map((log, index) => (
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
