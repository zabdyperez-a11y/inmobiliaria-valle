import { useState } from 'react';
import { Field, FormError, FormThanks, PhoneField, PrivacyNote, validPhone } from '../components/Form';
import { Section } from '../components/Layout';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { IconChevron } from '../components/Icons';
import { saveLead } from '../lib/leads';
import { useSeo } from '../lib/seo';
import { track } from '../lib/track';
import { WA } from '../lib/whatsapp';

const PASOS = [
  { t: 'Te digo cuánto vale', d: 'Voy a ver tu casa y la comparo con lo que se ha vendido en tu colonia. Te doy un precio con el que sí se vende, no uno para quedar bien.' },
  { t: 'Fotos reales', d: 'Le tomo fotos con buena luz y de todos los cuartos. Nada de fotos de internet: la gente quiere ver la casa como es.' },
  { t: 'La publico', d: 'Sale en esta página y en Facebook, Instagram, TikTok y los grupos de WhatsApp donde busca la gente de la zona.' },
  { t: 'Atiendo las visitas', d: 'Yo filtro a los interesados y les pregunto antes con qué crédito compran. Así a tu casa llega gente que de verdad puede comprar.' },
  { t: 'Papeles', d: 'Revisamos escrituras, predial y agua. Si el comprador va con Infonavit, Fovissste o banco, sigo el trámite con ellos.' },
  { t: 'Firma en la notaría', d: 'Se firma ante notario y recibes tu pago. Te explico cada documento antes de firmar.' },
];

const TIPOS = ['Casa', 'Departamento', 'Terreno', 'Local', 'Otro'];

