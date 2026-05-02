// src/hooks/useElectionData.ts
/**
 * @fileoverview Custom hook for accessing country-specific election data.
 * Reads from the static data store, filtered by the currently selected country.
 * Memoised to avoid unnecessary re-renders.
 */
import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { ELECTION_DATA } from '@/data/electionData';
import type { ElectionData, Country } from '@/types';

export interface UseElectionDataReturn {
  data: ElectionData | null;
  country: Country;
  isLoading: boolean;
  error: string | null;
}

/**
 * Returns election data for the currently selected country.
 * Falls back to null with an error message if data is not found.
 *
 * @returns Election data object, loading state, and error message
 */
export function useElectionData(): UseElectionDataReturn {
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  const result = useMemo<UseElectionDataReturn>(() => {
    const data = ELECTION_DATA[selectedCountry] ?? null;
    return {
      data,
      country: selectedCountry,
      isLoading: false,
      error: data ? null : `No election data available for country: ${selectedCountry}`,
    };
  }, [selectedCountry]);

  return result;
}
