// src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock Firebase
vi.mock('@/services/firebase', () => ({
  subscribeToAuthState: vi.fn((cb) => { cb(null); return vi.fn(); }),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}));

// Mock Store
vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector) =>
    selector({
      user: null,
      selectedCountry: 'IN',
      selectedLanguage: 'en',
      ttsState: { isPlaying: false, isPaused: false, currentSectionId: null },
      setUser: vi.fn(),
      setCountry: vi.fn(),
      setLanguage: vi.fn(),
      setTTSState: vi.fn(),
    }),
  ),
}));

// Mock Data Hook
vi.mock('@/hooks/useElectionData', () => ({
  useElectionData: vi.fn(() => ({
    data: { 
      country: 'IN', 
      countryName: 'India', 
      flag: '🇮🇳', 
      quizQuestions: [], 
      timeline: [], 
      myths: [], 
      ballotTypes: [], 
      eligibility: {} 
    },
    isLoading: false,
    error: null,
    country: 'IN',
  })),
}));

// Mock TTS
vi.mock('@/services/googleTTS', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navbar brand', async () => {
    render(<App />);
    const brand = await screen.findByText('CivicIQ');
    expect(brand).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    render(<App />);
    // Wait for the main navigation to be in the document
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });
    
    // Check for Home link by text specifically to avoid confusion with brand link
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('renders the skip-to-content link', async () => {
    render(<App />);
    const skipLink = await screen.findByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
  });

  it('renders the footer', async () => {
    render(<App />);
    const footer = await screen.findByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
