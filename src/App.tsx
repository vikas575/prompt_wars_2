// src/App.tsx
/**
 * @fileoverview Root application component.
 * Sets up React Router v6 routes, QueryClient provider, auth subscription,
 * and React.lazy route-level code splitting with Suspense boundaries.
 */
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/store/appStore';
import { subscribeToAuthState } from '@/services/firebase';
import type { UserProfile } from '@/types';

// Route-level code splitting — each page chunk loaded on demand
const HomePage = lazy(() => import('@/pages/HomePage'));
const TimelinePage = lazy(() => import('@/features/timeline/TimelinePage'));
const QuizPage = lazy(() => import('@/features/quiz/QuizPage'));
const MythsPage = lazy(() => import('@/features/myths/MythsPage'));
const TutorPage = lazy(() => import('@/features/tutor/TutorPage'));
const MapPage = lazy(() => import('@/features/map/MapPage'));

/** React Query client with sensible defaults for civic data (long stale times) */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Full-screen loading fallback shown during route chunk loading.
 */
const PageLoader: React.FC = () => (
  <div className="page-loader" role="status" aria-live="polite" aria-label="Loading page">
    <div className="page-loader__spinner" aria-hidden="true" />
    <p>Loading...</p>
  </div>
);

/**
 * Auth subscriber component — keeps Zustand user state in sync with Firebase Auth.
 */
const AuthSync: React.FC = () => {
  const setUser = useAppStore((s) => s.setUser);
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const selectedLanguage = useAppStore((s) => s.selectedLanguage);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          country: selectedCountry,
          preferredLanguage: selectedLanguage,
          createdAt: Date.now(),
        };
        setUser(profile);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, [setUser, selectedCountry, selectedLanguage]);

  return null;
};

/**
 * Root App component — providers, routing, and layout.
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthSync />
        <div className="app-layout">
          <Navbar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/myths" element={<MythsPage />} />
                <Route path="/learn" element={<TutorPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route
                  path="*"
                  element={
                    <div className="not-found" role="main">
                      <h1>404 — Page Not Found</h1>
                      <p>The page you are looking for does not exist.</p>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <footer className="app-footer" role="contentinfo">
            <p>© {new Date().getFullYear()} CivicIQ — Election Education Assistant</p>
            <p>Built for civic empowerment 🗳️</p>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
