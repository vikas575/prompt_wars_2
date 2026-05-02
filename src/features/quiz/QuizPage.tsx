// src/features/quiz/QuizPage.tsx
/**
 * @fileoverview QuizPage — orchestrates the full quiz experience.
 * Composes QuizQuestion, QuizFeedback, and QuizResults using the useQuiz hook.
 * Keyboard shortcut: Enter to submit/advance, R to restart.
 */
import React, { useEffect, useCallback, lazy, Suspense } from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import { useElectionData } from '@/hooks/useElectionData';
import { QuizQuestion } from './QuizQuestion';
import { QuizFeedback } from './QuizFeedback';

const QuizResults = lazy(() => import('./QuizResults'));

/**
 * Top-level quiz orchestration page.
 * Handles keyboard navigation and renders the correct phase component.
 */
export const QuizPage: React.FC = () => {
  const { data } = useElectionData();
  const {
    phase, currentIndex, currentQuestion, questions,
    answers, selectedOptionId, score,
    startQuiz, selectOption, submitAnswer, nextQuestion, resetQuiz,
  } = useQuiz();

  const handleStart = useCallback(() => {
    if (data?.quizQuestions.length) {
      startQuiz(data.quizQuestions);
    }
  }, [data, startQuiz]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (phase === 'active' && selectedOptionId) submitAnswer();
        else if (phase === 'feedback') nextQuestion();
      }
      if (e.key === 'r' || e.key === 'R') {
        if (phase === 'complete') resetQuiz();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, selectedOptionId, submitAnswer, nextQuestion, resetQuiz]);

  if (phase === 'idle') {
    return (
      <section className="quiz-page" aria-label="Election quiz">
        <div className="quiz-page__intro">
          <h1 className="quiz-page__title">Test Your Civic Knowledge</h1>
          <p className="quiz-page__description">
            Answer {data?.quizQuestions.length ?? 0} questions about the election process
            in {data?.countryName ?? 'your country'}. Earn your Civic Readiness Score!
          </p>
          <div className="quiz-page__meta">
            <span>📋 {data?.quizQuestions.length ?? 0} Questions</span>
            <span>⏱️ ~5 minutes</span>
            <span>🏆 Earn a score</span>
          </div>
          <button
            type="button"
            id="start-quiz-btn"
            className="btn btn--primary btn--lg"
            onClick={handleStart}
            disabled={!data?.quizQuestions.length}
            aria-label="Start the civic knowledge quiz"
          >
            Start Quiz →
          </button>
        </div>
      </section>
    );
  }

  if (phase === 'complete') {
    return (
      <Suspense fallback={<div className="loading">Loading results...</div>}>
        <QuizResults
          score={score}
          answers={answers}
          questions={questions}
          onRetry={resetQuiz}
        />
      </Suspense>
    );
  }

  const currentAnswer = answers[currentIndex];

  return (
    <section className="quiz-page" aria-label="Quiz in progress">
      <QuizQuestion
        question={currentQuestion!}
        selectedOptionId={selectedOptionId}
        onSelectOption={selectOption}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isSubmitted={phase === 'feedback'}
      />

      {phase === 'active' && (
        <div className="quiz-page__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={submitAnswer}
            disabled={!selectedOptionId}
            aria-label="Submit your answer"
            id="submit-answer-btn"
          >
            Submit Answer
          </button>
        </div>
      )}

      {phase === 'feedback' && currentAnswer && (
        <QuizFeedback
          question={currentQuestion!}
          answer={currentAnswer}
          onNext={nextQuestion}
          isLastQuestion={currentIndex === questions.length - 1}
        />
      )}
    </section>
  );
};

export default QuizPage;
