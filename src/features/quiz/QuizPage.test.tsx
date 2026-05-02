// src/features/quiz/QuizPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizPage } from './QuizPage';

// Mock the hooks
vi.mock('@/hooks/useElectionData', () => ({
  useElectionData: vi.fn(() => ({
    data: {
      quizQuestions: [
        {
          id: 'q1',
          question: 'What is the voting age in India?',
          options: [
            { id: 'a', text: '16' },
            { id: 'b', text: '18' },
          ],
          correctOptionId: 'b',
          explanation: 'The voting age is 18.',
          difficulty: 'easy',
          category: 'eligibility',
          country: 'IN',
        },
      ],
      countryName: 'India',
    },
    country: 'IN',
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useQuiz', () => ({
  useQuiz: vi.fn(),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector) => selector({
    user: null,
    selectedCountry: 'IN',
    selectedLanguage: 'en',
    ttsState: { isPlaying: false, isPaused: false, currentSectionId: null },
  })),
}));

import { useQuiz } from '@/hooks/useQuiz';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('QuizPage', () => {
  it('renders the quiz intro screen initially', () => {
    vi.mocked(useQuiz).mockReturnValue({
      phase: 'idle',
      currentIndex: 0,
      currentQuestion: null,
      questions: [],
      answers: [],
      selectedOptionId: null,
      score: 0,
      startQuiz: vi.fn(),
    } as any);

    render(<QuizPage />);
    expect(screen.getByText(/test your civic knowledge/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start the civic knowledge quiz/i })).toBeInTheDocument();
  });

  it('calls startQuiz when Start button is clicked', () => {
    const startQuiz = vi.fn();
    vi.mocked(useQuiz).mockReturnValue({
      phase: 'idle',
      startQuiz,
      questions: [],
      answers: [],
    } as any);

    render(<QuizPage />);
    fireEvent.click(screen.getByRole('button', { name: /start the civic knowledge quiz/i }));
    expect(startQuiz).toHaveBeenCalled();
  });

  it('renders the current question in active phase', () => {
    vi.mocked(useQuiz).mockReturnValue({
      phase: 'active',
      currentQuestion: {
        id: 'q1',
        question: 'What is the voting age?',
        options: [{ id: 'a', text: '18' }],
        difficulty: 'easy', // Added difficulty
      },
      questions: [{ id: 'q1' }],
      currentIndex: 0,
      answers: [],
      selectedOptionId: null,
      selectOption: vi.fn(),
      submitAnswer: vi.fn(),
    } as any);

    render(<QuizPage />);
    expect(screen.getByText('What is the voting age?')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders results in complete phase', async () => {
    vi.mocked(useQuiz).mockReturnValue({
      phase: 'complete',
      score: 80,
      answers: [],
      questions: [],
      resetQuiz: vi.fn(),
    } as any);

    render(<QuizPage />);
    await waitFor(() => {
      expect(screen.getByRole('main', { name: /quiz results/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/your score: 80 out of 100/i)).toBeInTheDocument();
  });
});
