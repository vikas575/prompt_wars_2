// src/features/quiz/QuizFeedback.tsx
/**
 * @fileoverview QuizFeedback component — shown after each answer.
 * Displays correct/incorrect result, explanation, and next button.
 */
import React from 'react';
import { ListenButton } from '@/components/ListenButton';
import type { QuizQuestion, QuizAnswer } from '@/types';

interface QuizFeedbackProps {
  question: QuizQuestion;
  answer: QuizAnswer;
  onNext: () => void;
  isLastQuestion: boolean;
}

/**
 * Displays feedback after a question is answered.
 * Shows whether the answer was correct, the explanation, and a navigation button.
 */
export const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  question,
  answer,
  onNext,
  isLastQuestion,
}) => {
  const feedbackText = `${answer.isCorrect ? 'Correct!' : 'Incorrect.'} ${question.explanation}`;

  return (
    <div
      className={`quiz-feedback ${answer.isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect'}`}
      role="region"
      aria-label="Answer feedback"
      aria-live="polite"
    >
      <div className="quiz-feedback__result">
        <span className="quiz-feedback__icon" aria-hidden="true">
          {answer.isCorrect ? '🎉' : '💡'}
        </span>
        <h3 className="quiz-feedback__verdict">
          {answer.isCorrect ? 'Correct!' : 'Not quite!'}
        </h3>
      </div>

      <div className="quiz-feedback__explanation">
        <p>{question.explanation}</p>
        <ListenButton
          text={feedbackText}
          sectionId={`feedback-${question.id}`}
          className="quiz-feedback__listen"
        />
      </div>

      <button
        type="button"
        className="quiz-feedback__next-btn btn btn--primary"
        onClick={onNext}
        autoFocus
        aria-label={isLastQuestion ? 'See your results' : 'Next question'}
      >
        {isLastQuestion ? 'See Results 🏆' : 'Next Question →'}
      </button>
    </div>
  );
};

export default QuizFeedback;
