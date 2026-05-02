// src/components/Navbar.tsx
/**
 * @fileoverview Navigation bar with country selector, language picker, and auth controls.
 * Skip-to-content link at top for keyboard accessibility.
 */
import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { signInWithGoogle, signOutUser } from '@/services/firebase';
import { SUPPORTED_LANGUAGES } from '@/data/electionData';
import type { Country, LanguageCode } from '@/types';

const COUNTRIES: Array<{ code: Country; label: string; flag: string }> = [
  { code: 'IN', label: 'India', flag: '🇮🇳' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
];

/**
 * Top navigation bar with responsive layout.
 */
export const Navbar: React.FC = () => {
  const { user, selectedCountry, selectedLanguage, setUser, setCountry, setLanguage } =
    useAppStore((s) => ({
      user: s.user,
      selectedCountry: s.selectedCountry,
      selectedLanguage: s.selectedLanguage,
      setUser: s.setUser,
      setCountry: s.setCountry,
      setLanguage: s.setLanguage,
    }));

  const handleSignIn = useCallback(async () => {
    const fbUser = await signInWithGoogle();
    if (fbUser) {
      setUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        country: selectedCountry,
        preferredLanguage: selectedLanguage,
        createdAt: Date.now(),
      });
    }
  }, [selectedCountry, selectedLanguage, setUser]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, [setUser]);

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCountry(e.target.value as Country);
    },
    [setCountry],
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLanguage(e.target.value as LanguageCode);
    },
    [setLanguage],
  );

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/timeline', label: 'Timeline' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/myths', label: 'Myths' },
    { to: '/learn', label: 'Learn' },
    { to: '/map', label: 'Find Booth' },
  ];

  return (
    <header className="navbar" role="banner">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="Election Education Assistant home">
          🗳️ <span>CivicIQ</span>
          {useAppStore((s) => s.isDemoMode) && (
            <span className="navbar__demo-badge" aria-label="Running in Demo Mode">DEMO</span>
          )}
        </NavLink>

        <nav className="navbar__nav" aria-label="Main navigation">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              aria-current={undefined}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__controls">
          <label htmlFor="country-select" className="sr-only">Select Country</label>
          <select
            id="country-select"
            className="navbar__select"
            value={selectedCountry}
            onChange={handleCountryChange}
            aria-label="Select country for election content"
          >
            {COUNTRIES.map(({ code, label, flag }) => (
              <option key={code} value={code}>{flag} {label}</option>
            ))}
          </select>

          <label htmlFor="language-select" className="sr-only">Select Language</label>
          <select
            id="language-select"
            className="navbar__select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            aria-label="Select display language"
          >
            {SUPPORTED_LANGUAGES.map(({ code, nativeLabel }) => (
              <option key={code} value={code}>{nativeLabel}</option>
            ))}
          </select>

          {user ? (
            <div className="navbar__user">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={`${user.displayName ?? 'User'}'s profile picture`}
                  className="navbar__avatar"
                  width={32}
                  height={32}
                  loading="lazy"
                />
              )}
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => void handleSignOut()}
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="google-signin-btn"
              className="btn btn--google btn--sm"
              onClick={() => void handleSignIn()}
              aria-label="Sign in with Google to save your progress"
            >
              <span aria-hidden="true">G</span> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
