// src/hooks/useTranslation.ts
/**
 * @fileoverview Custom hook for translating text using the Google Translate service.
 * Provides debounced translation with loading/error state management.
 * Used by every content section to support multi-language display.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { translateText, translateBatch } from '@/services/googleTranslate';
import { useAppStore } from '@/store/appStore';
import type { LanguageCode } from '@/types';

export interface UseTranslationReturn {
  translate: (text: string) => Promise<string>;
  translateMany: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
  error: string | null;
  currentLanguage: LanguageCode;
}

/**
 * Provides translation utilities bound to the user's selected language.
 * Auto-cancels in-flight requests when language changes or component unmounts.
 *
 * @returns Translation functions, loading state, and current language
 */
export function useTranslation(): UseTranslationReturn {
  const selectedLanguage = useAppStore((s) => s.selectedLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<boolean>(false);

  // Reset abort flag on language change
  useEffect(() => {
    abortRef.current = false;
    return () => {
      abortRef.current = true;
    };
  }, [selectedLanguage]);

  /**
   * Translates a single text string to the currently selected language.
   * @param text - Source text
   * @returns Translated string
   */
  const translate = useCallback(
    async (text: string): Promise<string> => {
      if (selectedLanguage === 'en') return text;
      setIsTranslating(true);
      setError(null);
      try {
        const result = await translateText(text, selectedLanguage);
        if (!abortRef.current) {
          return result.translatedText;
        }
        return text;
      } catch (err: unknown) {
        if (!abortRef.current) {
          setError('Translation failed. Showing original text.');
        }
        return text;
      } finally {
        if (!abortRef.current) {
          setIsTranslating(false);
        }
      }
    },
    [selectedLanguage],
  );

  /**
   * Translates an array of text strings in one batch request.
   * @param texts - Array of source strings
   * @returns Array of translated strings
   */
  const translateMany = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (selectedLanguage === 'en') return texts;
      setIsTranslating(true);
      setError(null);
      try {
        const { translateBatch: batch } = await import('@/services/googleTranslate');
        const results = await batch(texts, selectedLanguage);
        if (!abortRef.current) {
          return results;
        }
        return texts;
      } catch (err: unknown) {
        if (!abortRef.current) {
          setError('Batch translation failed.');
        }
        return texts;
      } finally {
        if (!abortRef.current) {
          setIsTranslating(false);
        }
      }
    },
    [selectedLanguage],
  );

  return { translate, translateMany, isTranslating, error, currentLanguage: selectedLanguage };
}

// Re-export for convenience
export { translateBatch };
