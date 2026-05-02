// src/services/googleMaps.ts
/**
 * @fileoverview Google Maps JavaScript API service for polling station locator.
 *
 * Why Google Maps?
 * Knowing where to vote is the #1 barrier to civic participation. This service
 * initialises the Maps SDK dynamically (to avoid blocking page load), geocodes the
 * user's location, and renders nearby polling station markers on an interactive map.
 *
 * API key sourced from VITE_GOOGLE_MAPS_API_KEY environment variable.
 */

import type { PollingStation, MapState } from '@/types';
import { logger } from '@/utils/logger';

const MAPS_SCRIPT_ID = 'google-maps-sdk';

/**
 * Dynamically loads the Google Maps JavaScript API script into the document.
 * Resolves once the script has loaded, rejects on failure or missing API key.
 *
 * @returns Promise that resolves when Maps SDK is ready
 */
export function loadGoogleMapsSDK(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    if (document.getElementById(MAPS_SCRIPT_ID)) {
      // Script already injected — wait for it
      const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement;
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Maps SDK failed to load')));
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) {
      reject(new Error('[Maps] VITE_GOOGLE_MAPS_API_KEY is not configured.'));
      return;
    }

    const script = document.createElement('script');
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('[Maps] Failed to load Google Maps SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Initialises a Google Map instance in the given container element.
 *
 * @param container - The HTML div element to render the map into
 * @param center - Initial map centre coordinates
 * @param zoom - Initial zoom level (default: 13)
 * @returns Initialised google.maps.Map instance
 */
export function initMap(
  container: HTMLDivElement,
  center: google.maps.LatLngLiteral,
  zoom = 13,
): google.maps.Map {
  return new google.maps.Map(container, {
    center,
    zoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    ],
  });
}

/**
 * Adds marker pins for each polling station on the given map.
 *
 * @param map - Initialised Google Map instance
 * @param stations - Array of polling stations to display
 * @param onSelect - Callback fired when user clicks a station marker
 * @returns Array of created marker instances (for cleanup)
 */
export function addStationMarkers(
  map: google.maps.Map,
  stations: PollingStation[],
  onSelect: (station: PollingStation) => void,
): google.maps.Marker[] {
  return stations.map((station) => {
    const marker = new google.maps.Marker({
      position: { lat: station.lat, lng: station.lng },
      map,
      title: station.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#6366f1" stroke="white" stroke-width="2"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-size="14">🗳️</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(36, 36),
      },
    });
    marker.addListener('click', () => onSelect(station));
    return marker;
  });
}

/**
 * Removes all markers from the map and clears the array.
 * @param markers - Marker instances to remove
 */
export function clearMarkers(markers: google.maps.Marker[]): void {
  markers.forEach((m) => m.setMap(null));
  markers.length = 0;
}

/**
 * Gets the user's current geolocation using the browser Geolocation API.
 *
 * @returns Promise resolving to lat/lng coordinates
 */
export function getUserLocation(): Promise<google.maps.LatLngLiteral> {
  return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        logger.warn('[Maps] Geolocation error:', err.message);
        reject(new Error(err.message));
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/**
 * Returns the initial map state with loading=true.
 */
export function getInitialMapState(): MapState {
  return {
    userLocation: null,
    nearbyStations: [],
    selectedStation: null,
    isLoading: false,
    error: null,
  };
}
