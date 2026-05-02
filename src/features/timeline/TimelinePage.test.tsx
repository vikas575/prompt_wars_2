// src/features/timeline/TimelinePage.test.tsx
/**
 * @fileoverview Tests for the Timeline page.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelinePage } from './TimelinePage';

vi.mock('@/hooks/useElectionData', () => ({
  useElectionData: vi.fn(() => ({
    data: {
      country: 'IN',
      countryName: 'India',
      flag: '🇮🇳',
      timeline: [
        {
          id: 'in-1',
          stage: 'filing',
          title: 'Model Code of Conduct',
          description: 'ECI announces MCC.',
          daysRelativeToElection: -60,
          icon: '📋',
          country: 'IN',
        },
        {
          id: 'in-6',
          stage: 'voting',
          title: 'Polling Day',
          description: 'Voters cast ballots.',
          daysRelativeToElection: 0,
          icon: '🗳️',
          country: 'IN',
        },
      ],
      eligibility: {},
      ballotTypes: [],
      myths: [],
      quizQuestions: [],
    },
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

describe('TimelinePage', () => {
  it('renders the section heading', () => {
    render(<TimelinePage />);
    expect(screen.getByRole('heading', { name: /india election timeline/i })).toBeInTheDocument();
  });

  it('renders all timeline events', () => {
    render(<TimelinePage />);
    expect(screen.getByText('Model Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('Polling Day')).toBeInTheDocument();
  });

  it('shows days-before-election label', () => {
    render(<TimelinePage />);
    expect(screen.getByText('60 days before')).toBeInTheDocument();
  });

  it('shows Election Day label for day 0', () => {
    render(<TimelinePage />);
    expect(screen.getByText('Election Day')).toBeInTheDocument();
  });

  it('renders a Listen button for each event', () => {
    render(<TimelinePage />);
    const listenButtons = screen.getAllByRole('button', { name: /listen to this section/i });
    expect(listenButtons).toHaveLength(2);
  });

  it('shows loading state', async () => {
    const { useElectionData } = await import('@/hooks/useElectionData');
    vi.mocked(useElectionData).mockReturnValueOnce({
      data: null, isLoading: true, error: null, country: 'IN',
    });
    render(<TimelinePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    const { useElectionData } = await import('@/hooks/useElectionData');
    vi.mocked(useElectionData).mockReturnValueOnce({
      data: null, isLoading: false, error: 'Data unavailable', country: 'IN',
    });
    render(<TimelinePage />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
