/**
 * Rule-Based Classifier
 * 
 * Fast keyword-based classification for tribunal decisions.
 * First-pass filter to identify potentially relevant anti-Black racism cases.
 * 
 * Classification Logic:
 * 1. Detect race-related keywords
 * 2. Detect Black/African-specific keywords
 * 3. Detect discrimination terminology
 * 4. Calculate confidence score based on keyword density and co-occurrence
 * 5. Extract specific discrimination grounds
 */

import type { 
  RuleBasedClassification, 
  DiscriminationGround,
  DecisionContent 
} from '../types';
import { CLASSIFIER_CONFIG } from '../config';

// ============================================================================
// KEYWORD SETS
// ============================================================================

const KEYWORDS = CLASSIFIER_CONFIG.keywords;

/**
 * Additional keyword variations and patterns
 */
const EXTENDED_KEYWORDS = {
  // Race-related expanded
  raceExtended: [
    ...KEYWORDS.race,
    'racialized person',
    'person of colour',
    'person of color',
    'racial minority',
    'visible minority',
    'non-white',
  ],
  
  // Black/African expanded
  blackExtended: [
    ...KEYWORDS.black,
    'black canadian',
    'black person',
    'black individual',
    'black employee',
    'african descent',
    'of african descent',
    'african origin',
    'anti-blackness',
  ],
  
  // Discrimination expanded
  discriminationExtended: [
    ...KEYWORDS.discrimination,
    'discriminate against',
    'racial profiling',
    'racial slur',
    'racial comment',
    'racist remark',
    'racial stereotype',
    'systemic discrimination',
    'systemic racism',
    'differential treatment',
    'adverse treatment',
    'hostile environment',
  ],
  
  // Ground-specific keywords
  grounds: {
    race: ['race', 'racial', 'racism'],
    colour: ['colour', 'color', 'skin color', 'skin colour', 'complexion'],
    ancestry: ['ancestry', 'ancestral', 'lineage', 'heritage'],
    place_of_origin: ['place of origin', 'country of origin', 'national origin', 'birthplace'],
    ethnic_origin: ['ethnic', 'ethnicity', 'ethnic origin', 'ethnic background'],
  },
};

// ============================================================================
// CLASSIFIER CLASS
// ============================================================================

export class RuleBasedClassifier {
  /**
   * Classifies a decision based on keyword analysis
   */
  classify(content: DecisionContent): RuleBasedClassification {
    const text = this.prepareText(content.fullText);
    
    // Detect keyword matches
    const keywordMatches = this.detectKeywords(text);
    
    // Detect discrimination grounds
    const groundsDetected = this.detectGrounds(text);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(text, keywordMatches, groundsDetected);
    
    // Determine classification
    const isRaceRelated = keywordMatches.raceKeywords.length > 0 && 
                          keywordMatches.discriminationKeywords.length > 0;
    
    const isAntiBlackLikely = keywordMatches.blackKeywords.length > 0 && 
                              isRaceRelated;
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      keywordMatches,
      groundsDetected,
      isRaceRelated,
      isAntiBlackLikely,
      confidence
    );
    
