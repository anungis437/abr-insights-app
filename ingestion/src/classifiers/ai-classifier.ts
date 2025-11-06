/**
 * AI-Powered Classifier
 * 
 * Uses Azure OpenAI GPT-4o for intelligent case classification.
 * Provides detailed analysis, reasoning, and structured output.
 * 
 * Features:
 * - Anti-Black racism detection with reasoning
 * - Discrimination ground identification
 * - Key issue extraction
 * - Remedy identification
 * - Sentiment analysis
 * - Confidence scoring
 */

import OpenAI from 'openai';
import type {
  AIClassification,
  DecisionContent,
  DiscriminationGround,
} from '../types';
import { ENV, CLASSIFIER_CONFIG } from '../config';
import { createError, getErrorMessage, truncateText } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Structured response format from GPT-4o
 */
interface GPTClassificationResponse {
  category: 'anti_black_racism' | 'other_discrimination' | 'non_discrimination';
  confidence: number;
  reasoning: string;
  keyPhrases: string[];
  groundsDetected: DiscriminationGround[];
  keyIssues: string[];
  remedies: string[];
  sentiment?: 'favorable' | 'unfavorable' | 'mixed' | 'neutral';
  legislationCited?: string[];
}

// ============================================================================
// CLASSIFIER CLASS
// ============================================================================

export class AIClassifier {
  private client: OpenAI | null = null;
  private readonly deploymentName: string;
  private readonly enabled: boolean;

  constructor() {
    this.deploymentName = ENV.AZURE_OPENAI_DEPLOYMENT;
    
    // Check if AI classification is enabled
    this.enabled = Boolean(ENV.AZURE_OPENAI_ENDPOINT && ENV.AZURE_OPENAI_API_KEY);
    
    if (this.enabled) {
      try {
        // Configure OpenAI SDK for Azure
        this.client = new OpenAI({
          apiKey: ENV.AZURE_OPENAI_API_KEY,
          baseURL: `${ENV.AZURE_OPENAI_ENDPOINT}/openai/deployments/${this.deploymentName}`,
          defaultQuery: { 'api-version': ENV.AZURE_OPENAI_API_VERSION },
          defaultHeaders: { 'api-key': ENV.AZURE_OPENAI_API_KEY },
        });
      } catch (error) {
        console.warn('⚠️  Failed to initialize Azure OpenAI client:', getErrorMessage(error));
        this.enabled = false;
      }
    } else {
      console.warn('⚠️  AI classification disabled: Missing Azure OpenAI credentials');
    }
  }

  /**
   * Checks if AI classification is available
   */
  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Classifies a decision using AI
   */
  async classify(content: DecisionContent): Promise<AIClassification> {
    if (!this.isEnabled()) {
      throw createError(
        'AI classification not available - missing Azure OpenAI credentials',
        'AI_DISABLED'
      );
    }

    try {
      // Prepare text (truncate if too long to fit in context window)
      const text = this.prepareText(content);
      
      // Build prompt
      const prompt = this.buildPrompt(content, text);
      
      // Call Azure OpenAI
      const response = await this.callGPT(prompt);
      
      // Parse and validate response
      const classification = this.parseResponse(response);
      
      return classification;
    } catch (error) {
      throw createError(
        `AI classification failed: ${getErrorMessage(error)}`,
        'AI_ERROR',
        { url: content.url }
      );
    }
  }

