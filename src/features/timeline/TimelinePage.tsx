// src/features/timeline/TimelinePage.tsx
/**
 * @fileoverview Election Timeline page showing all stages from filing to inauguration.
 * Uses a vertical stepper layout with TTS support on each card.
 */
import React from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { ListenButton } from '@/components/ListenButton';
import type { TimelineEvent } from '@/types';

const STAGE_COLORS: Record<string, string> = {
  filing: '#6366f1',
  primary: '#8b5cf6',
  campaign: '#f59e0b',
  voting: '#10b981',
  counting: '#3b82f6',
  certification: '#06b6d4',
  inauguration: '#f43f5e',
};

/**
 * Renders a single timeline event card.
 */
const TimelineCard: React.FC<{ event: TimelineEvent; index: number }> = ({ event, index }) => {
  const cardText = `${event.title}. ${event.description}. ${
    event.daysRelativeToElection < 0
      ? `${Math.abs(event.daysRelativeToElection)} days before election day.`
      : event.daysRelativeToElection === 0
      ? 'On election day.'
      : `${event.daysRelativeToElection} days after election day.`
  }`;

  return (
    <li className="timeline-card" id={`timeline-event-${event.id}`}>
      <div
        className="timeline-card__connector"
        style={{ '--stage-color': STAGE_COLORS[event.stage] ?? '#6366f1' } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="timeline-card__dot">
          <span aria-hidden="true">{event.icon}</span>
        </div>
        {index > 0 && <div className="timeline-card__line" />}
      </div>

      <article className="timeline-card__content">
        <header className="timeline-card__header">
          <span
            className="timeline-card__stage-badge"
            style={{ background: STAGE_COLORS[event.stage] ?? '#6366f1' }}
          >
            {event.stage.toUpperCase()}
          </span>
          <span className="timeline-card__days">
            {event.daysRelativeToElection < 0
              ? `${Math.abs(event.daysRelativeToElection)} days before`
              : event.daysRelativeToElection === 0
              ? 'Election Day'
              : `${event.daysRelativeToElection} days after`}
          </span>
        </header>
        <h3 className="timeline-card__title">{event.title}</h3>
        <p className="timeline-card__description">{event.description}</p>
        <ListenButton text={cardText} sectionId={`timeline-${event.id}`} />
      </article>
    </li>
  );
};

/**
 * Full election timeline page with all stages visualised as a vertical stepper.
 */
export const TimelinePage: React.FC = () => {
  const { data, isLoading, error } = useElectionData();

  if (isLoading) {
    return <div className="loading" role="status" aria-live="polite">Loading timeline...</div>;
  }

  if (error || !data) {
    return <div className="error" role="alert">{error ?? 'Timeline data unavailable.'}</div>;
  }

  const sortedEvents = [...data.timeline].sort(
    (a, b) => a.daysRelativeToElection - b.daysRelativeToElection,
  );

  return (
    <section className="timeline-page" aria-label={`Election timeline for ${data.countryName}`}>
      <header className="timeline-page__header">
        <h1 className="timeline-page__title">
          {data.flag} {data.countryName} Election Timeline
        </h1>
        <p className="timeline-page__subtitle">
          From nomination filing to government formation — every key stage explained.
        </p>
      </header>

      <ol className="timeline-list" aria-label="Election stages in chronological order">
        {sortedEvents.map((event, idx) => (
          <TimelineCard key={event.id} event={event} index={idx} />
        ))}
      </ol>
    </section>
  );
};

export default TimelinePage;