    return {
      isRaceRelated,
      isAntiBlackLikely,
      confidence,
      groundsDetected,
      keywordMatches,
      reasoning,
    };
  }

  /**
   * Batch classify multiple decisions
   */
  classifyBatch(contents: DecisionContent[]): RuleBasedClassification[] {
    return contents.map(content => this.classify(content));
  }

  // ==========================================================================
  // PRIVATE METHODS - TEXT PREPARATION
  // ==========================================================================

  /**
   * Prepares text for analysis (lowercase, normalize)
   */
  private prepareText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // ==========================================================================
  // PRIVATE METHODS - KEYWORD DETECTION
  // ==========================================================================

  /**
   * Detects keyword matches in text
   */
  private detectKeywords(text: string): {
    raceKeywords: string[];
    blackKeywords: string[];
    discriminationKeywords: string[];
  } {
    return {
      raceKeywords: this.findMatches(text, EXTENDED_KEYWORDS.raceExtended),
      blackKeywords: this.findMatches(text, EXTENDED_KEYWORDS.blackExtended),
      discriminationKeywords: this.findMatches(text, EXTENDED_KEYWORDS.discriminationExtended),
    };
  }

  /**
   * Finds keyword matches in text
   */
  private findMatches(text: string, keywords: string[]): string[] {
    const matches: string[] = [];
    
    for (const keyword of keywords) {
      // Create word boundary regex for whole word matching
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
      const found = text.match(regex);
      
      if (found && found.length > 0) {
        matches.push(keyword);
      }
    }
    
    return matches;
  }

  /**
   * Escapes special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ==========================================================================
  // PRIVATE METHODS - GROUND DETECTION
  // ==========================================================================

  /**
   * Detects discrimination grounds mentioned in text
   */
  private detectGrounds(text: string): DiscriminationGround[] {
    const grounds: DiscriminationGround[] = [];
    
    // Check each ground's keywords
    for (const [ground, keywords] of Object.entries(EXTENDED_KEYWORDS.grounds)) {
      const matches = this.findMatches(text, keywords);
      if (matches.length > 0) {
        grounds.push(ground as DiscriminationGround);
      }
    }
    
    // Add additional ground checks with specific patterns
    
    // Citizenship
    if (/\b(citizenship|citizen|immigration status)\b/i.test(text)) {
      grounds.push('citizenship');
    }
    
    // Creed (religion)
    if (/\b(creed|religion|religious|faith)\b/i.test(text)) {
      grounds.push('creed');
    }
    
    // Sex/Gender
    if (/\b(sex|gender|woman|women|man|men)\b/i.test(text)) {
      grounds.push('sex');
    }
    
    // Disability
    if (/\b(disability|disabled|accommodation|mental health)\b/i.test(text)) {
      grounds.push('disability');
    }
    
    // Age
    if (/\b(age|ageism|elderly|senior|youth)\b/i.test(text)) {
      grounds.push('age');
    }
    
    // Deduplicate
    return Array.from(new Set(grounds));
  }

  // ==========================================================================
  // PRIVATE METHODS - CONFIDENCE CALCULATION
  // ==========================================================================

  /**
   * Calculates confidence score based on keyword density and patterns
   */
  private calculateConfidence(
    text: string,
    keywordMatches: {
      raceKeywords: string[];
      blackKeywords: string[];
      discriminationKeywords: string[];
    },
    grounds: DiscriminationGround[]
  ): number {
    let score = 0;
    const textLength = text.length;
    
    // Factor 1: Keyword presence (40 points max)
    const totalKeywords = 
      keywordMatches.raceKeywords.length +
      keywordMatches.blackKeywords.length +
      keywordMatches.discriminationKeywords.length;
    
    if (totalKeywords >= 10) score += 40;
    else if (totalKeywords >= 5) score += 30;
    else if (totalKeywords >= 3) score += 20;
    else if (totalKeywords >= 1) score += 10;
    
    // Factor 2: Black-specific keywords (30 points max)
    if (keywordMatches.blackKeywords.length >= 5) score += 30;
    else if (keywordMatches.blackKeywords.length >= 3) score += 20;
    else if (keywordMatches.blackKeywords.length >= 1) score += 10;
    
    // Factor 3: Discrimination keywords (20 points max)
    if (keywordMatches.discriminationKeywords.length >= 5) score += 20;
    else if (keywordMatches.discriminationKeywords.length >= 3) score += 15;
    else if (keywordMatches.discriminationKeywords.length >= 1) score += 10;
    
    // Factor 4: Ground detection (10 points max)
    if (grounds.includes('race') || grounds.includes('colour') || grounds.includes('ancestry')) {
      score += 10;
    } else if (grounds.length > 0) {
      score += 5;
    }
    
    // Factor 5: Keyword density (bonus, max 10 points)
    const keywordDensity = totalKeywords / (textLength / 1000); // Keywords per 1000 chars
    if (keywordDensity >= 2) score += 10;
    else if (keywordDensity >= 1) score += 5;
    else if (keywordDensity >= 0.5) score += 3;
    
    // Factor 6: Co-occurrence patterns (bonus, max 10 points)
    const hasRaceAndDiscrimination = 
      keywordMatches.raceKeywords.length > 0 && 
      keywordMatches.discriminationKeywords.length > 0;
    
    const hasBlackAndRace = 
      keywordMatches.blackKeywords.length > 0 && 
      keywordMatches.raceKeywords.length > 0;
    
    if (hasBlackAndRace && hasRaceAndDiscrimination) score += 10;
    else if (hasRaceAndDiscrimination) score += 5;
    
    // Normalize to 0-1 range (max possible score is ~110)
    const normalized = Math.min(score / 100, 1.0);
    
    // Round to 2 decimal places
    return Math.round(normalized * 100) / 100;
  }

  // ==========================================================================
  // PRIVATE METHODS - REASONING
  // ==========================================================================

  /**
   * Generates human-readable reasoning for classification
   */
  private generateReasoning(
    keywordMatches: {
      raceKeywords: string[];
      blackKeywords: string[];
      discriminationKeywords: string[];
    },
    grounds: DiscriminationGround[],
    isRaceRelated: boolean,
    isAntiBlackLikely: boolean,
    confidence: number
  ): string {
    const parts: string[] = [];
    
    // Classification result
    if (isAntiBlackLikely) {
      parts.push('Likely anti-Black racism case.');
    } else if (isRaceRelated) {
      parts.push('Race-related discrimination case.');
    } else {
      parts.push('Not identified as race-related.');
    }
    
    // Confidence level
    const confidenceLevel = 
      confidence >= 0.8 ? 'High' :
      confidence >= 0.5 ? 'Medium' :
      'Low';
    parts.push(`Confidence: ${confidenceLevel} (${confidence.toFixed(2)}).`);
    
    // Keyword summary
    const totalKeywords = 
      keywordMatches.raceKeywords.length +
      keywordMatches.blackKeywords.length +
      keywordMatches.discriminationKeywords.length;
    
    parts.push(`Found ${totalKeywords} relevant keywords:`);
    
    if (keywordMatches.raceKeywords.length > 0) {
      parts.push(`${keywordMatches.raceKeywords.length} race-related`);
    }
    
    if (keywordMatches.blackKeywords.length > 0) {
      parts.push(`${keywordMatches.blackKeywords.length} Black/African-specific`);
    }
    
    if (keywordMatches.discriminationKeywords.length > 0) {
      parts.push(`${keywordMatches.discriminationKeywords.length} discrimination-related`);
    }
    
    // Grounds detected
    if (grounds.length > 0) {
      parts.push(`Grounds detected: ${grounds.join(', ')}.`);
    }
    
    // Top keywords
    const topBlackKeywords = keywordMatches.blackKeywords.slice(0, 3);
    if (topBlackKeywords.length > 0) {
      parts.push(`Key terms: ${topBlackKeywords.join(', ')}.`);
    }
    
    return parts.join(' ');
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Creates a classifier instance
 */
export function createRuleClassifier(): RuleBasedClassifier {
  return new RuleBasedClassifier();
}

/**
 * Quick classification helper
 */
export function classifyDecision(content: DecisionContent): RuleBasedClassification {
  const classifier = new RuleBasedClassifier();
  return classifier.classify(content);
}

/**
 * Checks if confidence meets threshold for auto-approval
 */
export function meetsConfidenceThreshold(
  classification: RuleBasedClassification,
  threshold: number = CLASSIFIER_CONFIG.confidence.highThreshold
): boolean {
  return classification.confidence >= threshold;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RuleBasedClassifier;
