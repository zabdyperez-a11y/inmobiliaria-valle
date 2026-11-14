import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FormError } from '../components/Form';
import { fechaCorta } from '../lib/format';
import type { Lead } from '../types';

const TIPO: Record<string, string> = { visita: 'Visita', vender: 'Vender', contacto: 'Contacto' };

export function Leads({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<(Lead & { propiedades?: { nombre: string; slug: string } | null })[] | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let q = sb.from('leads').select('*, propiedades(nombre, slug)').order('created_at', { ascending: false }).limit(300);
    if (filter) q = q.eq('tipo', filter);
    q.then(({ data, error }) => (error ? setError('No se pudieron cargar los leads.') : setRows(data as never)));
  }, [sb, filter]);

  const setEstado = async (id: string, estado: Lead['estado']) => {
    await sb.from('leads').update({ estado }).eq('id', id);
    setRows((r) => r!.map((x) => (x.id === id ? { ...x, estado } : x)));
  };

  const openPhoto = async (path: string) => {
    const { data } = await sb.storage.from('fotos-vendedores').createSignedUrl(path, 600);
    if (data) window.open(data.signedUrl, '_blank', 'noopener');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Leads</h1>
        <select className="field min-h-tap w-auto py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos</option>
          <option value="visita">Visitas</option>
          <option value="vender">Quieren vender</option>
          <option value="contacto">Contacto</option>
        </select>
      </div>
      {error && <div className="mt-4"><FormError message={error} /></div>}
      {!rows ? (
        <p className="mt-6 text-muted">Cargando…</p>
      ) : !rows.length ? (
        <p className="mt-6 text-muted">Todavía no hay leads.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((l) => {
            const datos = { ...l.datos } as Record<string, unknown>;
            const fotos = (datos.fotos as string[] | undefined) ?? [];
            delete datos.fotos;
            delete datos.slug;
            const utm = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ');
            return (
              <li key={l.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">{fechaCorta(l.created_at)} · <strong className="text-ink">{TIPO[l.tipo]}</strong></p>
                    <p className="mt-1 text-lg font-semibold">{l.nombre}</p>
                    <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="font-semibold tabular">{l.whatsapp}</a>
                  </div>
                  <select className="field min-h-tap w-auto py-1.5 text-sm" value={l.estado} onChange={(e) => setEstado(l.id, e.target.value as Lead['estado'])} aria-label="Estado">
                    <option value="nuevo">Nuevo</option>
                    <option value="contactado">Contactado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                {l.propiedades && <p className="mt-2">Casa: <a href={`/propiedades/${l.propiedades.slug}`} target="_blank" rel="noopener">{l.propiedades.nombre}</a></p>}
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  {Object.entries(datos).filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                    <div key={k} className="flex gap-2"><dt className="text-muted">{k.replace(/_/g, ' ')}:</dt><dd>{String(v)}</dd></div>
                  ))}
                </dl>
                {fotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fotos.map((f, i) => <button key={f} type="button" className="chip" onClick={() => openPhoto(f)}>Foto {i + 1}</button>)}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted">Origen: {utm || 'directo'} · {l.pagina_origen}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