  /**
   * Batch classify multiple decisions
   */
  async classifyBatch(
    contents: DecisionContent[],
    onProgress?: (current: number, total: number) => void
  ): Promise<Array<AIClassification | Error>> {
    if (!this.isEnabled()) {
      throw createError('AI classification not available', 'AI_DISABLED');
    }

    const results: Array<AIClassification | Error> = [];

    for (let i = 0; i < contents.length; i++) {
      try {
        const classification = await this.classify(contents[i]);
        results.push(classification);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.push(err);
      }

      if (onProgress) {
        onProgress(i + 1, contents.length);
      }

      // Brief delay between API calls to avoid rate limiting
      if (i < contents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // ==========================================================================
  // PRIVATE METHODS - TEXT PREPARATION
  // ==========================================================================

  /**
   * Prepares decision text for AI analysis
   */
  private prepareText(content: DecisionContent): string {
    let text = content.fullText;
    
    // GPT-4 context window is ~8K tokens, roughly 32K characters
    // Use first 20K chars + last 5K chars for long decisions
    const maxLength = 25000;
    
    if (text.length > maxLength) {
      const firstPart = text.slice(0, 20000);
      const lastPart = text.slice(-5000);
      text = firstPart + '\n\n[...middle section omitted...]\n\n' + lastPart;
    }
    
    return text;
  }

  // ==========================================================================
  // PRIVATE METHODS - PROMPT ENGINEERING
  // ==========================================================================

  /**
   * Builds classification prompt for GPT-4o
   */
  private buildPrompt(content: DecisionContent, text: string): string {
    const metadata = this.formatMetadata(content);
    
    return `${CLASSIFIER_CONFIG.ai.systemPrompt}

## Task

Analyze the following Canadian tribunal decision and provide a structured classification.

${metadata}

## Decision Text

${text}

## Instructions

Provide your analysis in the following JSON format:

\`\`\`json
{
  "category": "anti_black_racism" | "other_discrimination" | "non_discrimination",
  "confidence": 0.0-1.0,
  "reasoning": "Detailed explanation of your classification",
  "keyPhrases": ["phrase1", "phrase2", ...],
  "groundsDetected": ["race", "colour", ...],
  "keyIssues": ["issue1", "issue2", ...],
  "remedies": ["remedy1", "remedy2", ...],
  "sentiment": "favorable" | "unfavorable" | "mixed" | "neutral",
  "legislationCited": ["statute1", "statute2", ...]
}
\`\`\`

### Classification Guidelines

**anti_black_racism**: Case specifically involves discrimination against Black/African/Caribbean individuals based on race, colour, or ancestry.

**other_discrimination**: Case involves discrimination on protected grounds (disability, sex, age, etc.) but not specifically anti-Black racism.

**non_discrimination**: Case does not involve discrimination or human rights issues.

### Confidence Scoring

- **0.9-1.0**: Explicit evidence of anti-Black racism with clear discriminatory acts
- **0.7-0.9**: Strong indicators of anti-Black racism, some ambiguity
- **0.5-0.7**: Moderate evidence, may require human review
- **0.3-0.5**: Weak evidence, likely not anti-Black racism
- **0.0-0.3**: Clearly not anti-Black racism

### Key Considerations

1. Look for explicit mentions of race, colour, ancestry, or place of origin
2. Identify Black/African/Caribbean/Afro-Canadian references
3. Assess discriminatory conduct (profiling, harassment, differential treatment)
4. Consider intersectionality (multiple grounds)
5. Review decision outcome and remedies awarded

Respond ONLY with valid JSON. Do not include explanatory text outside the JSON structure.`;
  }

  /**
   * Formats decision metadata for prompt
   */
  private formatMetadata(content: DecisionContent): string {
    const parts: string[] = [];
    
    if (content.caseTitle) {
      parts.push(`**Case Title**: ${content.caseTitle}`);
    }
    
    if (content.caseNumber) {
      parts.push(`**Case Number**: ${content.caseNumber}`);
    }
    
    if (content.tribunal) {
      parts.push(`**Tribunal**: ${content.tribunal}`);
    }
    
    if (content.decisionDate) {
      parts.push(`**Decision Date**: ${content.decisionDate.toISOString().split('T')[0]}`);
    }
    
    if (content.applicant && content.respondent) {
      parts.push(`**Parties**: ${content.applicant} v. ${content.respondent}`);
    }
    
    return parts.length > 0 ? `## Metadata\n\n${parts.join('\n')}\n` : '';
  }

  // ==========================================================================
  // PRIVATE METHODS - GPT INTERACTION
  // ==========================================================================

  /**
   * Calls Azure OpenAI GPT-4o
   */
  private async callGPT(prompt: string): Promise<string> {
    if (!this.client) {
      throw createError('OpenAI client not initialized', 'CLIENT_ERROR');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: '', // Model is specified in baseURL for Azure
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: CLASSIFIER_CONFIG.ai.temperature,
        max_tokens: CLASSIFIER_CONFIG.ai.maxTokens,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const choice = response.choices[0];
      
      if (!choice || !choice.message) {
        throw createError('Empty response from GPT-4o', 'EMPTY_RESPONSE');
      }

      return choice.message.content || '';
    } catch (error) {
      // Handle Azure OpenAI specific errors
      const message = getErrorMessage(error);
      
      if (message.includes('429')) {
        throw createError('Rate limit exceeded', 'RATE_LIMIT', { retryable: true });
      }
      
      if (message.includes('401') || message.includes('403')) {
        throw createError('Authentication failed', 'AUTH_ERROR');
      }
      
      if (message.includes('timeout')) {
        throw createError('Request timeout', 'TIMEOUT', { retryable: true });
      }
      
      throw error;
    }
  }

  // ==========================================================================
  // PRIVATE METHODS - RESPONSE PARSING
  // ==========================================================================

  /**
   * Parses and validates GPT response
   */
  private parseResponse(responseText: string): AIClassification {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();
      
      // Remove markdown code fences if present
      jsonText = jsonText.replace(/^```json\s*/i, '');
      jsonText = jsonText.replace(/\s*```\s*$/i, '');
      jsonText = jsonText.trim();
      
      // Parse JSON
      const parsed: GPTClassificationResponse = JSON.parse(jsonText);
      
      // Validate and normalize
      return this.validateAndNormalize(parsed);
    } catch (error) {
      throw createError(
        `Failed to parse GPT response: ${getErrorMessage(error)}`,
        'PARSE_ERROR',
        { responseText: truncateText(responseText, 500) }
      );
    }
  }

  /**
   * Validates and normalizes parsed response
   */
  private validateAndNormalize(parsed: GPTClassificationResponse): AIClassification {
    // Validate required fields
    if (!parsed.category) {
      throw createError('Missing category in GPT response', 'VALIDATION_ERROR');
    }
    
    if (typeof parsed.confidence !== 'number') {
      throw createError('Missing or invalid confidence score', 'VALIDATION_ERROR');
    }
    
    // Normalize confidence to 0-1 range
    let confidence = parsed.confidence;
    if (confidence > 1) {
      confidence = confidence / 100; // Convert percentage to decimal
    }
    confidence = Math.max(0, Math.min(1, confidence));
    
    // Ensure arrays
    const keyPhrases = Array.isArray(parsed.keyPhrases) ? parsed.keyPhrases : [];
    const groundsDetected = Array.isArray(parsed.groundsDetected) ? parsed.groundsDetected : [];
    const keyIssues = Array.isArray(parsed.keyIssues) ? parsed.keyIssues : [];
    const remedies = Array.isArray(parsed.remedies) ? parsed.remedies : [];
    const legislationCited = Array.isArray(parsed.legislationCited) ? parsed.legislationCited : [];
    
    return {
      category: parsed.category,
      confidence,
      reasoning: parsed.reasoning || 'No reasoning provided',
      keyPhrases,
      groundsDetected,
      keyIssues,
      remedies,
      sentiment: parsed.sentiment,
      legislationCited: legislationCited.length > 0 ? legislationCited : undefined,
    };
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Creates an AI classifier instance
 */
export function createAIClassifier(): AIClassifier {
  return new AIClassifier();
}

/**
 * Quick AI classification helper
 */
export async function classifyWithAI(content: DecisionContent): Promise<AIClassification> {
  const classifier = new AIClassifier();
  return classifier.classify(content);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AIClassifier;
