import { useState } from 'react';
import { saveLead } from '../lib/leads';
import { track } from '../lib/track';
import { WA } from '../lib/whatsapp';
import type { Propiedad } from '../types';
import { Field, FormError, FormThanks, PhoneField, PrivacyNote, validPhone } from './Form';

const HORARIOS = ['Mañana', 'Mediodía', 'Tarde', 'Cualquier horario'];

export function VisitForm({ p }: { p: Propiedad }) {
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [dia, setDia] = useState('');
  const [horario, setHorario] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (nombre.trim().length < 2) err.nombre = 'Escribe tu nombre.';
    if (!validPhone(tel)) err.tel = 'Revisa tu número: son 10 dígitos.';
    if (!dia) err.dia = 'Elige un día.';
    if (!horario) err.horario = 'Elige un horario.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setState('sending');
    try {
      await saveLead({ tipo: 'visita', nombre, whatsapp: tel, propiedad_id: p.id, datos: { dia, horario, propiedad: p.nombre, slug: p.slug } });
      track('visit_form_submit', { slug: p.slug, price: p.precio ?? undefined });
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') return <FormThanks nombre={nombre} waMessage={WA.property(p)} location="thank_you" slug={p.slug} />;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Tu nombre" error={errors.nombre}>
        {(id) => <input id={id} className="field" autoComplete="name" required value={nombre} onChange={(e) => setNombre(e.target.value)} aria-invalid={Boolean(errors.nombre)} />}
      </Field>
      <PhoneField value={tel} onChange={setTel} error={errors.tel} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Día que prefieres" error={errors.dia}>
          {(id) => <input id={id} type="date" min={today} className="field" required value={dia} onChange={(e) => setDia(e.target.value)} aria-invalid={Boolean(errors.dia)} />}
        </Field>
        <Field label="Horario" error={errors.horario}>
          {(id) => (
            <select id={id} className="field" required value={horario} onChange={(e) => setHorario(e.target.value)} aria-invalid={Boolean(errors.horario)}>
              <option value="">Elige uno</option>
              {HORARIOS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          )}
        </Field>
      </div>
      {state === 'error' && <FormError message="No se pudo mandar. Intenta otra vez o escríbeme directo por WhatsApp." />}
      <button type="submit" className="btn-primary w-full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Agendando…' : 'Agendar visita'}
      </button>
      <PrivacyNote />
    </form>
  );
}
