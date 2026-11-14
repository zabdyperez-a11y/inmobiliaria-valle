import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FormError } from '../components/Form';

export function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setError('Correo o contraseña incorrectos.');
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl">Entrar al panel</h1>
      <div>
        <label htmlFor="email" className="label">Correo</label>
        <input id="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="pass" className="label">Contraseña</label>
        <input id="pass" type="password" autoComplete="current-password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <FormError message={error} />}
      <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
