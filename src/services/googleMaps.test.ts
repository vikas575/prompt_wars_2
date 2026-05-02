// src/services/googleMaps.test.ts
/**
 * @fileoverview Unit tests for the Google Maps service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadGoogleMapsSDK, getUserLocation, getInitialMapState } from './googleMaps';

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-maps-key');
  // Remove any injected script tags
  document.getElementById('google-maps-sdk')?.remove();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('loadGoogleMapsSDK', () => {
  it('rejects when API key is not configured', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    await expect(loadGoogleMapsSDK()).rejects.toThrow('VITE_GOOGLE_MAPS_API_KEY is not configured');
  });

  it('resolves immediately if google.maps is already loaded', async () => {
    Object.defineProperty(window, 'google', {
      value: { maps: {} },
      writable: true,
      configurable: true,
    });
    await expect(loadGoogleMapsSDK()).resolves.toBeUndefined();
    // Cleanup
    Object.defineProperty(window, 'google', { value: undefined, writable: true, configurable: true });
  });

  it('injects a script tag with correct src', () => {
    // Don't await — just check the DOM effect synchronously
    void loadGoogleMapsSDK().catch(() => {/* expected in test env */});
    const script = document.getElementById('google-maps-sdk') as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain('maps.googleapis.com');
    expect(script?.src).toContain('test-maps-key');
  });

  it('does not inject duplicate script tags', () => {
    void loadGoogleMapsSDK().catch(() => {/* expected */});
    void loadGoogleMapsSDK().catch(() => {/* expected */});
    const scripts = document.querySelectorAll('#google-maps-sdk');
    expect(scripts.length).toBe(1);
  });
});

describe('getUserLocation', () => {
  it('resolves with lat/lng on success', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success({
          coords: { latitude: 28.6139, longitude: 77.209 },
        } as GeolocationPosition);
      }),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    const result = await getUserLocation();
    expect(result).toEqual({ lat: 28.6139, lng: 77.209 });
  });

  it('rejects when geolocation fails', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn(
        (_: PositionCallback, error: PositionErrorCallback) => {
          error({ message: 'Permission denied', code: 1 } as GeolocationPositionError);
        },
      ),
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    await expect(getUserLocation()).rejects.toThrow('Permission denied');
  });

  it('rejects when geolocation API is not available', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    await expect(getUserLocation()).rejects.toThrow('not supported');
  });
});

describe('getInitialMapState', () => {
  it('returns correct initial state shape', () => {
    const state = getInitialMapState();
    expect(state.userLocation).toBeNull();
    expect(state.nearbyStations).toEqual([]);
    expect(state.selectedStation).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
