// src/components/ListenButton.tsx
/**
 * @fileoverview Reusable "Listen to this section" button component.
 * Integrates Google Text-to-Speech API to read any text content aloud.
 * Accessible: aria-label, keyboard support, aria-pressed, aria-busy states.
 */
import React, { useCallback, useId } from 'react';
import { speakText, stopSpeaking } from '@/services/googleTTS';
import { useAppStore } from '@/store/appStore';

interface ListenButtonProps {
  /** The text content to be spoken aloud */
  text: string;
  /** ID of the section this button belongs to (for TTS state tracking) */
  sectionId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A button that triggers Google TTS playback for a given text section.
 * Shows a stop icon when playing, speaker icon when idle.
 *
 * @param props - ListenButton props
 */
export const ListenButton: React.FC<ListenButtonProps> = ({ text, sectionId, className = '' }) => {
  const buttonId = useId();
  const { ttsState, setTTSState, selectedLanguage } = useAppStore((s) => ({
    ttsState: s.ttsState,
    setTTSState: s.setTTSState,
    selectedLanguage: s.selectedLanguage,
  }));

  const isThisPlaying = ttsState.isPlaying && ttsState.currentSectionId === sectionId;

  const handleClick = useCallback(async () => {
    if (isThisPlaying) {
      stopSpeaking();
      setTTSState({ isPlaying: false, isPaused: false, currentSectionId: null });
      return;
    }

    // Stop anything currently playing
    stopSpeaking();
    setTTSState({ isPlaying: true, isPaused: false, currentSectionId: sectionId });

    const langMap: Record<string, string> = {
      en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR',
      de: 'de-DE', zh: 'zh-CN', ar: 'ar-XA', pt: 'pt-BR',
    };

    try {
      await speakText(text, {
        languageCode: langMap[selectedLanguage] ?? 'en-US',
        ssmlGender: 'NEUTRAL',
        speakingRate: 1.0,
      });
    } finally {
      setTTSState({ isPlaying: false, isPaused: false, currentSectionId: null });
    }
  }, [isThisPlaying, sectionId, text, selectedLanguage, setTTSState]);

  return (
    <button
      id={buttonId}
      type="button"
      onClick={() => void handleClick()}
      className={`listen-btn ${isThisPlaying ? 'listen-btn--active' : ''} ${className}`}
      aria-label={isThisPlaying ? 'Stop listening' : 'Listen to this section'}
      aria-pressed={isThisPlaying}
      aria-busy={isThisPlaying}
    >
      <span aria-hidden="true">{isThisPlaying ? '⏹' : '🔊'}</span>
      <span className="listen-btn__label">
        {isThisPlaying ? 'Stop' : 'Listen'}
      </span>
    </button>
  );
};

export default ListenButton;
