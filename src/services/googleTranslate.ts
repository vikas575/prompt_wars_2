// src/services/googleTranslate.ts
/**
 * @fileoverview Google Cloud Translation API v2 service.
 *
 * Why Google Translate?
 * Accessibility is core to civic education. By auto-translating election content,
 * we ensure non-English-speaking users can engage with the material in their
 * native language, dramatically increasing inclusion and reach.
 *
 * Implementation notes:
 * - All requests use the REST API with HTTPS (CSP-compliant)
 * - Responses are cached in-memory (TranslationCache) to minimize API calls
 * - Graceful fallback: returns original text if API fails
 * - API key sourced from VITE_GOOGLE_TRANSLATE_API_KEY environment variable
 */

import type { TranslationResult, TranslationCache, LanguageCode } from '@/types';
import { logger } from '@/utils/logger';

const TRANSLATE_API_BASE = 'https://translation.googleapis.com/language/translate/v2';
const cache: TranslationCache = {};

/**
 * Builds a cache key for a translation lookup.
 * @param text - Source text
 * @param targetLang - Target language code
 * @returns Unique cache key string
 */
function buildCacheKey(text: string, targetLang: LanguageCode): string {
  return `${targetLang}:${text}`;
}

/**
 * Translates a single text string into the target language using
 * the Google Cloud Translation API v2.
 *
 * @param text - The source text to translate
 * @param targetLang - BCP-47 language code (e.g., 'hi', 'es')
 * @param sourceLang - Optional source language code; auto-detected if omitted
 * @returns TranslationResult with translatedText (or original on failure)
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang?: LanguageCode,
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: text };
  }

  // English text destined for English — no-op
  if (targetLang === 'en' && (!sourceLang || sourceLang === 'en')) {
    return { translatedText: text };
  }

  const cacheKey = buildCacheKey(text, targetLang);
  if (cache[cacheKey]) {
    return { translatedText: cache[cacheKey] };
  }

  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined;
  if (!apiKey) {
    logger.warn('[Translate] API key not configured. Returning original text.');
    return { translatedText: text };
  }

  const url = new URL(TRANSLATE_API_BASE);
  url.searchParams.set('key', apiKey);

  const body: Record<string, string> = {
    q: text,
    target: targetLang,
    format: 'text',
  };
  if (sourceLang) body['source'] = sourceLang;

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      data: {
        translations: Array<{
          translatedText: string;
          detectedSourceLanguage?: string;
        }>;
      };
    };

    const [translation] = data.data.translations;
    const result: TranslationResult = {
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
    };

    // Cache result to avoid redundant API calls
    cache[cacheKey] = result.translatedText;
    return result;
  } catch (err: unknown) {
    logger.error('[Translate] API call failed, returning original text:', err);
    return { translatedText: text };
  }
}

/**
 * Translates multiple texts in a single batch request.
 * Falls back to individual translations if batch fails.
 *
 * @param texts - Array of source strings to translate
 * @param targetLang - Target language code
 * @returns Array of translated strings (same order as input)
 */
export async function translateBatch(
  texts: string[],
  targetLang: LanguageCode,
): Promise<string[]> {
  if (targetLang === 'en') return texts;

  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined;
  if (!apiKey) {
    logger.warn('[Translate] API key not configured. Returning originals.');
    return texts;
  }

  // Check cache first — only call API for uncached texts
  const uncachedIndices: number[] = [];
  const results: string[] = texts.map((text, i) => {
    const cached = cache[buildCacheKey(text, targetLang)];
    if (!cached) uncachedIndices.push(i);
    return cached ?? text;
  });

  if (uncachedIndices.length === 0) return results;

  const url = new URL(TRANSLATE_API_BASE);
  url.searchParams.set('key', apiKey);

  const body = {
    q: uncachedIndices.map((i) => texts[i]),
    target: targetLang,
    format: 'text',
  };

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      data: { translations: Array<{ translatedText: string }> };
    };

    data.data.translations.forEach((t, idx) => {
      const originalIndex = uncachedIndices[idx];
      results[originalIndex] = t.translatedText;
      cache[buildCacheKey(texts[originalIndex], targetLang)] = t.translatedText;
    });

    return results;
  } catch (err: unknown) {
    logger.error('[Translate] Batch API call failed:', err);
    return texts; // Graceful fallback
  }
}

/** Clears the in-memory translation cache (useful for testing). */
export function clearTranslationCache(): void {
  Object.keys(cache).forEach((key) => delete cache[key]);
}
