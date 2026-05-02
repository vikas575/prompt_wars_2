// src/hooks/useQuiz.ts
/**
 * @fileoverview Custom hook managing the full quiz state machine.
 * Transitions: idle → active → feedback → active → ... → complete
 * Handles scoring, answer tracking, and Firestore session persistence.
 */
import { useReducer, useCallback, useMemo } from 'react';
import type { QuizQuestion, QuizAnswer, QuizPhase, QuizSession, Country } from '@/types';
import { saveQuizSession } from '@/services/firebase';
import { useAppStore } from '@/store/appStore';

// ─── State & Actions ────────────────────────────────────────────────────────

interface QuizReducerState {
  phase: QuizPhase;
  currentIndex: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  selectedOptionId: string | null;
  startedAt: number;
  questionStartedAt: number;
}

type QuizAction =
  | { type: 'START'; questions: QuizQuestion[] }
  | { type: 'SELECT_OPTION'; optionId: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };

function createInitialState(): QuizReducerState {
  return {
    phase: 'idle',
    currentIndex: 0,
    questions: [],
    answers: [],
    selectedOptionId: null,
    startedAt: 0,
    questionStartedAt: 0,
  };
}

function quizReducer(state: QuizReducerState, action: QuizAction): QuizReducerState {
  switch (action.type) {
    case 'START':
      return {
        ...createInitialState(),
        phase: 'active',
        questions: action.questions,
        startedAt: Date.now(),
        questionStartedAt: Date.now(),
      };

    case 'SELECT_OPTION':
      if (state.phase !== 'active') return state;
      return { ...state, selectedOptionId: action.optionId };

    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'active' || !state.selectedOptionId) return state;
      const currentQ = state.questions[state.currentIndex];
      const answer: QuizAnswer = {
        questionId: currentQ.id,
        selectedOptionId: state.selectedOptionId,
        isCorrect: state.selectedOptionId === currentQ.correctOptionId,
        timeTakenMs: Date.now() - state.questionStartedAt,
      };
      return {
        ...state,
        phase: 'feedback',
        answers: [...state.answers, answer],
      };
    }

    case 'NEXT_QUESTION': {
      if (state.phase !== 'feedback') return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: 'complete' };
      }
      return {
        ...state,
        phase: 'active',
        currentIndex: nextIndex,
        selectedOptionId: null,
        questionStartedAt: Date.now(),
      };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

// ─── Score Calculator ────────────────────────────────────────────────────────

/**
 * Calculates the percentage score from an array of quiz answers.
 * @param answers - Array of answered questions
 * @returns Score as integer 0–100
 */
export function calculateScore(answers: QuizAnswer[]): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.isCorrect).length;
  return Math.round((correct / answers.length) * 100);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseQuizReturn {
  phase: QuizPhase;
  currentIndex: number;
  currentQuestion: QuizQuestion | null;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  selectedOptionId: string | null;
  score: number;
  startQuiz: (questions: QuizQuestion[]) => void;
  selectOption: (optionId: string) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

/**
 * Manages quiz state machine including answer tracking, scoring, and session persistence.
 *
 * @returns Quiz control actions and current state
 */
export function useQuiz(): UseQuizReturn {
  const [state, dispatch] = useReducer(quizReducer, createInitialState());
  const { user, selectedCountry } = useAppStore((s) => ({
    user: s.user,
    selectedCountry: s.selectedCountry,
  }));

  const score = useMemo(() => calculateScore(state.answers), [state.answers]);

  const currentQuestion = useMemo(
    () => state.questions[state.currentIndex] ?? null,
    [state.questions, state.currentIndex],
  );

  const startQuiz = useCallback((questions: QuizQuestion[]) => {
    dispatch({ type: 'START', questions });
  }, []);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: 'SELECT_OPTION', optionId });
  }, []);

  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Persist completed session to Firestore when phase becomes 'complete'
  const persistSession = useCallback(
    async (answers: QuizAnswer[], finalScore: number, country: Country) => {
      await saveQuizSession({
        uid: user?.uid ?? 'anonymous',
        country,
        score: finalScore,
        totalQuestions: state.questions.length,
        correctAnswers: answers.filter((a) => a.isCorrect).length,
        completedAt: Date.now(),
        answers,
      });
    },
    [user, state.questions.length],
  );

  // Trigger persistence when quiz completes
  if (state.phase === 'complete' && state.answers.length > 0) {
    void persistSession(state.answers, score, selectedCountry);
  }

  return {
    phase: state.phase,
    currentIndex: state.currentIndex,
    currentQuestion,
    questions: state.questions,
    answers: state.answers,
    selectedOptionId: state.selectedOptionId,
    score,
    startQuiz,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  };
}
