// src/services/googleTranslate.test.ts
/**
 * @fileoverview Unit tests for the Google Translate service.
 * Tests cover caching behaviour, API failure fallbacks, batch translation,
 * and no-op paths (source === target).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  translateText,
  translateBatch,
  clearTranslationCache,
} from './googleTranslate';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', 'test-api-key');
  clearTranslationCache();
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function mockSuccessResponse(translatedText: string, detectedSource?: string): void {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        translations: [{ translatedText, detectedSourceLanguage: detectedSource }],
      },
    }),
  });
}

function mockErrorResponse(status = 500): void {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: 'Internal Server Error',
  });
}

// ─── translateText ──────────────────────────────────────────────────────────

describe('translateText', () => {
  it('returns original text when input is empty', async () => {
    const result = await translateText('', 'hi');
    expect(result.translatedText).toBe('');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns original text when target is English (no-op)', async () => {
    const result = await translateText('Hello', 'en');
    expect(result.translatedText).toBe('Hello');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls the Translate API and returns translated text', async () => {
    mockSuccessResponse('नमस्ते', 'en');
    const result = await translateText('Hello', 'hi');
    expect(result.translatedText).toBe('नमस्ते');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('caches results and avoids duplicate API calls', async () => {
    mockSuccessResponse('नमस्ते');
    await translateText('Hello', 'hi');
    const second = await translateText('Hello', 'hi');
    expect(second.translatedText).toBe('नमस्ते');
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1 — cached
  });

  it('returns original text when API responds with an error', async () => {
    mockErrorResponse(403);
    const result = await translateText('Vote', 'hi');
    expect(result.translatedText).toBe('Vote');
  });

  it('returns original text when fetch throws a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await translateText('Election', 'es');
    expect(result.translatedText).toBe('Election');
  });

  it('returns original text when API key is not configured', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', '');
    const result = await translateText('Hello', 'hi');
    expect(result.translatedText).toBe('Hello');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('includes detected source language in result when provided', async () => {
    mockSuccessResponse('Hola', 'en');
    const result = await translateText('Hello', 'es');
    expect(result.detectedSourceLanguage).toBe('en');
  });
});

// ─── translateBatch ─────────────────────────────────────────────────────────

describe('translateBatch', () => {
  it('returns originals when target is English', async () => {
    const texts = ['Vote', 'Election'];
    const result = await translateBatch(texts, 'en');
    expect(result).toEqual(texts);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('translates all texts and caches results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { translations: [{ translatedText: 'Voto' }, { translatedText: 'Elección' }] },
      }),
    });
    const result = await translateBatch(['Vote', 'Election'], 'es');
    expect(result).toEqual(['Voto', 'Elección']);
  });

  it('uses cache for previously translated strings', async () => {
    // Pre-warm cache for 'Vote'
    mockSuccessResponse('Voto');
    await translateText('Vote', 'es');

    // Batch: 'Vote' is cached, only 'Election' needs API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { translations: [{ translatedText: 'Elección' }] },
      }),
    });

    const result = await translateBatch(['Vote', 'Election'], 'es');
    expect(result[0]).toBe('Voto');   // from cache
    expect(result[1]).toBe('Elección'); // from API
    expect(mockFetch).toHaveBeenCalledTimes(2); // 1 for pre-warm + 1 for batch
  });

  it('returns originals when batch API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const texts = ['Vote', 'Election'];
    const result = await translateBatch(texts, 'es');
    expect(result).toEqual(texts);
  });
});
