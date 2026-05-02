// src/pages/HomePage.tsx
/**
 * @fileoverview Hero landing page with feature cards and country onboarding.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useElectionData } from '@/hooks/useElectionData';

const FEATURE_CARDS = [
  { icon: '📅', title: 'Election Timeline', desc: 'Follow every stage from nomination to inauguration.', to: '/timeline' },
  { icon: '🧠', title: 'Civic Quiz', desc: 'Test your knowledge and earn a Civic Readiness Score.', to: '/quiz' },
  { icon: '⚖️', title: 'Myth Debunker', desc: 'Bust the most dangerous election myths with facts.', to: '/myths' },
  { icon: '📚', title: 'Learn Center', desc: 'Voter eligibility, ballot types, vote counting explained.', to: '/learn' },
  { icon: '📍', title: 'Find Your Booth', desc: 'Locate your nearest polling station on the map.', to: '/map' },
];

/**
 * Landing page with hero section and navigation cards.
 */
export const HomePage: React.FC = () => {
  const { data } = useElectionData();

  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <section className="hero" aria-label="Welcome section">
        <div className="hero__content">
          <h1 className="hero__title">
            Understand <span className="hero__highlight">Democracy</span>.<br />
            Vote with Confidence.
          </h1>
          <p className="hero__subtitle">
            Your interactive guide to the {data?.countryName ?? 'election'} process —
            from registration to results.
          </p>
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'dummy-key' && (
            <div className="hero__demo-note" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              🚀 Currently running in <strong>Full Feature Demo Mode</strong>
            </div>
          )}
          <div className="hero__cta">
            <Link to="/quiz" className="btn btn--primary btn--lg" aria-label="Start the election knowledge quiz">
              Take the Quiz 🏆
            </Link>
            <Link to="/timeline" className="btn btn--secondary btn--lg">
              Explore Timeline →
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__globe">🌐</div>
          <div className="hero__stats">
            <div className="hero__stat"><span>3</span><small>Countries</small></div>
            <div className="hero__stat"><span>10+</span><small>Quiz Questions</small></div>
            <div className="hero__stat"><span>8</span><small>Languages</small></div>
          </div>
        </div>
      </section>

      <section className="features" aria-label="App features">
        <h2 className="features__title">Everything You Need to Vote Informed</h2>
        <div className="features__grid">
          {FEATURE_CARDS.map(({ icon, title, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="feature-card"
              aria-label={`${title}: ${desc}`}
            >
              <span className="feature-card__icon" aria-hidden="true">{icon}</span>
              <h3 className="feature-card__title">{title}</h3>
              <p className="feature-card__desc">{desc}</p>
              <span className="feature-card__arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
