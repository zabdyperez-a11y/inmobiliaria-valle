import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FormError } from '../components/Form';
import { CREDITO_LABEL, TIPO_LABEL } from '../config/site';
import { photoUrl, toWebp } from '../lib/images';
import { invalidateProperties } from '../lib/properties';
import type { Credito, Propiedad } from '../types';

type Draft = Omit<Propiedad, 'id'> & { id?: string };

const EMPTY: Draft = {
  slug: '', nombre: '', tipo: 'casa', colonia: '', municipio: 'Guadalajara', direccion: '', mostrar_direccion: false,
  lat: null, lng: null, precio: null, precio_a_consultar: false, estatus: 'disponible', recamaras: null, banos: null,
  estacionamientos: null, plantas: null, m2_terreno: null, m2_construccion: null, caracteristicas: [], creditos: [],
  descripcion: '', cerca_de: [], fotos: [], destacada: false, fecha_publicacion: new Date().toISOString().slice(0, 10), fecha_vendida: null,
};

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export function PropertyEdit({ sb }: { sb: SupabaseClient }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState<Draft | null>(id ? null : EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    sb.from('propiedades').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setError('No encontré esta propiedad.');
      else setD(data as Draft);
    });
  }, [id, sb]);

  if (!d) return <p className="text-muted">{error || 'Cargando…'}</p>;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setSaved(false);
    setD((prev) => {
      const next = { ...prev!, [k]: v };
      if (!slugTouched && (k === 'nombre' || k === 'colonia')) next.slug = slugify(`${next.nombre} ${next.colonia}`);
      return next;
    });
  };
  const num = (v: string) => (v === '' ? null : Number(v));
  const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(files.length);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const base = `${d.slug || 'propiedad'}/${crypto.randomUUID().slice(0, 8)}`;
        const [lg, sm] = await Promise.all([toWebp(f, 1600), toWebp(f, 800, 0.78)]);
        const up1 = await sb.storage.from('propiedades').upload(`${base}.webp`, lg, { contentType: 'image/webp', cacheControl: '31536000' });
        const up2 = await sb.storage.from('propiedades').upload(`${base}-sm.webp`, sm, { contentType: 'image/webp', cacheControl: '31536000' });
        if (up1.error || up2.error) throw up1.error || up2.error;
        added.push(`${base}.webp`);
      } catch {
        setError(`No se pudo subir ${f.name}.`);
      }
      setUploading((n) => n - 1);
    }
    set('fotos', Array.from(new Set([...d.fotos, ...added])));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= d.fotos.length) return;
    const f = [...d.fotos];
    const [x] = f.splice(from, 1);
    f.splice(to, 0, x);
    set('fotos', f);
  };

  const removePhoto = async (path: string) => {
    set('fotos', d.fotos.filter((f) => f !== path));
    await sb.storage.from('propiedades').remove([path, path.replace(/\.webp$/, '-sm.webp')]);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.nombre || !d.colonia || !d.slug) return setError('Faltan nombre, colonia o slug.');
    setBusy(true);
    setError('');
    const row = { ...d, direccion: d.direccion || null, fecha_vendida: d.estatus === 'vendida' ? (d.fecha_vendida ?? new Date().toISOString().slice(0, 10)) : null };
    const q = d.id ? sb.from('propiedades').update(row).eq('id', d.id).select().single() : sb.from('propiedades').insert(row).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error) return setError(error.message.includes('duplicate') ? 'Ese slug ya existe. Cámbialo un poco.' : 'No se pudo guardar.');
    invalidateProperties();
    setSaved(true);
    if (!d.id) navigate(`/admin/propiedades/${(data as Propiedad).id}`, { replace: true });
    else setD(data as Draft);
  };

  const del = async () => {
    if (!d.id || !window.confirm('¿Borrar esta propiedad? Si ya se vendió, mejor márcala como Vendida.')) return;
    await sb.from('propiedades').delete().eq('id', d.id);
    invalidateProperties();
    navigate('/admin');
  };

  const input = (label: string, k: keyof Draft, type = 'text', extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`f-${String(k)}`}>{label}</label>
      <input
        id={`f-${String(k)}`}
        type={type}
        className="field"
        value={(d[k] as string | number | null) ?? ''}
        onChange={(e) => set(k, (type === 'number' ? num(e.target.value) : e.target.value) as never)}
        {...extra}
      />
    </div>
  );
  const check = (label: string, k: keyof Draft) => (
    <label className="flex min-h-tap items-center gap-3">
      <input type="checkbox" className="h-5 w-5 accent-teal-900" checked={Boolean(d[k])} onChange={(e) => set(k, e.target.checked as never)} />
      <span>{label}</span>
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{d.id ? d.nombre || 'Editar propiedad' : 'Nueva propiedad'}</h1>
        {d.id && <a href={`/propiedades/${d.slug}`} target="_blank" rel="noopener" className="font-semibold">Ver en el sitio</a>}
      </div>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 text-lg font-bold text-teal-900">Lo básico</legend>
        {input('Nombre (como sale en la tarjeta)', 'nombre', 'text', { required: true, placeholder: 'Casa en Santa Paula' })}
        <div>
          <label className="label" htmlFor="f-slug">Slug (dirección web)</label>
          <input id="f-slug" className="field" value={d.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} required />
          <p className="mt-1 text-sm text-muted">/propiedades/{d.slug || '…'}</p>
        </div>
        <div>
          <label className="label" htmlFor="f-tipo">Tipo</label>
          <select id="f-tipo" className="field" value={d.tipo} onChange={(e) => set('tipo', e.target.value as Draft['tipo'])}>
            {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-estatus">Estatus</label>
          <select id="f-estatus" className="field" value={d.estatus} onChange={(e) => set('estatus', e.target.value as Draft['estatus'])}>
            <option value="disponible">Disponible</option>
            <option value="apartada">Apartada</option>
            <option value="vendida">Vendida</option>
          </select>
        </div>
        {input('Precio (MXN, solo números)', 'precio', 'number', { min: 0, step: 1000 })}
        <div className="flex flex-col justify-end gap-1">
          {check('Precio a consultar (no mostrar precio)', 'precio_a_consultar')}
          {check('Destacada (sale primero en la portada)', 'destacada')}
        </div>
        {input('Fecha de publicación', 'fecha_publicacion', 'date')}
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 text-lg font-bold text-teal-900">Ubicación</legend>
        {input('Colonia', 'colonia', 'text', { required: true })}
        {input('Municipio', 'municipio')}
        {input('Dirección (privada)', 'direccion')}
        <div className="flex items-end">{check('Mostrar la dirección exacta en el sitio', 'mostrar_direccion')}</div>
        {input('Latitud aproximada', 'lat', 'number', { step: 'any', placeholder: '20.6597' })}
        {input('Longitud aproximada', 'lng', 'number', { step: 'any', placeholder: '-103.3496' })}
        <p className="text-sm text-muted sm:col-span-2">Tip: en Google Maps, mantén presionado sobre la calle y copia los dos números. Sin “mostrar dirección”, el sitio enseña solo un círculo de la zona.</p>
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-3">
        <legend className="px-1 text-lg font-bold text-teal-900">Datos de la casa</legend>
        {input('Recámaras', 'recamaras', 'number', { min: 0 })}
        {input('Baños (1.5 = uno y medio)', 'banos', 'number', { min: 0, step: 0.5 })}
        {input('Estacionamientos', 'estacionamientos', 'number', { min: 0 })}
        {input('Plantas', 'plantas', 'number', { min: 1 })}
        {input('m² de terreno', 'm2_terreno', 'number', { min: 0, step: 'any' })}
        {input('m² de construcción', 'm2_construccion', 'number', { min: 0, step: 'any' })}
        <fieldset className="sm:col-span-3">
          <legend className="label">Créditos que acepta</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CREDITO_LABEL) as Credito[]).map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={d.creditos.includes(c)} onClick={() => set('creditos', d.creditos.includes(c) ? d.creditos.filter((x) => x !== c) : [...d.creditos, c])}>
                {CREDITO_LABEL[c]}
              </button>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 text-lg font-bold text-teal-900">Texto</legend>
        <div>
          <label className="label" htmlFor="f-car">Qué tiene (una cosa por renglón)</label>
          <textarea id="f-car" rows={6} className="field" defaultValue={d.caracteristicas.join('\n')} onBlur={(e) => set('caracteristicas', lines(e.target.value))} placeholder={'Cochera para 2 autos\nPatio de servicio'} />
        </div>
        <div>
          <label className="label" htmlFor="f-cerca">Qué hay cerca (una cosa por renglón)</label>
          <textarea id="f-cerca" rows={6} className="field" defaultValue={d.cerca_de.join('\n')} onBlur={(e) => set('cerca_de', lines(e.target.value))} placeholder={'A una cuadra del mercado\nPrimaria a 5 minutos caminando'} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="f-desc">Descripción</label>
          <textarea id="f-desc" rows={6} className="field" value={d.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
        </div>
      </fieldset>

      <fieldset className="card p-5">
        <legend className="px-1 text-lg font-bold text-teal-900">Fotos</legend>
        <p className="text-sm text-muted">La primera es la portada (sale en la tarjeta y en la vista previa de WhatsApp). Arrastra o usa las flechas para ordenar. Se convierten a WebP automáticamente.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {d.fotos.map((f, i) => (
            <li
              key={f}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragFrom != null) move(dragFrom, i); setDragFrom(null); }}
              className="overflow-hidden rounded-btn border border-line bg-white"
            >
              <div className="relative">
                <img src={photoUrl(f, 'sm')} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-teal-900 px-2 py-0.5 text-xs font-bold text-white">Portada</span>}
              </div>
              <div className="flex justify-between p-1">
                <button type="button" className="btn-ghost min-h-tap px-2 text-sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Mover antes">←</button>
                <button type="button" className="btn-ghost min-h-tap px-2 text-sm text-status-hold" onClick={() => removePhoto(f)}>Quitar</button>
                <button type="button" className="btn-ghost min-h-tap px-2 text-sm" onClick={() => move(i, i + 1)} disabled={i === d.fotos.length - 1} aria-label="Mover después">→</button>
              </div>
            </li>
          ))}
        </ul>
        <label className="btn-outline mt-4 cursor-pointer">
          {uploading ? `Subiendo ${uploading}…` : 'Subir fotos'}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={!d.slug} />
        </label>
        {!d.slug && <p className="mt-2 text-sm text-muted">Escribe primero el nombre para poder subir fotos.</p>}
      </fieldset>

      {error && <FormError message={error} />}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white">
        <div className="wrap flex items-center justify-between gap-3 py-3">
          {d.id ? <button type="button" className="btn-ghost text-status-hold" onClick={del}>Borrar</button> : <span />}
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm font-semibold text-status-ok">Guardado</span>}
            <button type="submit" className="btn-primary" disabled={busy || uploading > 0}>{busy ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
