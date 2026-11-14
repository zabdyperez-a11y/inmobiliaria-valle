import { useState } from 'react';
import { Field, FormError, FormThanks, PhoneField, PrivacyNote, validPhone } from '../components/Form';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SITE } from '../config/site';
import { saveLead } from '../lib/leads';
import { useSeo } from '../lib/seo';
import { track } from '../lib/track';
import { WA } from '../lib/whatsapp';

const INTERESES = [
  { v: 'comprar', l: 'Comprar' },
  { v: 'vender', l: 'Vender' },
  { v: 'otro', l: 'Otra cosa' },
];

export default function Contact() {
  useSeo({ title: 'Contacto | Inmobiliaria Valle', description: `Escríbele a Cristy por WhatsApp al ${SITE.whatsappDisplay} o deja tus datos y te contacta hoy.`, path: '/contacto' });

  return (
    <div className="wrap grid gap-12 py-10 sm:py-14 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl sm:text-4xl">Contáctame</h1>
        <p className="mt-3 text-lg">Lo más rápido es WhatsApp. Ahí te contesto yo.</p>
        <div className="mt-6">
          <WhatsAppButton message={WA.general()} location="contact" />
        </div>
        <dl className="mt-10 space-y-5">
          <div>
            <dt className="eyebrow">WhatsApp</dt>
            <dd className="text-lg font-semibold tabular">+52 {SITE.whatsappDisplay}</dd>
          </div>
          <div>
            <dt className="eyebrow">Teléfono</dt>
            <dd className="text-lg">{SITE.phone}</dd>
          </div>
          <div>
            <dt className="eyebrow">Correo electrónico</dt>
            <dd className="text-lg"><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
          </div>
          <div>
            <dt className="eyebrow">Horario</dt>
            <dd className="text-lg">{SITE.hours}</dd>
          </div>
          <div>
            <dt className="eyebrow">Dónde atiendo</dt>
            <dd className="text-lg">{SITE.address}</dd>
          </div>
          {SITE.googleReviews && (
            <div>
              <dt className="eyebrow">Reseñas</dt>
              <dd className="text-lg"><a href={SITE.googleReviews} target="_blank" rel="noopener">Ver reseñas en Google</a></dd>
            </div>
          )}
        </dl>
      </div>
      <div className="card h-fit p-5 sm:p-6">
        <h2 className="text-xl">Déjame tus datos</h2>
        <p className="mt-1 text-muted">Te escribo por WhatsApp.</p>
        <div className="mt-5">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [interes, setInteres] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (nombre.trim().length < 2) err.nombre = 'Escribe tu nombre.';
    if (!validPhone(tel)) err.tel = 'Revisa tu número: son 10 dígitos.';
    if (!interes) err.interes = 'Elige una opción.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setState('sending');
    try {
      await saveLead({ tipo: 'contacto', nombre, whatsapp: tel, datos: { interes, mensaje: mensaje || null } });
      track('contact_form_submit', { interes });
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    const msg = interes === 'vender' ? WA.sell() : WA.general();
    return <FormThanks nombre={nombre} waMessage={msg} location="thank_you" />;
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Tu nombre" error={errors.nombre}>
        {(id) => <input id={id} className="field" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-invalid={Boolean(errors.nombre)} />}
      </Field>
      <PhoneField value={tel} onChange={setTel} error={errors.tel} />
      <fieldset>
        <legend className="label">¿Qué te interesa?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {INTERESES.map((i) => (
            <button key={i.v} type="button" role="radio" aria-checked={interes === i.v} className="chip" onClick={() => setInteres(i.v)}>
              {i.l}
            </button>
          ))}
        </div>
        {errors.interes && <p className="mt-1 text-sm font-medium text-status-hold" role="alert">{errors.interes}</p>}
      </fieldset>
      <Field label="Mensaje" optional>
        {(id) => <textarea id={id} rows={4} className="field" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />}
      </Field>
      {state === 'error' && <FormError message="No se pudo mandar. Intenta otra vez o escríbeme directo por WhatsApp." />}
      <button type="submit" className="btn-primary w-full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Mandando…' : 'Mandar mis datos'}
      </button>
      <PrivacyNote />
    </form>
  );
}
