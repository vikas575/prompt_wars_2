// src/features/map/MapPage.tsx
/**
 * @fileoverview Polling Station Locator using Google Maps JavaScript API.
 * Loads the SDK dynamically, gets user geolocation, displays nearby stations.
 * Falls back gracefully if Maps fails to load or geolocation is denied.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  loadGoogleMapsSDK,
  initMap,
  addStationMarkers,
  clearMarkers,
  getUserLocation,
  getInitialMapState,
} from '@/services/googleMaps';
import type { MapState, PollingStation } from '@/types';
import { logger } from '@/utils/logger';

// ─── Mock Nearby Stations (would come from Firestore/API in production) ────
const MOCK_STATIONS: PollingStation[] = [
  {
    id: 's1',
    name: 'Community Hall Booth 1',
    address: '12 Main Street, Central District',
    lat: 28.6139,
    lng: 77.2090,
    openTime: '07:00',
    closeTime: '18:00',
    accessibilityFeatures: ['Wheelchair ramp', 'Braille ballot'],
  },
  {
    id: 's2',
    name: 'Government School Booth 4',
    address: '45 Park Avenue, North District',
    lat: 28.6200,
    lng: 77.2150,
    openTime: '07:00',
    closeTime: '18:00',
    accessibilityFeatures: ['Wheelchair ramp'],
  },
  {
    id: 's3',
    name: 'Town Council Office',
    address: '8 Council Road, East District',
    lat: 28.6100,
    lng: 77.2200,
    openTime: '07:00',
    closeTime: '18:00',
    accessibilityFeatures: ['Ramp', 'Assistance available'],
  },
];

/**
 * Station info card shown when a marker is clicked.
 */
