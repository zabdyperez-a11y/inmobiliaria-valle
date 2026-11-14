import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Logo } from '../components/Logo';
import { getSupabase, hasSupabase } from '../lib/supabase';
import { useSeo } from '../lib/seo';
import { Login } from './Login';
import { PropertyList } from './PropertyList';
import { PropertyEdit } from './PropertyEdit';
import { Leads } from './Leads';

export default function AdminApp() {
  useSeo({ title: 'Administración | Inmobiliaria Valle', description: 'Panel de administración', path: '/admin', noindex: true });
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!hasSupabase) return;
    let unsub: (() => void) | undefined;
    getSupabase().then((client) => {
      setSb(client);
      client.auth.getSession().then(({ data }) => setSession(data.session));
      const { data } = client.auth.onAuthStateChange((_e, s) => setSession(s));
      unsub = () => data.subscription.unsubscribe();
    });
    return () => unsub?.();
  }, []);

  if (!hasSupabase) {
    return (
      <Shell>
        <div className="card max-w-xl p-6">
          <h1 className="text-2xl">Falta conectar Supabase</h1>
          <p className="mt-3">El panel necesita la base de datos. Agrega <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> (ver README) y vuelve a cargar.</p>
        </div>
      </Shell>
    );
  }
  if (session === undefined || !sb) return <Shell><p className="text-muted">Cargando…</p></Shell>;
  if (!session) return <Shell><Login sb={sb} /></Shell>;

  return (
    <Shell nav onLogout={() => sb.auth.signOut()}>
      <Routes>
        <Route index element={<PropertyList sb={sb} />} />
        <Route path="propiedades/nueva" element={<PropertyEdit sb={sb} />} />
        <Route path="propiedades/:id" element={<PropertyEdit sb={sb} />} />
        <Route path="leads" element={<Leads sb={sb} />} />
      </Routes>
    </Shell>
  );
}

function Shell({ children, nav, onLogout }: { children: React.ReactNode; nav?: boolean; onLogout?: () => void }) {
  const cls = ({ isActive }: { isActive: boolean }) => `flex min-h-tap items-center px-3 font-semibold no-underline ${isActive ? 'text-teal-900 underline decoration-teal-500 decoration-2 underline-offset-8' : 'text-ink'}`;
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-2 py-2">
          <Link to="/" aria-label="Ver el sitio"><Logo /></Link>
          {nav && (
            <nav className="flex flex-wrap items-center" aria-label="Administración">
              <NavLink to="/admin" end className={cls}>Propiedades</NavLink>
              <NavLink to="/admin/leads" className={cls}>Leads</NavLink>
              <button type="button" className="btn-ghost min-h-tap text-sm" onClick={onLogout}>Salir</button>
            </nav>
          )}
        </div>
      </header>
      <main className="wrap py-8">{children}</main>
    </div>
  );
}
