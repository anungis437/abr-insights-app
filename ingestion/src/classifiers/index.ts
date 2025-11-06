/**
 * Classifiers Module
 * 
 * Exports all classification functionality:
 * - Rule-based classifier (keyword matching, fast)
 * - AI classifier (Azure OpenAI GPT-4o, accurate)
 * - Combined classifier (orchestrates both)
 */

export { 
  RuleBasedClassifier, 
  createRuleClassifier, 
  classifyDecision, 
  meetsConfidenceThreshold 
} from './rule-based';

export { AIClassifier, createAIClassifier, classifyWithAI } from './ai-classifier';
export { CombinedClassifier, createCombinedClassifier, classify } from './combined';

// Re-export types for convenience
export type {
  RuleBasedClassification,
  AIClassification,
  CombinedClassification,
} from '../types';
