// src/store/appStore.ts
/**
 * @fileoverview Zustand global state store for the Election Process Education Assistant.
 * Manages user session, country selection, language preference, and TTS playback state.
 * Uses Zustand's recommended pattern for typed stores with no implicit any.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppStore, Country, LanguageCode, TTSState, UserProfile } from '@/types';

const initialTTSState: TTSState = {
  isPlaying: false,
  isPaused: false,
  currentSectionId: null,
};

/**
 * Global Zustand store.
 * Persisted to localStorage so user preferences survive page refreshes.
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      selectedCountry: 'IN' as Country,
      selectedLanguage: 'en' as LanguageCode,
      ttsState: initialTTSState,
      isDemoMode: import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'dummy-key' || 
                  import.meta.env.VITE_FIREBASE_API_KEY === 'dummy-key',

      /**
       * Sets or clears the authenticated user profile.
       * @param user - UserProfile or null to sign out
       */
      setUser: (user: UserProfile | null) => set({ user }),

      /**
       * Updates the selected country for election content.
       * @param country - Country code ('IN' | 'US' | 'UK')
       */
      setCountry: (country: Country) => set({ selectedCountry: country }),

      /**
       * Updates the user's preferred display language.
       * @param lang - BCP-47 language code
       */
      setLanguage: (lang: LanguageCode) => set({ selectedLanguage: lang }),

      /**
       * Partially updates the TTS playback state.
       * @param state - Partial TTSState to merge
       */
      setTTSState: (state: Partial<TTSState>) =>
        set((prev) => ({ ttsState: { ...prev.ttsState, ...state } })),
    }),
    {
      name: 'election-edu-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
        selectedLanguage: state.selectedLanguage,
      }),
    },
  ),
);