const StationInfoCard: React.FC<{ station: PollingStation; onClose: () => void }> = ({
  station,
  onClose,
}) => (
  <div className="station-card" role="dialog" aria-label={`${station.name} details`} aria-modal="true">
    <button
      type="button"
      className="station-card__close"
      onClick={onClose}
      aria-label="Close station details"
    >
      ✕
    </button>
    <h3 className="station-card__name">{station.name}</h3>
    <p className="station-card__address">📍 {station.address}</p>
    <div className="station-card__hours">
      <span>⏰ {station.openTime} – {station.closeTime}</span>
    </div>
    {station.accessibilityFeatures.length > 0 && (
      <div className="station-card__accessibility">
        <h4>♿ Accessibility</h4>
        <ul>
          {station.accessibilityFeatures.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
    )}
  </div>
);

/**
 * Google Maps-powered polling station locator.
 * Requests geolocation, loads Maps SDK, renders markers for nearby stations.
 */
export const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapState, setMapState] = useState<MapState>(getInitialMapState());

  const handleStationSelect = useCallback((station: PollingStation) => {
    setMapState((prev) => ({ ...prev, selectedStation: station }));
  }, []);

  const handleCloseCard = useCallback(() => {
    setMapState((prev) => ({ ...prev, selectedStation: null }));
  }, []);

  const handleLocate = useCallback(async () => {
    setMapState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const location = await getUserLocation();
      setMapState((prev) => ({
        ...prev,
        userLocation: location,
        nearbyStations: MOCK_STATIONS,
        isLoading: false,
      }));

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(location);
        clearMarkers(markersRef.current);
        markersRef.current = addStationMarkers(
          mapInstanceRef.current,
          MOCK_STATIONS,
          handleStationSelect,
        );
      }
    } catch (err: unknown) {
      logger.warn('[MapPage] Geolocation failed:', err);
      setMapState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Could not get your location. Please allow location access and try again.',
      }));
    }
  }, [handleStationSelect]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadGoogleMapsSDK();
        if (cancelled || !mapContainerRef.current) return;

        const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi default
        mapInstanceRef.current = initMap(mapContainerRef.current, defaultCenter, 12);
      } catch (err: unknown) {
        if (!cancelled) {
          logger.error('[MapPage] Maps SDK failed to load:', err);
          setMapState((prev) => ({
            ...prev,
            error: 'Google Maps could not load. Please check your API key configuration.',
          }));
        }
      }
    };

    void init();
    return () => {
      cancelled = true;
      clearMarkers(markersRef.current);
    };
  }, []);

  return (
    <section className="map-page" aria-label="Polling station locator">
      <header className="map-page__header">
        <h1 className="map-page__title">📍 Find Your Polling Station</h1>
        <p className="map-page__subtitle">
          Click "Locate Me" to find polling stations near you.
        </p>
      </header>

      <div className="map-page__controls">
        <button
          type="button"
          id="locate-me-btn"
          className="btn btn--primary"
          onClick={() => void handleLocate()}
          disabled={mapState.isLoading}
          aria-busy={mapState.isLoading}
          aria-label="Find polling stations near my location"
        >
          {mapState.isLoading ? '⏳ Locating...' : '📍 Locate Me'}
        </button>

        {mapState.nearbyStations.length > 0 && (
          <span className="map-page__count" aria-live="polite">
            {mapState.nearbyStations.length} stations found nearby
          </span>
        )}
      </div>

      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'dummy-key' ? (
        <div className="map-page__mock" style={{ position: 'relative' }}>
          <div className="map-page__error map-page__error--info" role="alert" style={{ marginBottom: '1rem' }}>
            ℹ️ Running in <strong>Demo Mode</strong> with mock map data. Replace the API key in .env for live maps.
          </div>
          <div
            className="map-page__map-mock"
            style={{
              height: '450px',
              width: '100%',
              borderRadius: '12px',
              backgroundImage: 'url(/assets/demo-map.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            
            {/* Mock Markers */}
            {MOCK_STATIONS.map((s, idx) => {
              // High-spread coordinate mapping to fill the container
              // Center is 50%, 50%
              const xOffset = (s.lng - 77.2090) * 2000; // Increased scale from 800
              const yOffset = (28.6139 - s.lat) * 2000; // Increased scale from 800
              
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStationSelect(s);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${50 + xOffset}%`,
                    top: `${50 + yOffset}%`,
                    background: 'var(--color-primary)',
                    border: '2px solid white',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(99,102,241,0.6)',
                    zIndex: 20,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  className="mock-marker"
                  aria-label={`Select ${s.name}`}
                >
                  <span style={{ fontSize: '1.4rem' }}>🗳️</span>
                  <span 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-25px', 
                      whiteSpace: 'nowrap', 
                      fontSize: '0.75rem', 
                      background: 'rgba(15,15,26,0.9)', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    Booth {idx + 1}
                  </span>
                </button>
              );
            })}
            
            <div style={{ 
              position: 'absolute',
              top: '20px', // Moved from center to top
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5, 
              textAlign: 'center', 
              background: 'rgba(15,15,26,0.7)', 
              padding: '1rem 2rem', 
              borderRadius: '2rem', 
              backdropFilter: 'blur(8px)', 
              border: '1px solid var(--color-border)',
              pointerEvents: 'none'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Interactive Demo Map</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          id="google-map-container"
          className="map-page__map"
          aria-label="Interactive map showing polling stations"
          role="application"
          style={{ height: '450px', width: '100%', borderRadius: '12px' }}
        />
      )}

      {mapState.selectedStation && (
        <StationInfoCard
          station={mapState.selectedStation}
          onClose={handleCloseCard}
        />
      )}

      {mapState.nearbyStations.length > 0 && (
        <div className="map-page__list" aria-label="Nearby polling stations list">
          <h2 className="map-page__list-title">Nearby Stations</h2>
          <ul role="list">
            {mapState.nearbyStations.map((station) => (
              <li key={station.id}>
                <button
                  type="button"
                  className="station-list-item"
                  onClick={() => handleStationSelect(station)}
                  aria-label={`View details for ${station.name}`}
                >
                  <span className="station-list-item__name">{station.name}</span>
                  <span className="station-list-item__address">{station.address}</span>
                  <span className="station-list-item__hours">
                    {station.openTime} – {station.closeTime}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default MapPage;
