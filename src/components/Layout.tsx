import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/track';
import { ConsentBanner } from './ConsentBanner';
import { Footer } from './Footer';
import { Header } from './Header';
import { WhatsAppFloat } from './WhatsAppFloat';

export function Layout() {
  const { pathname, search } = useLocation();
  const first = useRef(true);
  const onProperty = /^\/propiedades\/[^/]+/.test(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView(pathname + search);
  }, [pathname, search]);

  return (
    <>
      <Header />
      {/* Alto mínimo de pantalla completa: el pie no brinca mientras carga la página. */}
      <main id="main" className="min-h-[100svh]">
        <Suspense fallback={<div className="wrap py-16 text-muted">Cargando…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!onProperty && <WhatsAppFloat />}
      <ConsentBanner />
    </>
  );
}

export function Section({ children, className = '', tone = 'white', id }: { children: React.ReactNode; className?: string; tone?: 'white' | 'paper' | 'teal-50'; id?: string }) {
  const bg = tone === 'paper' ? 'bg-paper' : tone === 'teal-50' ? 'bg-teal-50' : 'bg-white';
  return (
    <section id={id} className={`${bg} py-12 sm:py-16 ${className}`}>
      <div className="wrap">{children}</div>
    </section>
  );
}
