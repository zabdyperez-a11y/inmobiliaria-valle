import { useEffect, useRef } from 'react';
import { palette } from '../config/palette.js';

/** Mapa con zona aproximada (círculo de ~350 m). Con mostrar_direccion = true pone un punto exacto. */
export function MapApprox({ lat, lng, exact }: { lat: number; lng: number; exact: boolean }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | undefined;
    let cancelled = false;
    // Solo se carga cuando el mapa está cerca de la pantalla.
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || map) return;
      io.disconnect();
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], exact ? 16 : 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      if (exact) L.circleMarker([lat, lng], { radius: 9, color: palette.teal[900], fillColor: palette.teal[500], fillOpacity: 1, weight: 3 }).addTo(map);
      else L.circle([lat, lng], { radius: 350, color: palette.teal[900], weight: 2, fillColor: palette.teal[500], fillOpacity: 0.18 }).addTo(map);
    }, { rootMargin: '200px' });
    if (el.current) io.observe(el.current);
    return () => {
      cancelled = true;
      io.disconnect();
      map?.remove();
    };
  }, [lat, lng, exact]);

  return <div ref={el} className="aspect-[4/3] w-full overflow-hidden rounded-card border border-line bg-teal-50 sm:aspect-[16/9]" role="region" aria-label="Mapa de la zona" />;
}
