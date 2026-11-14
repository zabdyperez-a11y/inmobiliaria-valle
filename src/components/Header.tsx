import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { WA } from '../lib/whatsapp';
import { IconClose, IconMenu } from './Icons';
import { Logo } from './Logo';
import { WhatsAppButton } from './WhatsAppButton';

const NAV = [
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/vende-tu-casa', label: 'Vende tu casa' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-tap items-center px-3 font-semibold no-underline hover:text-teal-700 ${isActive ? 'text-teal-900 underline decoration-teal-500 decoration-2 underline-offset-8' : 'text-ink'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">
        Saltar al contenido
      </a>
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center" aria-label="Inmobiliaria Valle, inicio">
          <Logo />
        </Link>
        <nav className="hidden items-center lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <WhatsAppButton message={WA.general()} location="header" className="btn-wa hidden min-h-tap px-4 text-sm sm:inline-flex">
            WhatsApp
          </WhatsAppButton>
          <button
            type="button"
            className="btn-ghost min-h-tap px-2.5 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu />}
            <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-movil" className="border-t border-line bg-white lg:hidden" aria-label="Principal">
          <div className="wrap flex flex-col py-2">
            <NavLink to="/" end className={linkClass}>Inicio</NavLink>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
