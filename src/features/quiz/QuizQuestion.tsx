// src/features/quiz/QuizQuestion.tsx
/**
 * @fileoverview QuizQuestion component — renders a single question with answer options.
 * Purely presentational; all state is managed by useQuiz hook.
 * Max 150 lines enforced.
 */
import React from 'react';
import type { QuizQuestion as IQuizQuestion } from '@/types';

interface QuizQuestionProps {
  question: IQuizQuestion;
  selectedOptionId: string | null;
  onSelectOption: (id: string) => void;
  currentIndex: number;
  totalQuestions: number;
  isSubmitted: boolean;
}

/**
 * Renders a quiz question card with selectable answer options.
 * Highlights correct/incorrect answers after submission.
 */
export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
  currentIndex,
  totalQuestions,
  isSubmitted,
}) => {
  return (
    <div className="quiz-question" role="group" aria-labelledby="question-text">
      <div className="quiz-question__progress" aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}>
        <div className="quiz-question__progress-bar">
          <div
            className="quiz-question__progress-fill"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
          />
        </div>
        <span className="quiz-question__progress-text">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <div className="quiz-question__difficulty-badge" data-difficulty={question.difficulty}>
        {question.difficulty.toUpperCase()}
      </div>

      <h2 id="question-text" className="quiz-question__text">
        {question.question}
      </h2>

      <ul className="quiz-question__options" role="list">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = isSubmitted && option.id === question.correctOptionId;
          const isWrong = isSubmitted && isSelected && !isCorrect;

          let stateClass = '';
          if (isCorrect) stateClass = 'quiz-option--correct';
          else if (isWrong) stateClass = 'quiz-option--wrong';
          else if (isSelected) stateClass = 'quiz-option--selected';

          return (
            <li key={option.id} role="listitem">
              <button
                type="button"
                id={`option-${option.id}`}
                className={`quiz-option ${stateClass}`}
                onClick={() => !isSubmitted && onSelectOption(option.id)}
                disabled={isSubmitted}
                aria-pressed={isSelected}
                aria-describedby={isSubmitted ? `option-${option.id}-status` : undefined}
              >
                <span className="quiz-option__letter" aria-hidden="true">
                  {option.id.toUpperCase()}
                </span>
                <span className="quiz-option__text">{option.text}</span>
                {isCorrect && <span className="quiz-option__icon" aria-hidden="true">✓</span>}
                {isWrong && <span className="quiz-option__icon" aria-hidden="true">✗</span>}
              </button>
              {isSubmitted && (
                <span id={`option-${option.id}-status`} className="sr-only">
                  {isCorrect ? 'Correct answer' : isWrong ? 'Your incorrect answer' : ''}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default QuizQuestion;
