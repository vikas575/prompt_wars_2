// src/hooks/useElectionData.test.ts
/**
 * @fileoverview Unit tests for useElectionData hook.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useElectionData } from './useElectionData';

// Mock the store to control selected country
vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn((selector: (s: { selectedCountry: string }) => string) =>
    selector({ selectedCountry: 'IN' }),
  ),
}));

describe('useElectionData', () => {
  it('returns data for the selected country (IN)', () => {
    const { result } = renderHook(() => useElectionData());
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.country).toBe('IN');
    expect(result.current.country).toBe('IN');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns timeline events for India', () => {
    const { result } = renderHook(() => useElectionData());
    expect(result.current.data?.timeline.length).toBeGreaterThan(0);
  });

  it('returns quiz questions for India', () => {
    const { result } = renderHook(() => useElectionData());
    expect(result.current.data?.quizQuestions.length).toBeGreaterThan(0);
  });

  it('returns myths for India', () => {
    const { result } = renderHook(() => useElectionData());
    expect(result.current.data?.myths.length).toBeGreaterThan(0);
  });

  it('returns null and error for unknown country', async () => {
    const { useAppStore } = await import('@/store/appStore');
    vi.mocked(useAppStore).mockImplementationOnce(
      (selector: (state: any) => any) =>
        selector({ selectedCountry: 'XX' }),
    );

    const { result } = renderHook(() => useElectionData());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain('XX');
  });
});
