import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { formatPhone } from '../lib/format';
import { WhatsAppButton } from './WhatsAppButton';
import { IconCheck } from './Icons';

export function Field({ label, children, hint, error, optional }: { label: string; children: (id: string) => ReactNode; hint?: string; error?: string; optional?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-muted">(opcional)</span>}
      </label>
      {children(id)}
      {hint && !error && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm font-medium text-status-hold" role="alert">{error}</p>}
    </div>
  );
}

/** Número celular de 10 dígitos con +52 fijo. */
export function PhoneField({ value, onChange, error }: { value: string; onChange: (digits: string) => void; error?: string }) {
  return (
    <Field label="Tu WhatsApp" error={error} hint="10 dígitos, por ejemplo 33 1234 5678">
      {(id) => (
        <div className="flex">
          <span className="flex min-h-btn items-center rounded-l-btn border border-r-0 border-line bg-paper px-3 font-semibold text-muted tabular">+52</span>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            className="field rounded-l-none tabular"
            value={formatPhone(value)}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
            aria-invalid={Boolean(error)}
            placeholder="33 1234 5678"
          />
        </div>
      )}
    </Field>
  );
}

export function validPhone(d: string) {
  return d.replace(/\D/g, '').length === 10;
}

export function PrivacyNote() {
  return (
    <p className="text-sm text-muted">
      Tus datos se usan conforme al <Link to="/aviso-de-privacidad">aviso de privacidad</Link>.
    </p>
  );
}

/** Estado después de enviar cualquier formulario. */
export function FormThanks({ nombre, waMessage, location, slug }: { nombre: string; waMessage: string; location: string; slug?: string }) {
  const first = nombre.trim().split(/\s+/)[0];
  return (
    <div className="rounded-card border border-status-ok/30 bg-status-ok-bg p-5" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-lg font-bold text-status-ok">
        <IconCheck className="h-6 w-6" /> Listo, {first}. Ya me llegó tu mensaje.
      </p>
      <p className="mt-2 text-ink">
        Te escribo por WhatsApp hoy mismo, en horario de {SITE.hours}.
      </p>
      <p className="mt-4 text-ink">¿No quieres esperar? Escríbeme tú y lo vemos ahorita.</p>
      <div className="mt-3">
        <WhatsAppButton message={waMessage} location={location} slug={slug} />
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-btn bg-status-hold-bg p-3 text-sm font-medium text-status-hold" role="alert">
      {message}
    </p>
  );
}
