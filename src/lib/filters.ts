import type { Credito, Estatus, Propiedad } from '../types';

export interface Filters {
  zona: string; // colonia o municipio
  min: number | null;
  max: number | null;
  rec: number | null; // recámaras mínimas
  credito: Credito[];
  estatus: Estatus[];
  orden: 'recientes' | 'precio-asc' | 'precio-desc';
}

export const DEFAULT_ESTATUS: Estatus[] = ['disponible', 'apartada'];

export function parseFilters(sp: URLSearchParams): Filters {
  const num = (k: string) => {
    const v = Number(sp.get(k));
    return sp.get(k) && Number.isFinite(v) ? v : null;
  };
  const list = <T extends string>(k: string, allowed: readonly T[]) =>
    (sp.get(k) ?? '').split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));
  const estatus = list('estatus', ['disponible', 'apartada', 'vendida'] as const);
  const orden = sp.get('orden');
  return {
    zona: sp.get('zona') ?? '',
    min: num('min'),
    max: num('max'),
    rec: num('rec'),
    credito: list('credito', ['infonavit', 'fovissste', 'bancario', 'contado'] as const),
    estatus: estatus.length ? estatus : DEFAULT_ESTATUS,
    orden: orden === 'precio-asc' || orden === 'precio-desc' ? orden : 'recientes',
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.zona) sp.set('zona', f.zona);
  if (f.min != null) sp.set('min', String(f.min));
  if (f.max != null) sp.set('max', String(f.max));
  if (f.rec != null) sp.set('rec', String(f.rec));
  if (f.credito.length) sp.set('credito', f.credito.join(','));
  const isDefault = f.estatus.length === DEFAULT_ESTATUS.length && DEFAULT_ESTATUS.every((e) => f.estatus.includes(e));
  if (!isDefault) sp.set('estatus', f.estatus.join(','));
  if (f.orden !== 'recientes') sp.set('orden', f.orden);
  return sp;
}

export function applyFilters(all: Propiedad[], f: Filters) {
  const z = f.zona.toLowerCase();
  const rows = all.filter((p) => {
    if (z && p.colonia.toLowerCase() !== z && p.municipio.toLowerCase() !== z) return false;
    if (!f.estatus.includes(p.estatus)) return false;
    if (f.rec != null && (p.recamaras ?? 0) < f.rec) return false;
    if (f.credito.length && !f.credito.some((c) => p.creditos.includes(c))) return false;
    if (f.min != null || f.max != null) {
      if (p.precio == null) return false;
      if (f.min != null && p.precio < f.min) return false;
      if (f.max != null && p.precio > f.max) return false;
    }
    return true;
  });
  const price = (p: Propiedad) => p.precio ?? Number.POSITIVE_INFINITY;
  if (f.orden === 'precio-asc') rows.sort((a, b) => price(a) - price(b));
  else if (f.orden === 'precio-desc') rows.sort((a, b) => (b.precio ?? -1) - (a.precio ?? -1));
  else rows.sort((a, b) => b.fecha_publicacion.localeCompare(a.fecha_publicacion) || Number(b.destacada) - Number(a.destacada));
  return rows;
}

export function countActive(f: Filters) {
  const estatusChanged = filtersToParams({ ...f, zona: '', min: null, max: null, rec: null, credito: [], orden: 'recientes' }).has('estatus');
  return [Boolean(f.zona), f.min != null || f.max != null, f.rec != null, f.credito.length > 0, estatusChanged].filter(Boolean).length;
}

/** Rangos de presupuesto, los mismos en la búsqueda rápida y en los filtros. */
export const PRESUPUESTOS = [
  { label: 'Cualquier precio', min: null, max: null },
  { label: 'Hasta $1,000,000', min: null, max: 1_000_000 },
  { label: '$1 a $2 millones', min: 1_000_000, max: 2_000_000 },
  { label: '$2 a $3 millones', min: 2_000_000, max: 3_000_000 },
  { label: 'Más de $3 millones', min: 3_000_000, max: null },
] as const;

export function zonas(all: Propiedad[]) {
  const set = new Set<string>();
  for (const p of all) {
    if (p.colonia && !p.colonia.startsWith('[')) set.add(p.colonia);
    if (p.municipio && !p.municipio.startsWith('[')) set.add(p.municipio);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export function describeFilters(f: Filters) {
  const parts: string[] = [];
  if (f.zona) parts.push(`en ${f.zona}`);
  const p = PRESUPUESTOS.find((x) => x.min === f.min && x.max === f.max);
  if (p && (f.min != null || f.max != null)) parts.push(p.label.toLowerCase());
  if (f.rec) parts.push(`de ${f.rec} recámaras o más`);
  if (f.credito.length) parts.push(`con ${f.credito.map((c) => (c === 'contado' ? 'pago de contado' : `crédito ${c[0].toUpperCase()}${c.slice(1)}`)).join(' o ')}`);
  return parts.join(', ');
}
