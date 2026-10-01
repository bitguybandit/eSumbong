import L from 'leaflet';

/** Custom SVG pin divIcon — avoids bundler issues with Leaflet's default icons. */
export function makeMapIcon(color = '#1d4ed8') {
  return L.divIcon({
    className: 'esumbong-map-pin',
    html: `<svg width="32" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,.35))">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
}