export default function Sell() {
  useSeo({
    title: 'Vende tu casa en Guadalajara | Inmobiliaria Valle',
    description: 'Te digo cuánto vale tu casa y la vendo con fotos reales, visitas filtradas y papeles en orden hasta la firma en notaría.',
    path: '/vende-tu-casa',
  });

  return (
    <>
      <section className="bg-white">
        <div className="wrap max-w-3xl py-10 sm:py-14">
          <h1 className="text-3xl sm:text-5xl">Vende tu casa sin andar batallando</h1>
          <p className="mt-4 text-lg">
            Te digo cuánto vale, la publico con fotos reales y me encargo de las visitas y los papeles. Tú decides el precio final.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#formulario" className="btn-primary">Quiero vender mi casa</a>
            <WhatsAppButton message={WA.sell()} location="sell" />
          </div>
        </div>
      </section>

      <Section tone="paper">
        <h2 className="text-2xl sm:text-3xl">Así vendemos tu casa</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {PASOS.map((p, i) => (
            <li key={p.t} className="flex gap-4">
              <span className="price flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-teal-500 text-lg">{i + 1}</span>
              <div>
                <h3 className="text-lg">{p.t}</h3>
                <p className="mt-1">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="formulario" className="scroll-mt-16">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl">Cuéntame de tu casa</h2>
          <p className="mt-2 text-muted">Con estos datos ya puedo darte una idea. Lo demás lo vemos por WhatsApp.</p>
          <div className="mt-6">
            <SellForm />
          </div>
        </div>
      </Section>
    </>
  );
}

function SellForm() {
  const [v, setV] = useState({ nombre: '', tel: '', colonia: '', tipo: '', escrituras: '', m2: '', recamaras: '', adeudos: '', comentarios: '' });
  const [fotos, setFotos] = useState<File[]>([]);
  const [more, setMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  const summary = () => {
    const parts = [`Hola Cristy, quiero vender mi casa en ${v.colonia}.`];
    const det: string[] = [];
    if (v.tipo) det.push(`Es ${v.tipo.toLowerCase()}`);
    if (v.recamaras) det.push(`${v.recamaras} recámaras`);
    if (v.m2) det.push(`unos ${v.m2} m²`);
    if (det.length) parts.push(det.join(', ') + '.');
    if (v.escrituras) parts.push(`Escrituras: ${v.escrituras.toLowerCase()}.`);
    if (v.adeudos) parts.push(`Adeudos: ${v.adeudos.toLowerCase()}.`);
    parts.push(`Soy ${v.nombre.trim()}.`);
    return parts.join(' ');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (v.nombre.trim().length < 2) err.nombre = 'Escribe tu nombre.';
    if (!validPhone(v.tel)) err.tel = 'Revisa tu número: son 10 dígitos.';
    if (!v.colonia.trim()) err.colonia = '¿En qué colonia está?';
    if (!v.tipo) err.tipo = 'Elige el tipo.';
    if (!v.escrituras) err.escrituras = 'Elige una opción.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setState('sending');
    try {
      await saveLead(
        {
          tipo: 'vender',
          nombre: v.nombre,
          whatsapp: v.tel,
          datos: { colonia: v.colonia, tipo_inmueble: v.tipo, escrituras: v.escrituras, m2: v.m2 || null, recamaras: v.recamaras || null, adeudos: v.adeudos || null, comentarios: v.comentarios || null },
        },
        fotos,
      );
      track('sell_form_submit', { colonia: v.colonia, tipo: v.tipo });
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') return <FormThanks nombre={v.nombre} waMessage={summary()} location="thank_you" />;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Tu nombre" error={errors.nombre}>
        {(id) => <input id={id} className="field" autoComplete="name" value={v.nombre} onChange={set('nombre')} aria-invalid={Boolean(errors.nombre)} />}
      </Field>
      <PhoneField value={v.tel} onChange={(tel) => setV({ ...v, tel })} error={errors.tel} />
      <Field label="Colonia donde está la casa" error={errors.colonia}>
        {(id) => <input id={id} className="field" value={v.colonia} onChange={set('colonia')} aria-invalid={Boolean(errors.colonia)} placeholder="Ej. Beatriz Hernández" />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de inmueble" error={errors.tipo}>
          {(id) => (
            <select id={id} className="field" value={v.tipo} onChange={set('tipo')} aria-invalid={Boolean(errors.tipo)}>
              <option value="">Elige uno</option>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
        </Field>
        <Field label="¿Tiene escrituras?" error={errors.escrituras}>
          {(id) => (
            <select id={id} className="field" value={v.escrituras} onChange={set('escrituras')} aria-invalid={Boolean(errors.escrituras)}>
              <option value="">Elige una opción</option>
              <option>Sí</option>
              <option>No</option>
              <option>En trámite</option>
              <option>No sé</option>
            </select>
          )}
        </Field>
      </div>

      <button type="button" className="flex min-h-tap items-center gap-1 font-semibold text-teal-900" aria-expanded={more} onClick={() => setMore((m) => !m)}>
        <IconChevron dir={more ? 'down' : 'right'} /> Agregar más detalles
      </button>

      {more && (
        <div className="space-y-4 rounded-card bg-teal-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="m² aproximados" optional>
              {(id) => <input id={id} className="field" inputMode="decimal" value={v.m2} onChange={set('m2')} />}
            </Field>
            <Field label="Recámaras" optional>
              {(id) => <input id={id} className="field" inputMode="numeric" value={v.recamaras} onChange={set('recamaras')} />}
            </Field>
          </div>
          <Field label="¿Tiene adeudos?" optional>
            {(id) => (
              <select id={id} className="field" value={v.adeudos} onChange={set('adeudos')}>
                <option value="">Elige una opción</option>
                <option>No</option>
                <option>Sí, crédito o hipoteca</option>
                <option>Sí, predial o agua</option>
                <option>No sé</option>
              </select>
            )}
          </Field>
          <Field label="Fotos de la casa" optional hint="Hasta 8 fotos. Con el celular está bien.">
            {(id) => (
              <input
                id={id}
                type="file"
                accept="image/*"
                multiple
                className="block w-full text-sm file:mr-3 file:min-h-tap file:rounded-btn file:border-0 file:bg-teal-900 file:px-4 file:font-semibold file:text-white"
                onChange={(e) => setFotos(Array.from(e.target.files ?? []).slice(0, 8))}
              />
            )}
          </Field>
          <Field label="Comentarios" optional>
            {(id) => <textarea id={id} rows={3} className="field" value={v.comentarios} onChange={set('comentarios')} />}
          </Field>
        </div>
      )}

      {state === 'error' && <FormError message="No se pudo mandar. Intenta otra vez o escríbeme directo por WhatsApp." />}
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={state === 'sending'}>
        {state === 'sending' ? 'Mandando…' : 'Quiero vender mi casa'}
      </button>
      <PrivacyNote />
    </form>
  );
}
