// src/features/tutor/TutorPage.tsx
/**
 * @fileoverview Tutor page — educational content hub covering voter eligibility,
 * ballot types, counting process, and hung parliament scenarios.
 * Each section has TTS support and country-specific content.
 */
import React, { useState, useCallback } from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { ListenButton } from '@/components/ListenButton';
import type { BallotType } from '@/types';

// ─── Sub-components (each < 50 lines) ──────────────────────────────────────

const EligibilitySection: React.FC<ReturnType<typeof useElectionData>> = ({ data }) => {
  if (!data) return null;
  const { eligibility, countryName } = data;
  const text = `To vote in ${countryName}, you must be at least ${eligibility.minimumAge} years old. ${eligibility.citizenshipRequired ? 'Citizenship is required.' : 'Citizenship is not required — qualifying residents may vote.'} ${eligibility.residencyRequirement}. You must register at least ${eligibility.registrationDeadlineDays} days before the election. Additional requirements: ${eligibility.additionalRequirements.join('. ')}.`;

  return (
    <section className="tutor-section" aria-labelledby="eligibility-heading">
      <h2 id="eligibility-heading" className="tutor-section__title">🗳️ Voter Eligibility</h2>
      <div className="tutor-section__card">
        <div className="eligibility-grid">
          <div className="eligibility-stat">
            <span className="eligibility-stat__value">{eligibility.minimumAge}+</span>
            <span className="eligibility-stat__label">Minimum Age</span>
          </div>
          <div className="eligibility-stat">
            <span className="eligibility-stat__value">{eligibility.registrationDeadlineDays}</span>
            <span className="eligibility-stat__label">Days to Register Before Election</span>
          </div>
          <div className="eligibility-stat">
            <span className="eligibility-stat__value">{eligibility.citizenshipRequired ? 'Yes' : 'Not Always'}</span>
            <span className="eligibility-stat__label">Citizenship Required</span>
          </div>
        </div>
        <p className="tutor-section__residency">{eligibility.residencyRequirement}</p>
        <ul className="tutor-section__requirements" aria-label="Additional requirements">
          {eligibility.additionalRequirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
        <ListenButton text={text} sectionId="eligibility-section" />
      </div>
    </section>
  );
};

const BallotCard: React.FC<{ ballot: BallotType }> = ({ ballot }) => {
  const text = `${ballot.name}: ${ballot.description}. Pros: ${ballot.pros.join(', ')}. Cons: ${ballot.cons.join(', ')}.`;
  return (
    <article className="ballot-card" aria-label={ballot.name}>
      <h3 className="ballot-card__name">{ballot.name}</h3>
      <p className="ballot-card__desc">{ballot.description}</p>
      <div className="ballot-card__comparison">
        <div className="ballot-card__pros">
          <h4>✅ Pros</h4>
          <ul>{ballot.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div className="ballot-card__cons">
          <h4>❌ Cons</h4>
          <ul>{ballot.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      </div>
      <ListenButton text={text} sectionId={`ballot-${ballot.id}`} />
    </article>
  );
};

const HungParliamentSection: React.FC = () => {
  const text = "What happens when no single party wins a majority? This is called a hung parliament or hung assembly. In most democracies, the largest party is given first opportunity to form a coalition government by inviting other parties to join. If no coalition can be formed, a fresh election may be called. The President or Monarch plays a ceremonial role in inviting a leader to form the government.";
  return (
    <section className="tutor-section" aria-labelledby="hung-parliament-heading">
      <h2 id="hung-parliament-heading" className="tutor-section__title">🏛️ Hung Parliament / No-Majority Situation</h2>
      <div className="tutor-section__card">
        <p>{text}</p>
        <div className="hung-parliament__steps">
          {[
            { step: '1', title: 'Results Announced', desc: 'No single party wins majority of seats.' },
            { step: '2', title: 'Largest Party Invited', desc: 'Head of state invites largest party to form government.' },
            { step: '3', title: 'Coalition Talks', desc: 'Parties negotiate for shared governance agreements.' },
            { step: '4', title: 'Vote of Confidence', desc: 'New government must prove majority support in parliament.' },
            { step: '5', title: 'Fresh Elections', desc: 'If no coalition is formed, fresh elections may be called.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="hung-step">
              <div className="hung-step__number" aria-hidden="true">{step}</div>
              <div className="hung-step__content">
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <ListenButton text={text} sectionId="hung-parliament-section" />
      </div>
    </section>
  );
};

/**
 * Main tutor hub — tabs for Eligibility, Ballots, Counting, and Hung Parliament.
 */
export const TutorPage: React.FC = () => {
  const electionData = useElectionData();
  const { data, isLoading, error } = electionData;
  const [activeTab, setActiveTab] = useState<'eligibility' | 'ballots' | 'counting' | 'hung'>('eligibility');

  const handleTabChange = useCallback((tab: typeof activeTab) => setActiveTab(tab), []);

  if (isLoading) return <div className="loading" role="status" aria-live="polite">Loading...</div>;
  if (error || !data) return <div className="error" role="alert">{error ?? 'Data unavailable.'}</div>;

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'eligibility', label: '🗳️ Eligibility' },
    { id: 'ballots', label: '📋 Ballot Types' },
    { id: 'counting', label: '🔢 Vote Counting' },
    { id: 'hung', label: '🏛️ Hung Parliament' },
  ];

  return (
    <div className="tutor-page">
      <header className="tutor-page__header">
        <h1 className="tutor-page__title">Election Education Centre</h1>
        <p className="tutor-page__subtitle">Everything you need to know about the {data.countryName} election process.</p>
      </header>

      <nav className="tutor-tabs" role="tablist" aria-label="Education topics">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            type="button"
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            className={`tutor-tab ${activeTab === id ? 'tutor-tab--active' : ''}`}
            onClick={() => handleTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'eligibility' && <EligibilitySection {...electionData} />}
        {activeTab === 'ballots' && (
          <section className="tutor-section" aria-labelledby="ballots-heading">
            <h2 id="ballots-heading" className="tutor-section__title">Types of Ballots</h2>
            <div className="ballot-grid">
              {data.ballotTypes.map((b) => <BallotCard key={b.id} ballot={b} />)}
            </div>
          </section>
        )}
        {activeTab === 'counting' && (
          <section className="tutor-section" aria-labelledby="counting-heading">
            <h2 id="counting-heading" className="tutor-section__title">🔢 How Votes Are Counted</h2>
            <div className="tutor-section__card">
              <p>Vote counting begins as soon as polling closes. Observers from each party witness the process to ensure transparency. Results are announced as they come in, constituency by constituency. Any discrepancies trigger a recount.</p>
              <ListenButton text="Vote counting begins as soon as polling closes. Observers from each party witness the process." sectionId="counting-section" />
            </div>
          </section>
        )}
        {activeTab === 'hung' && <HungParliamentSection />}
      </div>
    </div>
  );
};

export default TutorPage;
