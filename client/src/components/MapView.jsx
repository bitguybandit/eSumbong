import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { makeMapIcon } from '../lib/mapIcon';

export default function MapView({ latitude, longitude, heightClass = 'h-56' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || latitude == null || longitude == null) return undefined;

    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([latitude, longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker([latitude, longitude], { icon: makeMapIcon() }).addTo(map);

    return () => map.remove();
  }, [latitude, longitude]);

  return <div ref={ref} className={`${heightClass} w-full rounded-lg border border-slate-200`} />;
}
