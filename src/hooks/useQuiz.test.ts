// src/hooks/useQuiz.test.ts
/**
 * @fileoverview Unit tests for the useQuiz hook.
 * Tests the full quiz state machine: idle → active → feedback → complete.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuiz, calculateScore } from './useQuiz';
import type { QuizQuestion } from '@/types';

vi.mock('@/services/firebase', () => ({
  saveQuizSession: vi.fn().mockResolvedValue('session-123'),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: (s: { user: null; selectedCountry: string }) => unknown) =>
    selector({ user: null, selectedCountry: 'IN' }),
  ),
}));

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the voting age in India?',
    options: [{ id: 'a', text: '16' }, { id: 'b', text: '18' }, { id: 'c', text: '21' }, { id: 'd', text: '25' }],
    correctOptionId: 'b',
    explanation: 'The voting age is 18.',
    difficulty: 'easy',
    category: 'eligibility',
    country: 'IN',
  },
  {
    id: 'q2',
    question: 'Which body conducts elections in India?',
    options: [{ id: 'a', text: 'Supreme Court' }, { id: 'b', text: 'Election Commission' }, { id: 'c', text: 'Parliament' }, { id: 'd', text: 'President' }],
    correctOptionId: 'b',
    explanation: 'Election Commission of India.',
    difficulty: 'easy',
    category: 'process',
    country: 'IN',
  },
];

describe('calculateScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateScore([])).toBe(0);
  });

  it('returns 100 for all correct answers', () => {
    const answers = [
      { questionId: 'q1', selectedOptionId: 'b', isCorrect: true, timeTakenMs: 1000 },
      { questionId: 'q2', selectedOptionId: 'b', isCorrect: true, timeTakenMs: 1200 },
    ];
    expect(calculateScore(answers)).toBe(100);
  });

  it('returns 50 for half correct answers', () => {
    const answers = [
      { questionId: 'q1', selectedOptionId: 'b', isCorrect: true, timeTakenMs: 1000 },
      { questionId: 'q2', selectedOptionId: 'a', isCorrect: false, timeTakenMs: 800 },
    ];
    expect(calculateScore(answers)).toBe(50);
  });

  it('returns 0 for all incorrect answers', () => {
    const answers = [
      { questionId: 'q1', selectedOptionId: 'a', isCorrect: false, timeTakenMs: 500 },
    ];
    expect(calculateScore(answers)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    const answers = [
      { questionId: 'q1', selectedOptionId: 'b', isCorrect: true, timeTakenMs: 500 },
      { questionId: 'q2', selectedOptionId: 'b', isCorrect: true, timeTakenMs: 500 },
      { questionId: 'q3', selectedOptionId: 'a', isCorrect: false, timeTakenMs: 500 },
    ];
    expect(calculateScore(answers)).toBe(67); // 2/3 = 66.67 → 67
  });
});

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle phase', () => {
    const { result } = renderHook(() => useQuiz());
    expect(result.current.phase).toBe('idle');
    expect(result.current.currentQuestion).toBeNull();
  });

  it('transitions to active phase on startQuiz', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    expect(result.current.phase).toBe('active');
    expect(result.current.currentQuestion?.id).toBe('q1');
  });

  it('selects an option', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.selectOption('b'));
    expect(result.current.selectedOptionId).toBe('b');
  });

  it('submits answer and moves to feedback phase', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.selectOption('b'));
    act(() => result.current.submitAnswer());
    expect(result.current.phase).toBe('feedback');
    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].isCorrect).toBe(true);
  });

  it('records incorrect answer', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.selectOption('a')); // wrong answer
    act(() => result.current.submitAnswer());
    expect(result.current.answers[0].isCorrect).toBe(false);
  });

  it('advances to next question', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.selectOption('b'));
    act(() => result.current.submitAnswer());
    act(() => result.current.nextQuestion());
    expect(result.current.phase).toBe('active');
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentQuestion?.id).toBe('q2');
  });

  it('completes quiz after last question', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    // Answer Q1
    act(() => result.current.selectOption('b'));
    act(() => result.current.submitAnswer());
    act(() => result.current.nextQuestion());
    // Answer Q2
    act(() => result.current.selectOption('b'));
    act(() => result.current.submitAnswer());
    act(() => result.current.nextQuestion());
    expect(result.current.phase).toBe('complete');
    expect(result.current.score).toBe(100);
  });

  it('resets to idle on resetQuiz', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.resetQuiz());
    expect(result.current.phase).toBe('idle');
    expect(result.current.answers).toHaveLength(0);
    expect(result.current.currentIndex).toBe(0);
  });

  it('does not submit without selecting an option', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.startQuiz(mockQuestions));
    act(() => result.current.submitAnswer()); // no option selected
    expect(result.current.phase).toBe('active'); // remains active
  });
});
