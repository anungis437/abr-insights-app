/**
 * Combined Classifier
 *
 * Orchestrates both rule-based and AI classification to produce
 * a final, high-confidence classification result.
 *
 * Strategy:
 * - Rule-based classifier runs first (fast, no API cost)
 * - If confidence < threshold, run AI classifier
 * - Combine results with weighted scores
 * - Provide comprehensive reasoning
 */

import type { CombinedClassification, DecisionContent, AIClassification } from '../types'
import { CLASSIFIER_CONFIG } from '../config'
import { RuleBasedClassifier } from './rule-based'
import { AIClassifier } from './ai-classifier'
import { getErrorMessage } from '../utils'

// ============================================================================
// CLASSIFIER CLASS
// ============================================================================

export class CombinedClassifier {
  private ruleBasedClassifier: RuleBasedClassifier
  private aiClassifier: AIClassifier

  constructor() {
    this.ruleBasedClassifier = new RuleBasedClassifier()
    this.aiClassifier = new AIClassifier()
  }

  /**
   * Classifies a decision using combined approach
   */
  async classify(content: DecisionContent): Promise<CombinedClassification> {
    // Step 1: Run rule-based classifier (always)
    const ruleBasedResult = this.ruleBasedClassifier.classify(content)

    // Step 2: Determine if AI classification is needed
    // High confidence rule-based result may skip AI for efficiency
    const needsAI = ruleBasedResult.confidence < 0.8

    let aiResult: AIClassification | undefined = undefined
    let finalCategory: AIClassification['category']
    let finalConfidence: number
    let needsReview = false

    if (needsAI && this.aiClassifier.isEnabled()) {
      try {
        // Step 3: Run AI classifier
        aiResult = await this.aiClassifier.classify(content)

        // Step 4: Combine results
        const weights = CLASSIFIER_CONFIG.weights
        finalConfidence =
          ruleBasedResult.confidence * weights.ruleBased +
          aiResult.confidence * weights.aiClassifier

        finalCategory = aiResult.category

        // Check if review needed (low confidence or disagreement)
        const disagreement =
          (ruleBasedResult.isAntiBlackLikely && aiResult.category !== 'anti_black_racism') ||
          (!ruleBasedResult.isAntiBlackLikely && aiResult.category === 'anti_black_racism')

        needsReview = finalConfidence < 0.7 || disagreement
      } catch (error) {
        // AI classification failed - fall back to rule-based only
        console.warn('⚠️  AI classification failed, using rule-based only:', getErrorMessage(error))
        finalCategory = ruleBasedResult.isAntiBlackLikely
          ? 'anti_black_racism'
          : 'non_discrimination'
        finalConfidence = ruleBasedResult.confidence
        needsReview = true // Flag for review when AI fails
      }
    } else {
      // Step 5: Use rule-based only
      finalCategory = ruleBasedResult.isAntiBlackLikely ? 'anti_black_racism' : 'non_discrimination'
      finalConfidence = ruleBasedResult.confidence
      needsReview = finalConfidence < 0.7
    }

    return {
      ruleBasedResult,
      aiResult: aiResult!,
      finalConfidence,
      finalCategory,
      needsReview,
    }
  }

  /**
   * Batch classify multiple decisions
   */
  async classifyBatch(
    contents: DecisionContent[],
    onProgress?: (current: number, total: number) => void
  ): Promise<Array<CombinedClassification | Error>> {
    const results: Array<CombinedClassification | Error> = []

    for (let i = 0; i < contents.length; i++) {
      try {
        const classification = await this.classify(contents[i])
        results.push(classification)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        results.push(err)
      }

      if (onProgress) {
        onProgress(i + 1, contents.length)
      }
    }

    return results
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Creates a combined classifier instance
 */
export function createCombinedClassifier(): CombinedClassifier {
  return new CombinedClassifier()
}

/**
 * Quick combined classification helper
 */
export async function classify(content: DecisionContent): Promise<CombinedClassification> {
  const classifier = new CombinedClassifier()
  return classifier.classify(content)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CombinedClassifier
