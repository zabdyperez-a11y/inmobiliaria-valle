// Netlify Edge Function: para cualquier /propiedades/<slug>, pone en el HTML el título, precio y foto
// de la casa leídos de Supabase en ese momento. Así las casas nuevas tienen buena vista previa en
// WhatsApp sin volver a publicar el sitio. Si algo falla, devuelve la página tal cual.
import type { Context } from 'https://edge.netlify.com';

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const mxn = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export default async (req: Request, context: Context) => {
  const res = await context.next();
  const slug = new URL(req.url).pathname.split('/')[2];
  const SB = Netlify.env.get('VITE_SUPABASE_URL');
  const KEY = Netlify.env.get('VITE_SUPABASE_ANON_KEY');
  const SITE = (Netlify.env.get('VITE_SITE_URL') || 'https://inmobiliariavalle.com').replace(/\/$/, '');
  if (!slug || !SB || !KEY || !res.headers.get('content-type')?.includes('text/html')) return res;
  try {
    const r = await fetch(`${SB}/rest/v1/propiedades_publicas?slug=eq.${encodeURIComponent(slug)}&select=nombre,colonia,municipio,precio,precio_a_consultar,recamaras,fotos,estatus`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const [p] = await r.json();
    if (!p) return res;
    const price = p.precio_a_consultar || p.precio == null ? 'Precio a consultar' : mxn(p.precio);
    const title = [p.nombre, p.recamaras ? `${p.recamaras} recámaras` : null, price].filter(Boolean).join(', ') + ' | Inmobiliaria Valle';
    const desc = `${p.nombre} en ${[p.colonia, p.municipio].filter(Boolean).join(', ')}. ${price}.${p.estatus === 'vendida' ? ' Vendida.' : ''}`;
    const img = p.fotos?.[0] ? `${SB}/storage/v1/object/public/propiedades/${p.fotos[0]}` : `${SITE}/og-default.png`;
    let html = await res.text();
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
      .replace(/(<meta property="og:image" content=")[^"]*/, `$1${esc(img)}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${esc(`${SITE}/propiedades/${slug}`)}`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${esc(`${SITE}/propiedades/${slug}`)}`);
    return new Response(html, { status: 200, headers: res.headers });
  } catch {
    return res;
  }
};
