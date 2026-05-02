// src/features/tutor/TutorPage.test.tsx
/**
 * @fileoverview Tests for the TutorPage tabbed education centre.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TutorPage } from './TutorPage';

const mockData = {
  country: 'IN' as const,
  countryName: 'India',
  flag: '🇮🇳',
  eligibility: {
    country: 'IN' as const,
    minimumAge: 18,
    citizenshipRequired: true,
    residencyRequirement: 'Must be resident in constituency',
    registrationDeadlineDays: 10,
    additionalRequirements: ['Must have Voter ID', 'Must be on Electoral Roll'],
  },
  ballotTypes: [
    {
      id: 'evm',
      name: 'Electronic Voting Machine',
      description: 'A tamper-proof electronic device.',
      usedIn: ['IN' as const],
      pros: ['Fast counting'],
      cons: ['Requires electricity'],
    },
  ],
  timeline: [],
  myths: [],
  quizQuestions: [],
};

vi.mock('@/hooks/useElectionData', () => ({
  useElectionData: vi.fn(() => ({
    data: mockData,
    isLoading: false,
    error: null,
    country: 'IN',
  })),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: (s: {
    ttsState: { isPlaying: boolean; isPaused: boolean; currentSectionId: null };
    setTTSState: () => void;
    selectedLanguage: string;
  }) => unknown) =>
    selector({
      ttsState: { isPlaying: false, isPaused: false, currentSectionId: null },
      setTTSState: vi.fn(),
      selectedLanguage: 'en',
    }),
  ),
}));

vi.mock('@/services/googleTTS', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TutorPage', () => {
  it('renders the main heading', () => {
    render(<TutorPage />);
    expect(screen.getByRole('heading', { name: /election education centre/i })).toBeInTheDocument();
  });

  it('shows Eligibility tab content by default', () => {
    render(<TutorPage />);
    expect(screen.getByRole('heading', { name: /voter eligibility/i })).toBeInTheDocument();
    expect(screen.getByText('18+')).toBeInTheDocument();
  });

  it('renders all four tabs', () => {
    render(<TutorPage />);
    expect(screen.getByRole('tab', { name: /eligibility/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ballot types/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /vote counting/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /hung parliament/i })).toBeInTheDocument();
  });

  it('switches to Ballot Types tab on click', () => {
    render(<TutorPage />);
    fireEvent.click(screen.getByRole('tab', { name: /ballot types/i }));
    expect(screen.getByText('Electronic Voting Machine')).toBeInTheDocument();
  });

  it('switches to Hung Parliament tab on click', () => {
    render(<TutorPage />);
    fireEvent.click(screen.getByRole('tab', { name: /hung parliament/i }));
    expect(screen.getByRole('heading', { name: /hung parliament/i })).toBeInTheDocument();
  });

  it('active tab has aria-selected=true', () => {
    render(<TutorPage />);
    expect(screen.getByRole('tab', { name: /eligibility/i })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: /ballot types/i }));
    expect(screen.getByRole('tab', { name: /ballot types/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /eligibility/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows Listen button in eligibility tab', () => {
    render(<TutorPage />);
    expect(screen.getByRole('button', { name: /listen to this section/i })).toBeInTheDocument();
  });

  it('displays additional requirements list', () => {
    render(<TutorPage />);
    expect(screen.getByText('Must have Voter ID')).toBeInTheDocument();
    expect(screen.getByText('Must be on Electoral Roll')).toBeInTheDocument();
  });
});
