import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = Boolean(url && key);
export const SUPABASE_URL = url ?? '';

let client: Promise<SupabaseClient> | null = null;

/** Carga supabase-js solo cuando se necesita, para que la portada pese menos. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!hasSupabase) return Promise.reject(new Error('Supabase no está configurado'));
  if (!client) {
    client = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url!, key!, { auth: { persistSession: true } }),
    );
  }
  return client;
}
