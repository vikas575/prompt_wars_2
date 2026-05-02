// src/features/myths/MythsPage.tsx
/**
 * @fileoverview Myth vs. Fact debunker page.
 * Displays common election myths with expandable fact panels and TTS support.
 * Animated flip-card interaction reveals the truth behind each myth.
 */
import React, { useState, useCallback, useId } from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { ListenButton } from '@/components/ListenButton';
import type { MythFact } from '@/types';

const SEVERITY_LABELS = { low: '⚠️ Minor', medium: '⚠️ Common', high: '🚨 Critical' };

interface MythCardProps {
  myth: MythFact;
}

/**
 * A single myth/fact card with expand-to-reveal interaction.
 */
const MythCard: React.FC<MythCardProps> = ({ myth }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const labelId = useId();
  const factText = `Myth: ${myth.myth}. Fact: ${myth.fact}. ${myth.explanation}`;

  const handleReveal = useCallback(() => setIsRevealed((prev) => !prev), []);

  return (
    <article
      className={`myth-card ${isRevealed ? 'myth-card--revealed' : ''}`}
      aria-labelledby={labelId}
    >
      <header className="myth-card__header">
        <span
          className="myth-card__severity"
          data-severity={myth.severity}
          aria-label={`Severity: ${myth.severity}`}
        >
          {SEVERITY_LABELS[myth.severity]}
        </span>
      </header>

      <div className="myth-card__myth-section">
        <span className="myth-card__label" aria-hidden="true">MYTH</span>
        <p id={labelId} className="myth-card__myth-text">{myth.myth}</p>
      </div>

      <button
        type="button"
        className="myth-card__reveal-btn btn btn--secondary"
        onClick={handleReveal}
        aria-expanded={isRevealed}
        aria-label={isRevealed ? 'Hide the fact' : 'Reveal the fact'}
      >
        {isRevealed ? '▲ Hide Fact' : '▼ Reveal Fact'}
      </button>

      {isRevealed && (
        <div className="myth-card__fact-section" role="region" aria-label="Election fact">
          <span className="myth-card__label myth-card__label--fact" aria-hidden="true">FACT ✓</span>
          <p className="myth-card__fact-text">{myth.fact}</p>
          <p className="myth-card__explanation">{myth.explanation}</p>
          <ListenButton text={factText} sectionId={`myth-${myth.id}`} />
        </div>
      )}
    </article>
  );
};

/**
 * Full myths page rendering all myth/fact cards for the selected country.
 */
export const MythsPage: React.FC = () => {
  const { data, isLoading, error } = useElectionData();

  if (isLoading) {
    return <div className="loading" role="status" aria-live="polite">Loading myths...</div>;
  }

  if (error || !data) {
    return <div className="error" role="alert">{error ?? 'Data unavailable.'}</div>;
  }

  return (
    <section className="myths-page" aria-label="Election myth debunker">
      <header className="myths-page__header">
        <h1 className="myths-page__title">⚖️ Myth vs. Fact</h1>
        <p className="myths-page__subtitle">
          Don&apos;t be misled. Here are the most common election myths — debunked with evidence.
        </p>
      </header>

      <div className="myths-page__grid" role="list" aria-label="Election myths">
        {data.myths.map((myth) => (
          <div key={myth.id} role="listitem">
            <MythCard myth={myth} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MythsPage;
