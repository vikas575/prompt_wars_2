// src/services/googleTTS.test.ts
/**
 * @fileoverview Unit tests for the Google Text-to-Speech service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { synthesizeSpeech, stopSpeaking, isSpeaking } from './googleTTS';
import type { TTSOptions } from '@/types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const defaultOptions: TTSOptions = {
  languageCode: 'en-US',
  ssmlGender: 'NEUTRAL',
  speakingRate: 1.0,
};

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_TTS_API_KEY', 'test-tts-key');
  mockFetch.mockReset();
  stopSpeaking();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('synthesizeSpeech', () => {
  it('returns null for empty text', async () => {
    const result = await synthesizeSpeech('', defaultOptions);
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null when API key is not configured', async () => {
    vi.stubEnv('VITE_GOOGLE_TTS_API_KEY', '');
    const result = await synthesizeSpeech('Hello', defaultOptions);
    expect(result).toBeNull();
  });

  it('returns a base64 data URL on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: 'base64data==' }),
    });
    const result = await synthesizeSpeech('Hello', defaultOptions);
    expect(result).toBe('data:audio/mp3;base64,base64data==');
  });

  it('returns null when API responds with error status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' });
    const result = await synthesizeSpeech('Hello', defaultOptions);
    expect(result).toBeNull();
  });

  it('returns null when fetch throws a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network offline'));
    const result = await synthesizeSpeech('Hello', defaultOptions);
    expect(result).toBeNull();
  });

  it('sends correct request body to the API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: 'abc' }),
    });
    await synthesizeSpeech('Vote', { languageCode: 'hi-IN', ssmlGender: 'FEMALE', speakingRate: 0.9 });
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string) as {
      input: { text: string };
      voice: { languageCode: string; ssmlGender: string };
    };
    expect(body.input.text).toBe('Vote');
    expect(body.voice.languageCode).toBe('hi-IN');
    expect(body.voice.ssmlGender).toBe('FEMALE');
  });
});

describe('stopSpeaking', () => {
  it('cancels browser speech synthesis', () => {
    stopSpeaking();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});

describe('isSpeaking', () => {
  it('returns false initially', () => {
    expect(isSpeaking()).toBe(false);
  });
});
