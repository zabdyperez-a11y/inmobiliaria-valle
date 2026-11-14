import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent, trackingConfigured } from '../lib/track';

/** Solo aparece si hay GA4 o Meta Pixel configurados. */
export function ConsentBanner() {
  const [show, setShow] = useState(() => trackingConfigured && getConsent() === null);
  if (!show) return null;
  const choose = (v: 'granted' | 'denied') => {
    setConsent(v);
    setShow(false);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white shadow-sheet" role="region" aria-label="Aviso de cookies">
      <div className="wrap flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">
          Uso cookies de Google y Meta para saber qué casas se ven más. <Link to="/aviso-de-privacidad">Aviso de privacidad</Link>
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-outline min-h-tap text-sm" onClick={() => choose('denied')}>
            Solo las necesarias
          </button>
          <button type="button" className="btn-primary min-h-tap text-sm" onClick={() => choose('granted')}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
