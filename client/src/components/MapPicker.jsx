import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { makeMapIcon } from '../lib/mapIcon';

const DEFAULT_CENTER = [10.7185, 122.5695]; // San Isidro, Iloilo

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000, // Wait max 10 seconds
  maximumAge: 0,
};

const GEO_ERROR_MESSAGES = {
  1: 'Location access denied. Please check your browser settings.',
  2: 'Location unavailable right now. Please try again or drop a pin manually.',
  3: 'Location request timed out. Please try again or drop a pin manually.',
};

export default function MapPicker({ position, onPositionChange, onLocationText, heightClass = 'h-64' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geoTimeout = useRef(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const onPositionChangeRef = useRef(onPositionChange);
  const onLocationTextRef = useRef(onLocationText);
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);
  useEffect(() => {
    onLocationTextRef.current = onLocationText;
  }, [onLocationText]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current).setView(DEFAULT_CENTER, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const placeMarker = (latlng) => {
      if (!markerRef.current) {
        markerRef.current = L.marker(latlng, { icon: makeMapIcon(), draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const p = markerRef.current.getLatLng();
          onPositionChangeRef.current?.({ lat: p.lat, lng: p.lng });
          reverseGeocode(p.lat, p.lng);
        });
      } else {
        markerRef.current.setLatLng(latlng);
      }
    };

    map.on('click', (e) => {
      placeMarker(e.latlng);
      onPositionChangeRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      reverseGeocode(e.latlng.lat, e.latlng.lng);
      // Manual pin placement supersedes any geolocation failure notice.
      setGeoError('');
    });

    mapRef.current = { map, placeMarker };

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Keep the marker in sync when the position changes externally.
  useEffect(() => {
    const ref = mapRef.current;
    if (ref && position) {
      ref.placeMarker(L.latLng(position.lat, position.lng));
      ref.map.setView([position.lat, position.lng], Math.max(ref.map.getZoom(), 16));
    }
  }, [position]);

  function reverseGeocode(lat, lng) {
    clearTimeout(geoTimeout.current);
    geoTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
        );
        const data = await res.json();
        if (data?.display_name) onLocationTextRef.current?.(data.display_name);
      } catch {
        /* geocoding is best-effort */
      }
    }, 700);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser. Please drop a pin manually.');
      return;
    }

    setLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocating(false);
        const ref = mapRef.current;
        if (ref) {
          ref.placeMarker(L.latLng(latitude, longitude));
          ref.map.setView([latitude, longitude], 16);
          onPositionChangeRef.current?.({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        }
      },
      (error) => {
        setLocating(false);
        setGeoError(
          GEO_ERROR_MESSAGES[error?.code] ??
            'Unable to get your location. Please try again or drop a pin manually.'
        );
      },
      GEO_OPTIONS
    );
  }

  return (
    <div>
      <div ref={containerRef} className={`${heightClass} w-full rounded-lg border border-slate-300`} />
      {geoError && (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {geoError}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn-secondary" onClick={useMyLocation} disabled={locating}>
          {locating ? 'Locating...' : '📍 Use my location'}
        </button>
        {position ? (
          <span className="text-xs text-slate-500">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Click the map to set a location</span>
        )}
      </div>
    </div>
  );
}
