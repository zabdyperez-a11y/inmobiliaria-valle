import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StatusBadge } from '../components/Badges';
import { FormError } from '../components/Form';
import { precioTexto } from '../lib/format';
import { photoUrl } from '../lib/images';
import { invalidateProperties } from '../lib/properties';
import type { Estatus, Propiedad } from '../types';

export function PropertyList({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<Propiedad[] | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const { data, error } = await sb.from('propiedades').select('*').order('fecha_publicacion', { ascending: false });
    if (error) setError('No se pudieron cargar. ¿Tu usuario está en la tabla admins?');
    else setRows(data as Propiedad[]);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (p: Propiedad, estatus: Estatus) => {
    const patch: Partial<Propiedad> = { estatus, fecha_vendida: estatus === 'vendida' ? (p.fecha_vendida ?? new Date().toISOString().slice(0, 10)) : null };
    const { error } = await sb.from('propiedades').update(patch).eq('id', p.id);
    if (error) return setError('No se pudo cambiar el estatus.');
    invalidateProperties();
    setRows((r) => r!.map((x) => (x.id === p.id ? { ...x, ...patch } : x)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Propiedades</h1>
        <Link to="/admin/propiedades/nueva" className="btn-primary">Agregar propiedad</Link>
      </div>
      {error && <div className="mt-4"><FormError message={error} /></div>}
      {!rows ? (
        <p className="mt-6 text-muted">Cargando…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-teal-50">
                {p.fotos[0] && <img src={photoUrl(p.fotos[0], 'sm')} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/propiedades/${p.id}`} className="font-semibold">{p.nombre}</Link>
                <p className="text-sm text-muted">{p.colonia} · {precioTexto(p)} · {p.fotos.length} fotos{p.destacada ? ' · Destacada' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge estatus={p.estatus} />
                <label className="sr-only" htmlFor={`st-${p.id}`}>Estatus</label>
                <select id={`st-${p.id}`} className="field min-h-tap w-auto py-1.5 text-sm" value={p.estatus} onChange={(e) => setStatus(p, e.target.value as Estatus)}>
                  <option value="disponible">Disponible</option>
                  <option value="apartada">Apartada</option>
                  <option value="vendida">Vendida</option>
                </select>
                <a href={`/propiedades/${p.slug}`} target="_blank" rel="noopener" className="btn-ghost min-h-tap text-sm">Ver</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
