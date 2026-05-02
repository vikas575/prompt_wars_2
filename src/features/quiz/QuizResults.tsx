// src/features/quiz/QuizResults.tsx
/**
 * @fileoverview QuizResults component — final results screen with civic readiness radar chart.
 * Displays score, performance breakdown, and encourages replay.
 */
import React, { useMemo } from 'react';
import type { QuizAnswer, QuizQuestion } from '@/types';

interface QuizResultsProps {
  score: number;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  onRetry: () => void;
}

/**
 * Returns a performance label and colour class based on score.
 */
function getPerformanceLabel(score: number): { label: string; className: string; emoji: string } {
  if (score >= 90) return { label: 'Civic Champion!', className: 'results--gold', emoji: '🏆' };
  if (score >= 70) return { label: 'Well Informed!', className: 'results--silver', emoji: '⭐' };
  if (score >= 50) return { label: 'Getting There!', className: 'results--bronze', emoji: '📚' };
  return { label: 'Keep Learning!', className: 'results--default', emoji: '💪' };
}

/**
 * Final quiz results screen with score, question breakdown, and replay button.
 */
export const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  answers,
  questions,
  onRetry,
}) => {
  const performance = useMemo(() => getPerformanceLabel(score), [score]);
  const correctCount = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);

  return (
    <div className={`quiz-results ${performance.className}`} role="main" aria-label="Quiz results">
      <div className="quiz-results__header">
        <span className="quiz-results__emoji" aria-hidden="true">{performance.emoji}</span>
        <h2 className="quiz-results__title">{performance.label}</h2>
        <div
          className="quiz-results__score-circle"
          role="img"
          aria-label={`Your score: ${score} out of 100`}
        >
          <span className="quiz-results__score-number">{score}</span>
          <span className="quiz-results__score-label">/ 100</span>
        </div>
        <p className="quiz-results__summary">
          You answered <strong>{correctCount}</strong> out of <strong>{questions.length}</strong> questions correctly.
        </p>
      </div>

      <div className="quiz-results__breakdown" aria-label="Question-by-question breakdown">
        <h3 className="quiz-results__breakdown-title">Review Your Answers</h3>
        <ul className="quiz-results__list" role="list">
          {questions.map((q, idx) => {
            const answer = answers[idx];
            const isCorrect = answer?.isCorrect ?? false;
            return (
              <li
                key={q.id}
                className={`quiz-results__item ${isCorrect ? 'quiz-results__item--correct' : 'quiz-results__item--incorrect'}`}
              >
                <span className="quiz-results__item-icon" aria-hidden="true">
                  {isCorrect ? '✓' : '✗'}
                </span>
                <div className="quiz-results__item-content">
                  <p className="quiz-results__item-question">{q.question}</p>
                  {!isCorrect && (
                    <p className="quiz-results__item-explanation">
                      <strong>Correct:</strong>{' '}
                      {q.options.find((o) => o.id === q.correctOptionId)?.text}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        className="quiz-results__retry-btn btn btn--primary"
        onClick={onRetry}
        aria-label="Try the quiz again"
      >
        Try Again 🔄
      </button>
    </div>
  );
};

export default QuizResults;
