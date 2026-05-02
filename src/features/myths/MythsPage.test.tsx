// src/features/myths/MythsPage.test.tsx
/**
 * @fileoverview Tests for the Myths vs. Fact page.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MythsPage } from './MythsPage';

vi.mock('@/hooks/useElectionData', () => ({
  useElectionData: vi.fn(() => ({
    data: {
      country: 'IN',
      countryName: 'India',
      flag: '🇮🇳',
      myths: [
        {
          id: 'myth-1',
          myth: 'EVMs can be hacked remotely.',
          fact: 'EVMs are air-gapped.',
          explanation: 'No network connection exists.',
          severity: 'high',
          country: 'IN',
        },
        {
          id: 'myth-2',
          myth: 'You need money to run.',
          fact: 'Any eligible citizen can file.',
          explanation: 'Deposit is only ₹25,000.',
          severity: 'medium',
          country: 'IN',
        },
      ],
      timeline: [],
      eligibility: {},
      ballotTypes: [],
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

describe('MythsPage', () => {
  it('renders the page heading', () => {
    render(<MythsPage />);
    expect(screen.getByRole('heading', { name: /myth vs. fact/i })).toBeInTheDocument();
  });

  it('renders all myth cards', () => {
    render(<MythsPage />);
    expect(screen.getByText('EVMs can be hacked remotely.')).toBeInTheDocument();
    expect(screen.getByText('You need money to run.')).toBeInTheDocument();
  });

  it('hides the fact section initially', () => {
    render(<MythsPage />);
    expect(screen.queryByText('EVMs are air-gapped.')).not.toBeInTheDocument();
  });

  it('reveals the fact section when "Reveal Fact" is clicked', () => {
    render(<MythsPage />);
    const revealButtons = screen.getAllByRole('button', { name: /reveal the fact/i });
    fireEvent.click(revealButtons[0]);
    expect(screen.getByText('EVMs are air-gapped.')).toBeInTheDocument();
  });

  it('hides the fact section when "Hide Fact" is clicked', () => {
    render(<MythsPage />);
    const revealButtons = screen.getAllByRole('button', { name: /reveal the fact/i });
    fireEvent.click(revealButtons[0]);
    const hideBtn = screen.getByRole('button', { name: /hide the fact/i });
    fireEvent.click(hideBtn);
    expect(screen.queryByText('EVMs are air-gapped.')).not.toBeInTheDocument();
  });

  it('sets aria-expanded correctly on reveal button', () => {
    render(<MythsPage />);
    const revealButtons = screen.getAllByRole('button', { name: /reveal the fact/i });
    expect(revealButtons[0]).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(revealButtons[0]);
    expect(screen.getByRole('button', { name: /hide the fact/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a Listen button after revealing fact', () => {
    render(<MythsPage />);
    const revealButtons = screen.getAllByRole('button', { name: /reveal the fact/i });
    fireEvent.click(revealButtons[0]);
    expect(screen.getByRole('button', { name: /listen to this section/i })).toBeInTheDocument();
  });
});
