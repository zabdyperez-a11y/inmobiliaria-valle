import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filtersToParams, parseFilters, PRESUPUESTOS } from '../lib/filters';
import { track } from '../lib/track';

export function QuickSearch({ zonas }: { zonas: string[] }) {
  const navigate = useNavigate();
  const [zona, setZona] = useState('');
  const [pres, setPres] = useState(0);
  const [rec, setRec] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = parseFilters(new URLSearchParams());
    const p = PRESUPUESTOS[pres];
    const filters = { ...f, zona, min: p.min, max: p.max, rec: rec ? Number(rec) : null };
    if (zona) track('filter_used', { filter: 'zona', value: zona, source: 'home' });
    if (pres) track('filter_used', { filter: 'presupuesto', value: p.label, source: 'home' });
    if (rec) track('filter_used', { filter: 'recamaras', value: rec, source: 'home' });
    const qs = filtersToParams(filters).toString();
    navigate(`/propiedades${qs ? `?${qs}` : ''}`);
  };

  return (
    <form onSubmit={submit} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_0.7fr_auto] sm:items-end sm:p-5" aria-label="Buscar casas">
      <div>
        <label htmlFor="qs-zona" className="label">Colonia o municipio</label>
        <select id="qs-zona" className="field" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="qs-pres" className="label">Presupuesto</label>
        <select id="qs-pres" className="field" value={pres} onChange={(e) => setPres(Number(e.target.value))}>
          {PRESUPUESTOS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="qs-rec" className="label">Recámaras</label>
        <select id="qs-rec" className="field" value={rec} onChange={(e) => setRec(e.target.value)}>
          <option value="">Las que sean</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} o más</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary">Buscar casas</button>
    </form>
  );
}
