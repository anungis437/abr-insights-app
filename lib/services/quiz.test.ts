/**
 * Unit tests for Quiz Service - Answer Evaluation Logic
 */

import { describe, it, expect } from 'vitest';

// Import the types
type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'true_false'
  | 'fill_blank'
  | 'drag_drop_order'
  | 'matching'
  | 'calculation'
  | 'essay'
  | 'case_study';

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

interface QuestionWithOptions {
  id: string;
  question_type: QuestionType;
  points: number;
  options: QuestionOption[];
  metadata: Record<string, any>;
}

/**
 * Evaluate answer correctness and calculate points
 * This is a copy of the evaluateAnswer function from quiz.ts for testing
 */
function evaluateAnswer(
  question: QuestionWithOptions,
  answer_data: any
): {
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
} {
  const points_possible = question.points;

  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
      const correctOption = question.options.find((opt) => opt.is_correct);
      const is_correct = answer_data.selected_option_id === correctOption?.id;
      return {
        is_correct,
        points_earned: is_correct ? points_possible : 0,
        points_possible,
      };

    case 'multiple_response':
      const correctOptions = question.options.filter((opt) => opt.is_correct).map((opt) => opt.id);
      const selectedOptions = answer_data.selected_option_ids || [];
      const correctSelections = selectedOptions.filter((id: string) => correctOptions.includes(id));
      const incorrectSelections = selectedOptions.filter(
        (id: string) => !correctOptions.includes(id)
      );

      const score =
        Math.max(0, correctSelections.length - incorrectSelections.length) / correctOptions.length;
      return {
        is_correct: score === 1,
        points_earned: score * points_possible,
        points_possible,
      };

    case 'fill_blank':
      const correctAnswer = question.options[0]?.option_text.toLowerCase().trim();
      const userAnswer = (answer_data.text_answer || '').toLowerCase().trim();
      const matches = correctAnswer === userAnswer;
      return {
        is_correct: matches,
        points_earned: matches ? points_possible : 0,
        points_possible,
      };

    case 'drag_drop_order':
      const correctOrder = question.options
        .sort((a, b) => a.order_index - b.order_index)
        .map((opt) => opt.id);
      const userOrder = answer_data.ordered_option_ids || [];
      const orderMatches = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
      return {
        is_correct: orderMatches,
        points_earned: orderMatches ? points_possible : 0,
        points_possible,
      };

    case 'matching':
      const correctPairs = question.metadata.correct_pairs || {};
      const userPairs = answer_data.pairs || {};
      let correctCount = 0;
      let totalPairs = Object.keys(correctPairs).length;

      Object.keys(correctPairs).forEach((key) => {
        if (userPairs[key] === correctPairs[key]) correctCount++;
      });

      const matchScore = correctCount / totalPairs;
      return {
        is_correct: matchScore === 1,
        points_earned: matchScore * points_possible,
        points_possible,
      };

    case 'calculation':
      const correctValue = parseFloat(question.metadata.correct_answer);
      const userValue = parseFloat(answer_data.numeric_answer);
      const tolerance = question.metadata.tolerance || 0.01;
      const isCorrect = Math.abs(correctValue - userValue) <= tolerance;
      return {
        is_correct: isCorrect,
        points_earned: isCorrect ? points_possible : 0,
        points_possible,
      };

    case 'essay':
    case 'case_study':
      return {
        is_correct: false,
        points_earned: 0,
        points_possible,
      };

    default:
      return {
        is_correct: false,
        points_earned: 0,
        points_possible,
      };
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Quiz Answer Evaluation', () => {
  describe('Multiple Choice Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q1',
      question_type: 'multiple_choice',
      points: 10,
      options: [
        { id: 'opt1', option_text: 'Paris', is_correct: true, order_index: 0 },
        { id: 'opt2', option_text: 'London', is_correct: false, order_index: 1 },
        { id: 'opt3', option_text: 'Berlin', is_correct: false, order_index: 2 },
      ],
      metadata: {},
    };

    it('should award full points for correct answer', () => {
      const result = evaluateAnswer(question, { selected_option_id: 'opt1' });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(10);
      expect(result.points_possible).toBe(10);
    });

    it('should award zero points for incorrect answer', () => {
      const result = evaluateAnswer(question, { selected_option_id: 'opt2' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
      expect(result.points_possible).toBe(10);
    });

    it('should handle missing selection', () => {
      const result = evaluateAnswer(question, { selected_option_id: null });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });
  });

  describe('True/False Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q2',
      question_type: 'true_false',
      points: 5,
      options: [
        { id: 'opt_true', option_text: 'True', is_correct: true, order_index: 0 },
        { id: 'opt_false', option_text: 'False', is_correct: false, order_index: 1 },
      ],
      metadata: {},
    };

    it('should correctly evaluate true answer', () => {
      const result = evaluateAnswer(question, { selected_option_id: 'opt_true' });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(5);
    });

    it('should correctly evaluate false answer', () => {
      const result = evaluateAnswer(question, { selected_option_id: 'opt_false' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });
  });

  describe('Multiple Response Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q3',
      question_type: 'multiple_response',
      points: 20,
      options: [
        { id: 'opt1', option_text: 'Python', is_correct: true, order_index: 0 },
        { id: 'opt2', option_text: 'JavaScript', is_correct: true, order_index: 1 },
        { id: 'opt3', option_text: 'HTML', is_correct: false, order_index: 2 },
        { id: 'opt4', option_text: 'TypeScript', is_correct: true, order_index: 3 },
      ],
      metadata: {},
    };

    it('should award full points for all correct selections', () => {
      const result = evaluateAnswer(question, {
        selected_option_ids: ['opt1', 'opt2', 'opt4'],
      });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(20);
    });

    it('should award partial credit for some correct selections', () => {
      const result = evaluateAnswer(question, {
        selected_option_ids: ['opt1', 'opt2'], // Missing opt4
      });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(20 * (2 / 3)); // 2 of 3 correct
    });

    it('should penalize incorrect selections', () => {
      const result = evaluateAnswer(question, {
        selected_option_ids: ['opt1', 'opt2', 'opt3'], // opt3 is wrong
      });
      
      // (2 correct - 1 incorrect) / 3 total = 1/3 score
      expect(result.points_earned).toBe(20 * (1 / 3));
    });

    it('should not give negative points', () => {
      const result = evaluateAnswer(question, {
        selected_option_ids: ['opt3'], // Only wrong answer
      });
      
      // (0 correct - 1 incorrect) = -1, but max(0, -1) = 0
      expect(result.points_earned).toBe(0);
    });
  });

  describe('Fill in the Blank Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q4',
      question_type: 'fill_blank',
      points: 8,
      options: [{ id: 'opt1', option_text: 'Photosynthesis', is_correct: true, order_index: 0 }],
      metadata: {},
    };

    it('should accept exact match (case-insensitive)', () => {
      const result = evaluateAnswer(question, { text_answer: 'photosynthesis' });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(8);
    });

    it('should accept answer with different casing', () => {
      const result = evaluateAnswer(question, { text_answer: 'PHOTOSYNTHESIS' });
      
      expect(result.is_correct).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = evaluateAnswer(question, { text_answer: '  photosynthesis  ' });
      
      expect(result.is_correct).toBe(true);
    });

    it('should reject incorrect spelling', () => {
      const result = evaluateAnswer(question, { text_answer: 'fotosynthesis' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });
  });

  describe('Drag and Drop Order Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q5',
      question_type: 'drag_drop_order',
      points: 15,
      options: [
        { id: 'opt1', option_text: 'First', is_correct: true, order_index: 0 },
        { id: 'opt2', option_text: 'Second', is_correct: true, order_index: 1 },
        { id: 'opt3', option_text: 'Third', is_correct: true, order_index: 2 },
      ],
      metadata: {},
    };

    it('should accept correct order', () => {
      const result = evaluateAnswer(question, {
        ordered_option_ids: ['opt1', 'opt2', 'opt3'],
      });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(15);
    });

    it('should reject incorrect order', () => {
      const result = evaluateAnswer(question, {
        ordered_option_ids: ['opt2', 'opt1', 'opt3'],
      });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });

    it('should reject partial order', () => {
      const result = evaluateAnswer(question, {
        ordered_option_ids: ['opt1', 'opt2'], // Missing opt3
      });
      
      expect(result.is_correct).toBe(false);
    });
  });

  describe('Matching Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q6',
      question_type: 'matching',
      points: 12,
      options: [],
      metadata: {
        correct_pairs: {
          term1: 'definition1',
          term2: 'definition2',
          term3: 'definition3',
        },
      },
    };

    it('should award full points for all correct matches', () => {
      const result = evaluateAnswer(question, {
        pairs: {
          term1: 'definition1',
          term2: 'definition2',
          term3: 'definition3',
        },
      });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(12);
    });

    it('should award partial credit for some correct matches', () => {
      const result = evaluateAnswer(question, {
        pairs: {
          term1: 'definition1',
          term2: 'definition2',
          term3: 'definition1', // Wrong
        },
      });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(12 * (2 / 3)); // 2 of 3 correct
    });

    it('should handle missing pairs', () => {
      const result = evaluateAnswer(question, {
        pairs: {
          term1: 'definition1',
        },
      });
      
      expect(result.points_earned).toBe(12 * (1 / 3));
    });
  });

  describe('Calculation Questions', () => {
    const question: QuestionWithOptions = {
      id: 'q7',
      question_type: 'calculation',
      points: 25,
      options: [],
      metadata: {
        correct_answer: '42.5',
        tolerance: 0.1,
      },
    };

    it('should accept exact answer', () => {
      const result = evaluateAnswer(question, { numeric_answer: '42.5' });
      
      expect(result.is_correct).toBe(true);
      expect(result.points_earned).toBe(25);
    });

    it('should accept answer within tolerance', () => {
      const result = evaluateAnswer(question, { numeric_answer: '42.55' });
      
      expect(result.is_correct).toBe(true);
    });

    it('should reject answer outside tolerance', () => {
      const result = evaluateAnswer(question, { numeric_answer: '42.7' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });

    it('should use default tolerance if not specified', () => {
      const questionNoTolerance: QuestionWithOptions = {
        ...question,
        metadata: { correct_answer: '100' },
      };
      
      const result = evaluateAnswer(questionNoTolerance, { numeric_answer: '100.005' });
      expect(result.is_correct).toBe(true); // Within 0.01 default tolerance
    });
  });

  describe('Essay and Case Study Questions', () => {
    const essayQuestion: QuestionWithOptions = {
      id: 'q8',
      question_type: 'essay',
      points: 50,
      options: [],
      metadata: {},
    };

    const caseStudyQuestion: QuestionWithOptions = {
      id: 'q9',
      question_type: 'case_study',
      points: 100,
      options: [],
      metadata: {},
    };

    it('should not auto-grade essay questions', () => {
      const result = evaluateAnswer(essayQuestion, { text_answer: 'Long essay response...' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
      expect(result.points_possible).toBe(50);
    });

    it('should not auto-grade case study questions', () => {
      const result = evaluateAnswer(caseStudyQuestion, { text_answer: 'Case analysis...' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
      expect(result.points_possible).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown question type', () => {
      const question: QuestionWithOptions = {
        id: 'q10',
        question_type: 'unknown_type' as QuestionType,
        points: 10,
        options: [],
        metadata: {},
      };
      
      const result = evaluateAnswer(question, { answer: 'anything' });
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
      expect(result.points_possible).toBe(10);
    });

    it('should handle empty answer data', () => {
      const question: QuestionWithOptions = {
        id: 'q11',
        question_type: 'multiple_choice',
        points: 10,
        options: [{ id: 'opt1', option_text: 'A', is_correct: true, order_index: 0 }],
        metadata: {},
      };
      
      const result = evaluateAnswer(question, {});
      
      expect(result.is_correct).toBe(false);
      expect(result.points_earned).toBe(0);
    });
  });
});
