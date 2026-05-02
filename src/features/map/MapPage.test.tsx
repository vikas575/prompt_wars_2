// src/features/map/MapPage.test.tsx
/**
 * @fileoverview Tests for the MapPage component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MapPage } from './MapPage';

vi.mock('@/services/googleMaps', () => ({
  loadGoogleMapsSDK: vi.fn().mockResolvedValue(undefined),
  initMap: vi.fn().mockReturnValue({}),
  addStationMarkers: vi.fn().mockReturnValue([]),
  clearMarkers: vi.fn(),
  getUserLocation: vi.fn(),
  getInitialMapState: vi.fn(() => ({
    userLocation: null,
    nearbyStations: [],
    selectedStation: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/utils/logger', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import * as mapsService from '@/services/googleMaps';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mapsService.getInitialMapState).mockReturnValue({
    userLocation: null,
    nearbyStations: [],
    selectedStation: null,
    isLoading: false,
    error: null,
  });
});

describe('MapPage', () => {
  it('renders the page heading', () => {
    render(<MapPage />);
    expect(screen.getByRole('heading', { name: /find your polling station/i })).toBeInTheDocument();
  });

  it('renders the Locate Me button', () => {
    render(<MapPage />);
    expect(screen.getByRole('button', { name: /find polling stations near my location/i })).toBeInTheDocument();
  });

  it('renders the map container', () => {
    render(<MapPage />);
    expect(screen.getByRole('application', { name: /interactive map/i })).toBeInTheDocument();
  });

  it('shows nearby stations after successful geolocation', async () => {
    vi.mocked(mapsService.getUserLocation).mockResolvedValueOnce({ lat: 28.6, lng: 77.2 });
    render(<MapPage />);
    fireEvent.click(screen.getByRole('button', { name: /find polling stations near my location/i }));
    await waitFor(() => {
      expect(screen.getByText('Community Hall Booth 1')).toBeInTheDocument();
    });
  });

  it('shows error message when geolocation fails', async () => {
    vi.mocked(mapsService.getUserLocation).mockRejectedValueOnce(new Error('Permission denied'));
    render(<MapPage />);
    fireEvent.click(screen.getByRole('button', { name: /find polling stations near my location/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows station details when a station is clicked from list', async () => {
    vi.mocked(mapsService.getUserLocation).mockResolvedValueOnce({ lat: 28.6, lng: 77.2 });
    render(<MapPage />);
    fireEvent.click(screen.getByRole('button', { name: /find polling stations near my location/i }));
    await waitFor(() => screen.getByText('Community Hall Booth 1'));
    fireEvent.click(screen.getByRole('button', { name: /view details for community hall booth 1/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('12 Main Street, Central District')).toBeInTheDocument();
  });

  it('closes station details when close button is clicked', async () => {
    vi.mocked(mapsService.getUserLocation).mockResolvedValueOnce({ lat: 28.6, lng: 77.2 });
    render(<MapPage />);
    fireEvent.click(screen.getByRole('button', { name: /find polling stations near my location/i }));
    await waitFor(() => screen.getByText('Community Hall Booth 1'));
    fireEvent.click(screen.getByRole('button', { name: /view details for community hall booth 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /close station details/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
