// src/hooks/useTranslation.test.ts
/**
 * @fileoverview Unit tests for the useTranslation hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from './useTranslation';

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: (state: any) => any) =>
    selector({ selectedLanguage: 'en' }),
  ),
}));

vi.mock('@/services/googleTranslate', () => ({
  translateText: vi.fn(),
  translateBatch: vi.fn(),
  clearTranslationCache: vi.fn(),
}));

import * as translateService from '@/services/googleTranslate';
import { useAppStore } from '@/store/appStore';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTranslation', () => {
  it('returns English text unchanged when language is "en"', async () => {
    const { result } = renderHook(() => useTranslation());
    let translated = '';
    await act(async () => {
      translated = await result.current.translate('Hello');
    });
    expect(translated).toBe('Hello');
    expect(translateService.translateText).not.toHaveBeenCalled();
  });

  it('calls translateText when language is not English', async () => {
    vi.mocked(useAppStore).mockImplementation(
      (selector: (state: any) => any) =>
        selector({ selectedLanguage: 'hi' }),
    );
    vi.mocked(translateService.translateText).mockResolvedValueOnce({
      translatedText: 'नमस्ते',
    });

    const { result } = renderHook(() => useTranslation());
    let translated = '';
    await act(async () => {
      translated = await result.current.translate('Hello');
    });
    expect(translated).toBe('नमस्ते');
    expect(translateService.translateText).toHaveBeenCalledWith('Hello', 'hi');
  });

  it('returns original text when translateText throws', async () => {
    vi.mocked(useAppStore).mockImplementation(
      (selector: (state: any) => any) =>
        selector({ selectedLanguage: 'hi' }),
    );
    vi.mocked(translateService.translateText).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useTranslation());
    let translated = '';
    await act(async () => {
      translated = await result.current.translate('Hello');
    });
    expect(translated).toBe('Hello');
    expect(result.current.error).not.toBeNull();
  });

  it('returns texts unchanged in translateMany when language is "en"', async () => {
    const { result } = renderHook(() => useTranslation());
    let results: string[] = [];
    await act(async () => {
      results = await result.current.translateMany(['Vote', 'Election']);
    });
    expect(results).toEqual(['Vote', 'Election']);
  });

  it('sets isTranslating to true during translation and false after', async () => {
    vi.mocked(useAppStore).mockImplementation(
      (selector: (state: any) => any) =>
        selector({ selectedLanguage: 'hi' }),
    );
    vi.mocked(translateService.translateText).mockResolvedValueOnce({ translatedText: 'test' });

    const { result } = renderHook(() => useTranslation());
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.isTranslating).toBe(false);
  });

  it('exposes currentLanguage from the store', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.currentLanguage).toBe('en');
  });
});
