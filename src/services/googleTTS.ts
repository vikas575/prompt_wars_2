// src/services/googleTTS.ts
/**
 * @fileoverview Google Cloud Text-to-Speech API service.
 *
 * Why Google TTS?
 * Audio narration dramatically improves accessibility for users with visual impairments,
 * low literacy, or who simply prefer to listen. This service powers the "Listen" button
 * on every content section of the app (WCAG 2.1 AA compliance).
 *
 * Implementation notes:
 * - Uses the REST endpoint (no SDK dependency) to keep bundle size small
 * - Returns a base64-encoded audio blob URL for <audio> playback
 * - Falls back to the browser's native SpeechSynthesis API when Google TTS is unavailable
 * - API key sourced from VITE_GOOGLE_TTS_API_KEY environment variable
 */

import type { TTSOptions } from '@/types';
import { logger } from '@/utils/logger';

const TTS_API_BASE = 'https://texttospeech.googleapis.com/v1/text:synthesize';

/** Currently playing audio element for cancel/pause control */
let currentAudio: HTMLAudioElement | null = null;

/**
 * Converts text to speech using the Google Cloud TTS API.
 * Returns a playable audio URL (base64 data URL).
 *
 * @param text - The text content to convert to speech
 * @param options - TTS voice and audio configuration options
 * @returns A data URL string for direct use in an <audio> element, or null on failure
 */
export async function synthesizeSpeech(
  text: string,
  options: TTSOptions,
): Promise<string | null> {
  if (!text.trim()) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY as string | undefined;
  if (!apiKey || apiKey === 'dummy-key') {
    logger.warn('[TTS] Valid API key not found. Falling back to SpeechSynthesis.');
    return null;
  }

  const url = `${TTS_API_BASE}?key=${apiKey}`;

  const requestBody = {
    input: { text },
    voice: {
      languageCode: options.languageCode,
      ssmlGender: options.ssmlGender ?? 'NEUTRAL',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: options.speakingRate ?? 1.0,
      pitch: options.pitch ?? 0,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { audioContent: string };
    return `data:audio/mp3;base64,${data.audioContent}`;
  } catch (err: unknown) {
    logger.error('[TTS] API call failed:', err);
    return null;
  }
}

/**
 * Plays text as speech using Google TTS, falling back to browser SpeechSynthesis.
 * Stops any currently playing audio before starting a new utterance.
 *
 * @param text - Text to speak
 * @param options - TTS configuration options
 * @returns Promise that resolves when audio finishes or on error
 */
export async function speakText(text: string, options: TTSOptions): Promise<void> {
  // Stop any currently playing audio
  stopSpeaking();

  const audioUrl = await synthesizeSpeech(text, options);

  if (audioUrl) {
    // Google TTS succeeded — play the audio
    currentAudio = new Audio(audioUrl);
    return new Promise<void>((resolve, reject) => {
      if (!currentAudio) return resolve();
      currentAudio.onended = () => resolve();
      currentAudio.onerror = () => {
        logger.error('[TTS] Audio playback error');
        reject(new Error('Audio playback failed'));
      };
      currentAudio.play().catch((err: unknown) => {
        logger.error('[TTS] Play() failed:', err);
        fallbackToSpeechSynthesis(text, options, resolve);
      });
    });
  }

  // Fallback: use browser's built-in SpeechSynthesis API
  return new Promise<void>((resolve) => {
    fallbackToSpeechSynthesis(text, options, resolve);
  });
}

/**
 * Uses the browser's native SpeechSynthesis API as a fallback.
 * @param text - Text to speak
 * @param options - TTS options (used for lang code)
 * @param onEnd - Callback when speech ends
 */
function fallbackToSpeechSynthesis(
  text: string,
  options: TTSOptions,
  onEnd: () => void,
): void {
  if (!('speechSynthesis' in window)) {
    logger.warn('[TTS] SpeechSynthesis not supported in this browser.');
    onEnd();
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.languageCode;
  utterance.rate = options.speakingRate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = 1.0; // Ensure full volume

  utterance.onend = () => {
    logger.info('[TTS] SpeechSynthesis finished');
    onEnd();
  };

  utterance.onerror = (event) => {
    logger.error('[TTS] SpeechSynthesis error:', event);
    onEnd();
  };

  // Important: On some browsers, speechSynthesis must be triggered by a user gesture
  // and sometimes needs a small delay after cancel()
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

/**
 * Stops any currently playing TTS audio and cancels browser speech synthesis.
 */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Returns whether audio is currently playing.
 * @returns true if audio is actively playing
 */
export function isSpeaking(): boolean {
  if (currentAudio && !currentAudio.paused && !currentAudio.ended) return true;
  if ('speechSynthesis' in window) return window.speechSynthesis.speaking;
  return false;
}
