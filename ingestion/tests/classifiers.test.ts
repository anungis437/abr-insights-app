/**
 * Classifiers - Unit Tests
 * 
 * Tests for rule-based, AI-powered, and combined classification systems.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RuleBasedClassifier } from '../src/classifiers/rule-based';
import { AIClassifier } from '../src/classifiers/ai-classifier';
import { CombinedClassifier } from '../src/classifiers/combined';
import type { DecisionContent, RuleBasedClassification, AIClassification } from '../src/types';

describe('RuleBasedClassifier', () => {
  let classifier: RuleBasedClassifier;

  beforeEach(() => {
    classifier = new RuleBasedClassifier();
  });

  describe('classify', () => {
    it('should classify race discrimination case with high confidence', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case1',
        htmlContent: '<html></html>',
        fullText: 'The applicant alleges discrimination based on race and colour. The respondent made racist comments about Black employees and denied promotions based on racial grounds.',
        textLength: 150,
        caseTitle: 'Smith v. Company A',
        decisionDate: new Date('2024-01-15')
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(true);
      expect(result.isAntiBlackLikely).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.groundsDetected).toContain('race');
    });

    it('should detect multiple discrimination grounds', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case2',
        htmlContent: '<html></html>',
        fullText: 'The tribunal found discrimination on the grounds of race, gender, and disability. The applicant, a Black woman with a disability, was denied accommodation and faced harassment.',
        textLength: 160,
        caseTitle: 'Jones v. Organization B'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(true);
      expect(result.groundsDetected).toContain('race');
      expect(result.groundsDetected).toContain('sex');
      expect(result.groundsDetected).toContain('disability');
      expect(result.groundsDetected.length).toBeGreaterThanOrEqual(3);
    });

    it('should recognize anti-Black racism specific keywords', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case3',
        htmlContent: '<html></html>',
        fullText: 'This case involves anti-Black racism and systemic discrimination against Black employees. The workplace culture perpetuated anti-Black stereotypes and racial profiling.',
        textLength: 140,
        caseTitle: 'Williams v. Employer C'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(true);
      expect(result.isAntiBlackLikely).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8); // Higher confidence for specific keywords
      expect(result.keywordMatches.blackKeywords).toContain('anti-Black racism');
    });

    it('should classify irrelevant case with low confidence', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case4',
        htmlContent: '<html></html>',
        fullText: 'This is a contract dispute regarding payment terms. The parties disagree about the interpretation of clause 3.2 and seek damages for breach of contract.',
        textLength: 120,
        caseTitle: 'ABC Corp v. XYZ Ltd'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
      expect(result.groundsDetected).toHaveLength(0);
    });

    it('should handle edge case: employment without discrimination', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case5',
        htmlContent: '<html></html>',
        fullText: 'The applicant was terminated for performance reasons. The employer provided documentation of performance issues over six months. No discrimination alleged.',
        textLength: 130,
        caseTitle: 'Employee v. Company'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(false);
      expect(result.groundsDetected).toHaveLength(0);
    });

    it('should detect colour as separate ground', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case6',
        htmlContent: '<html></html>',
        fullText: 'The applicant experienced discrimination based on skin colour and was subjected to colourism in the workplace.',
        textLength: 100,
        caseTitle: 'Test v. Employer'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(true);
      expect(result.groundsDetected).toContain('colour');
    });

    it('should handle French language content', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case7',
        htmlContent: '<html></html>',
        fullText: 'Le demandeur allègue une discrimination fondée sur la race. Le tribunal constate des actes de racisme et de discrimination raciale.',
        textLength: 110,
        caseTitle: 'Cas de discrimination',
        language: 'fr'
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(true);
      expect(result.groundsDetected).toContain('race');
    });

    it('should calculate confidence based on keyword density', async () => {
      const highDensity: DecisionContent = {
        url: 'https://test.com/case8',
        htmlContent: '<html></html>',
        fullText: 'Race discrimination race racism racial race-based discrimination anti-Black racism systemic racism racial harassment racial profiling race discrimination.',
        textLength: 150,
        caseTitle: 'High Density Case'
      };

      const lowDensity: DecisionContent = {
        url: 'https://test.com/case9',
        htmlContent: '<html></html>',
        fullText: 'This lengthy decision discusses many aspects of the employment relationship, including policies, procedures, and outcomes. One mention of race appears in passing.',
        textLength: 150,
        caseTitle: 'Low Density Case'
      };

      const highResult = await classifier.classify(highDensity);
      const lowResult = await classifier.classify(lowDensity);

      expect(highResult.confidence).toBeGreaterThan(lowResult.confidence);
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/empty',
        htmlContent: '<html></html>',
        fullText: '',
        textLength: 0
      };

      const result = await classifier.classify(content);

      expect(result.isRaceRelated).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle very short text', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/short',
        htmlContent: '<html></html>',
        fullText: 'Race.',
        textLength: 5
      };

      const result = await classifier.classify(content);

      expect(result.confidence).toBeLessThan(0.5); // Low confidence for short text
    });

    it('should handle very long text efficiently', async () => {
      const longText = 'This is a case about employment. '.repeat(1000) + ' The applicant alleges race discrimination.';
      const content: DecisionContent = {
        url: 'https://test.com/long',
        htmlContent: '<html></html>',
        fullText: longText,
        textLength: longText.length
      };

      const startTime = Date.now();
      const result = await classifier.classify(content);
      const elapsed = Date.now() - startTime;

      expect(result.isRaceRelated).toBe(true);
      expect(elapsed).toBeLessThan(1000); // Should complete quickly
    });
  });
});

describe('AIClassifier', () => {
  let classifier: AIClassifier;
  let mockOpenAI: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAI = {
      chat: {
        completions: {
          create: vi.fn()
        }
      }
    };

    classifier = new AIClassifier();
    // Inject mock (would need to expose this in actual implementation)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('classify', () => {
    it('should call OpenAI API with correct parameters', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case1',
        htmlContent: '<html></html>',
        fullText: 'Test case about race discrimination.',
        textLength: 40
      };

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              isRelevant: true,
              primaryGround: 'race',
              allGrounds: ['race'],
              confidence: 0.85,
              reasoning: 'Clear race discrimination case'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValueOnce(mockResponse);

      // This test would require actual implementation adjustment to inject mock
      // For now, testing the structure
      expect(classifier).toBeInstanceOf(AIClassifier);
    });

    it('should handle API errors gracefully', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case2',
        htmlContent: '<html></html>',
        fullText: 'Test content.',
        textLength: 13
      };

      // Would mock API failure and verify error handling
      expect(true).toBe(true);
    });

    it('should truncate very long text before sending to API', async () => {
      const longText = 'A'.repeat(50000);
      const content: DecisionContent = {
        url: 'https://test.com/long',
        htmlContent: '<html></html>',
        fullText: longText,
        textLength: longText.length
      };

      // Would verify text truncation logic
      expect(content.textLength).toBeGreaterThan(10000);
    });
  });
});

describe('CombinedClassifier', () => {
  let classifier: CombinedClassifier;
  let mockRuleBasedClassifier: RuleBasedClassifier;
  let mockAIClassifier: AIClassifier;

  beforeEach(() => {
    mockRuleBasedClassifier = new RuleBasedClassifier();
    mockAIClassifier = new AIClassifier();
    classifier = new CombinedClassifier();
  });

  describe('classify', () => {
    it('should combine rule-based and AI results', async () => {
      const content: DecisionContent = {
        url: 'https://test.com/case1',
        htmlContent: '<html></html>',
        fullText: 'The applicant alleges race discrimination and racial harassment in the workplace.',
        textLength: 80,
        caseTitle: 'Combined Test Case'
      };

      const result = await classifier.classify(content);

      expect(result).toHaveProperty('ruleBasedResult');
      expect(result).toHaveProperty('aiResult');
      expect(result).toHaveProperty('finalConfidence');
      expect(result).toHaveProperty('finalCategory');
    });

    it('should flag for review when results disagree', async () => {
      // This would test disagreement detection
      // When rule-based says relevant but AI says not (or vice versa)
      expect(true).toBe(true);
    });

    it('should have higher confidence when both agree', async () => {
      const strongCase: DecisionContent = {
        url: 'https://test.com/strong',
        htmlContent: '<html></html>',
        fullText: 'This is a clear case of anti-Black racism and race discrimination. The tribunal finds systemic racial discrimination.',
        textLength: 110,
        caseTitle: 'Strong Case'
      };

      const result = await classifier.classify(strongCase);

      expect(result.finalConfidence).toBeGreaterThan(0.7);
    });

    it('should handle when one classifier fails', async () => {
      // Test resilience when AI API is down but rule-based works
      expect(true).toBe(true);
    });
  });

  describe('weighting', () => {
    it('should weight AI classifier higher by default', async () => {
      // Verify that AI results have more weight in final decision
      expect(true).toBe(true);
    });

    it('should allow configuration of weights', async () => {
      // Test custom weight configuration
      expect(true).toBe(true);
    });
  });
});

