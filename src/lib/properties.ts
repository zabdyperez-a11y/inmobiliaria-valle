import { useEffect, useState } from 'react';
import seed from '../data/seed.json';
import type { Propiedad } from '../types';
import { getSupabase, hasSupabase } from './supabase';

/** Columnas públicas. La vista propiedades_publicas ya oculta la dirección cuando no se debe mostrar. */
let cache: Propiedad[] | null = null;
let pending: Promise<Propiedad[]> | null = null;

function normalize(rows: Partial<Propiedad>[]): Propiedad[] {
  return rows.map((r) => ({
    ...(r as Propiedad),
    caracteristicas: r.caracteristicas ?? [],
    creditos: r.creditos ?? [],
    cerca_de: r.cerca_de ?? [],
    // Sin fotos repetidas.
    fotos: Array.from(new Set(r.fotos ?? [])),
    // La dirección privada nunca sale de los datos de ejemplo.
    direccion: r.mostrar_direccion ? (r.direccion ?? null) : null,
  }));
}

export function loadProperties(): Promise<Propiedad[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = (async () => {
      if (!hasSupabase) return normalize(seed as Partial<Propiedad>[]);
      const sb = await getSupabase();
      const { data, error } = await sb.from('propiedades_publicas').select('*');
      if (error) throw error;
      return normalize(data ?? []);
    })()
      .then((rows) => (cache = rows))
      .catch((e) => {
        pending = null;
        throw e;
      });
  }
  return pending;
}

export function useProperties() {
  const [data, setData] = useState<Propiedad[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadProperties()
      .then((rows) => alive && setData(rows))
      .catch(() => alive && setError('No pude cargar las casas. Revisa tu conexión e intenta de nuevo.'));
    return () => {
      alive = false;
    };
  }, []);
  return { data, error, loading: !data && !error };
}

export function invalidateProperties() {
  cache = null;
  pending = null;
}

/** Recientes primero; las destacadas arriba cuando se pide. */
export function byRecent(a: Propiedad, b: Propiedad) {
  return b.fecha_publicacion.localeCompare(a.fecha_publicacion);
}

export function similarTo(p: Propiedad, all: Propiedad[], max = 3) {
  const near = (o: Propiedad) =>
    p.precio != null && o.precio != null && Math.abs(o.precio - p.precio) <= p.precio * 0.2;
  return all
    .filter((o) => o.id !== p.id && o.estatus !== 'vendida' && (o.colonia === p.colonia || near(o)))
    .sort((a, b) => Number(b.colonia === p.colonia) - Number(a.colonia === p.colonia) || byRecent(a, b))
    .slice(0, max);
}
