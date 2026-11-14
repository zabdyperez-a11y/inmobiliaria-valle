import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { WA, waLink } from '../lib/whatsapp';
import { track } from '../lib/track';
import { Logo } from './Logo';

export function Footer() {
  const social = [
    { label: 'Instagram', href: SITE.social.instagram },
    { label: 'Facebook', href: SITE.social.facebook },
    { label: 'TikTok', href: SITE.social.tiktok ? `https://www.tiktok.com/@${SITE.social.tiktok.replace('@', '')}` : '' },
  ].filter((s) => s.href);

  return (
    <footer className="bg-teal-900 text-white">
      <div className="wrap grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo white className="h-10 w-auto" />
          <p className="mt-4 max-w-xs text-white/85">Compra y venta de casas en {SITE.serviceArea}.</p>
        </div>
        <div>
          <h2 className="text-base text-white">Contacto</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                className="text-white underline"
                href={waLink(WA.general())}
                target="_blank"
                rel="noopener"
                onClick={() => track('whatsapp_click', { location: 'footer' })}
              >
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a className="text-white underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li className="text-white/85">{SITE.hours}</li>
            <li className="text-white/85">{SITE.address}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base text-white">Sígueme</h2>
          <ul className="mt-3 space-y-2">
            {social.map((s) => (
              <li key={s.label}>
                <a className="text-white underline" href={s.href} target="_blank" rel="noopener">{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link to="/aviso-de-privacidad" className="text-white underline">Aviso de privacidad</Link>
          </p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="wrap py-5 text-sm text-white/75">© {new Date().getFullYear()} Inmobiliaria Valle · Guadalajara, Jalisco</p>
      </div>
    </footer>
  );
}
