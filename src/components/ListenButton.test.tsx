// src/components/ListenButton.test.tsx
/**
 * @fileoverview Tests for the ListenButton component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListenButton } from './ListenButton';

vi.mock('@/services/googleTTS', () => ({
  speakText: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
}));

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: (s: {
    ttsState: { isPlaying: boolean; isPaused: boolean; currentSectionId: string | null };
    setTTSState: (s: unknown) => void;
    selectedLanguage: string;
  }) => unknown) =>
    selector({
      ttsState: { isPlaying: false, isPaused: false, currentSectionId: null },
      setTTSState: vi.fn(),
      selectedLanguage: 'en',
    }),
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ListenButton', () => {
  it('renders with aria-label "Listen to this section"', () => {
    render(<ListenButton text="Test text" sectionId="section-1" />);
    expect(screen.getByRole('button', { name: /listen to this section/i })).toBeInTheDocument();
  });

  it('shows listen icon when not playing', () => {
    render(<ListenButton text="Test" sectionId="s1" />);
    expect(screen.getByText('🔊')).toBeInTheDocument();
    expect(screen.getByText('Listen')).toBeInTheDocument();
  });

  it('is a button element', () => {
    render(<ListenButton text="Test" sectionId="s1" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls speakText on click', async () => {
    const { speakText } = await import('@/services/googleTTS');
    render(<ListenButton text="Hello world" sectionId="s1" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(speakText).toHaveBeenCalledWith(
        'Hello world',
        expect.objectContaining({ languageCode: 'en-US' }),
      );
    });
  });

  it('has aria-pressed=false when not playing', () => {
    render(<ListenButton text="Test" sectionId="s1" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('accepts additional className prop', () => {
    render(<ListenButton text="Test" sectionId="s1" className="extra-class" />);
    expect(screen.getByRole('button')).toHaveClass('extra-class');
  });
});
