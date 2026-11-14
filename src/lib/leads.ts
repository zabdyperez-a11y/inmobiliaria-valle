import type { LeadTipo } from '../types';
import { getSupabase, hasSupabase } from './supabase';
import { getUtm } from './utm';
import { toWebp } from './images';

export interface NewLead {
  tipo: LeadTipo;
  nombre: string;
  /** Solo los 10 dígitos; se guarda con +52. */
  whatsapp: string;
  propiedad_id?: string | null;
  datos?: Record<string, unknown>;
}

export async function saveLead(lead: NewLead, fotos: File[] = []) {
  const row = {
    tipo: lead.tipo,
    nombre: lead.nombre.trim(),
    whatsapp: `+52${lead.whatsapp.replace(/\D/g, '')}`,
    propiedad_id: lead.propiedad_id ?? null,
    datos: { ...(lead.datos ?? {}) } as Record<string, unknown>,
    pagina_origen: window.location.pathname + window.location.search,
    ...getUtm(),
  };

  if (!hasSupabase) {
    // Modo demo: sin base de datos todavía. El formulario funciona igual para revisar el flujo.
    console.info('[lead demo]', row, fotos.length ? `${fotos.length} fotos` : '');
    await new Promise((r) => setTimeout(r, 400));
    return;
  }

  const sb = await getSupabase();
  if (fotos.length) {
    const folder = crypto.randomUUID();
    const paths: string[] = [];
    for (const [i, f] of fotos.slice(0, 8).entries()) {
      const blob = await toWebp(f, 1600);
      const path = `${folder}/${i + 1}.webp`;
      const { error } = await sb.storage.from('fotos-vendedores').upload(path, blob, { contentType: 'image/webp' });
      if (!error) paths.push(path);
    }
    row.datos.fotos = paths;
  }
  const { error } = await sb.from('leads').insert(row);
  if (error) throw error;
}
