// Después de `vite build`: genera un HTML por página y por propiedad con su título, descripción,
// Open Graph (foto de portada) y JSON-LD, para que WhatsApp, Facebook y Google vean la casa real.
// También genera sitemap.xml. Lee de Supabase si hay variables; si no, de src/data/seed.json.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';

// Carga .env local si existe (en Bolt/Netlify las variables ya vienen del entorno).
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const SITE = (process.env.VITE_SITE_URL || 'https://inmobiliariavalle.com').replace(/\/$/, '');
const SB_URL = process.env.VITE_SUPABASE_URL;
const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const precio = (p) => (p.precio_a_consultar || p.precio == null ? 'Precio a consultar' : mxn(p.precio));
const TIPO = { casa: 'Casa', departamento: 'Departamento', terreno: 'Terreno', local: 'Local', salon_eventos: 'Salón de eventos' };
const photo = (path) => (/^https?:/.test(path) ? path : path.startsWith('/') ? SITE + path : `${SB_URL}/storage/v1/object/public/propiedades/${path}`);
const ubic = (p) => [p.colonia, p.municipio].filter(Boolean).join(', ');
const banos = (n) => { const e = Math.floor(n); const m = n - e >= 0.5; return m ? (e ? `${e} ${e === 1 ? 'baño' : 'baños'} y medio` : 'Medio baño') : `${e} ${e === 1 ? 'baño' : 'baños'}`; };
const nf = (n) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(n);

async function loadProperties() {
  if (SB_URL && SB_KEY) {
    try {
      const r = await fetch(`${SB_URL}/rest/v1/propiedades_publicas?select=*`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
      if (r.ok) return await r.json();
      console.warn('[prerender] Supabase respondió', r.status, '— uso seed.json');
    } catch (e) {
      console.warn('[prerender] No pude leer Supabase — uso seed.json', e.message);
    }
  }
  return JSON.parse(await readFile('src/data/seed.json', 'utf8')).map((p) => ({ ...p, direccion: p.mostrar_direccion ? p.direccion : null }));
}

function head({ title, description, path, image, jsonLd, noindex }) {
  const url = SITE + path;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : '',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Inmobiliaria Valle" />',
    '<meta property="og:locale" content="es_MX" />',
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image || SITE + '/og-default.png')}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<link rel="canonical" href="${esc(url)}" />`,
    jsonLd ? `<script type="application/ld+json" id="jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
}

export function propertyMeta(p) {
  const t = [p.nombre];
  if (p.recamaras) t.push(`${p.recamaras} ${p.recamaras === 1 ? 'recámara' : 'recámaras'}`);
  t.push(precio(p));
  const bits = [`${TIPO[p.tipo]} en ${ubic(p)}`];
  if (p.recamaras) bits.push(`${p.recamaras} ${p.recamaras === 1 ? 'recámara' : 'recámaras'}`);
  if (p.banos) bits.push(banos(p.banos));
  if (p.m2_terreno) bits.push(`${nf(p.m2_terreno)} m² de terreno`);
  let d = `${bits.join(', ')}. ${precio(p)}.`;
  if (p.creditos?.length) d += ` Acepta ${p.creditos.map((c) => c[0].toUpperCase() + c.slice(1)).join(', ')}.`;
  if (p.estatus === 'vendida') d += ' Vendida.';
  const offer = {
    '@context': 'https://schema.org', '@type': 'Offer', url: `${SITE}/propiedades/${p.slug}`, name: p.nombre,
    image: (p.fotos || []).slice(0, 5).map(photo),
    availability: p.estatus === 'disponible' ? 'https://schema.org/InStock' : p.estatus === 'apartada' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/SoldOut',
    seller: { '@type': 'RealEstateAgent', name: 'Inmobiliaria Valle', url: SITE },
    itemOffered: {
      '@type': p.tipo === 'casa' ? 'SingleFamilyResidence' : p.tipo === 'departamento' ? 'Apartment' : 'Place',
      name: p.nombre,
      address: { '@type': 'PostalAddress', addressLocality: p.municipio, addressRegion: 'Jalisco', addressCountry: 'MX' },
      ...(p.recamaras != null && { numberOfRooms: p.recamaras }),
      ...(p.banos != null && { numberOfBathroomsTotal: p.banos }),
    },
  };
  if (p.precio != null && !p.precio_a_consultar) Object.assign(offer, { price: p.precio, priceCurrency: 'MXN' });
  return { title: `${t.join(', ')} | Inmobiliaria Valle`, description: d, path: `/propiedades/${p.slug}`, image: p.fotos?.[0] ? photo(p.fotos[0]) : undefined, jsonLd: offer };
}

const template = await readFile('dist/index.html', 'utf8');
const render = (meta) => template.replace(/<!--seo-->[\s\S]*<!--\/seo-->/, head(meta));
async function write(path, meta) {
  const dir = `dist${path === '/' ? '' : path}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, render(meta));
}

const props = await loadProperties();
const agent = {
  '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Inmobiliaria Valle', url: SITE, logo: `${SITE}/icon-512.png`,
  image: `${SITE}/og-default.png`, telephone: '+523313501435', email: 'info@inmobiliariavalle.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Guadalajara', addressRegion: 'Jalisco', addressCountry: 'MX' },
  areaServed: { '@type': 'City', name: 'Guadalajara' }, sameAs: ['https://www.instagram.com/inmobiliaria.valle/'],
};

const pages = [
  { path: '/', title: 'Casas en venta en Guadalajara con papeles en orden | Inmobiliaria Valle', description: 'Casas en venta en la zona metropolitana de Guadalajara, de $700 mil a $4 millones. Aceptan Infonavit, Fovissste o crédito bancario. Escríbele a Cristy por WhatsApp.', jsonLd: agent },
  { path: '/propiedades', title: 'Casas en venta en Guadalajara | Inmobiliaria Valle', description: 'Todas las casas en venta de Inmobiliaria Valle con precio, recámaras, metros y créditos que aceptan (Infonavit, Fovissste, bancario).' },
  { path: '/vende-tu-casa', title: 'Vende tu casa en Guadalajara | Inmobiliaria Valle', description: 'Te digo cuánto vale tu casa y la vendo con fotos reales, visitas filtradas y papeles en orden hasta la firma en notaría.' },
  { path: '/nosotros', title: 'Cristy Valle, asesora inmobiliaria en Guadalajara | Inmobiliaria Valle', description: 'Conoce a Cristy, de Inmobiliaria Valle. Compra y venta de casas en la zona metropolitana de Guadalajara.' },
  { path: '/contacto', title: 'Contacto | Inmobiliaria Valle', description: 'Escríbele a Cristy por WhatsApp al 33 1350 1435 o deja tus datos y te contacta hoy.' },
  { path: '/aviso-de-privacidad', title: 'Aviso de privacidad | Inmobiliaria Valle', description: 'Aviso de privacidad de Inmobiliaria Valle.' },
];

for (const pg of pages) await write(pg.path, pg);
for (const p of props) await write(`/propiedades/${p.slug}`, propertyMeta(p));
await writeFile('dist/404.html', render({ title: 'No encontré esta página | Inmobiliaria Valle', description: 'La página que buscas ya no existe.', path: '/404', noindex: true }));

const today = new Date().toISOString().slice(0, 10);
const urls = [...pages.map((p) => ({ loc: SITE + p.path, lastmod: today })), ...props.map((p) => ({ loc: `${SITE}/propiedades/${p.slug}`, lastmod: (p.updated_at || p.fecha_publicacion || today).slice(0, 10) }))];
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`[prerender] ${pages.length} páginas y ${props.length} propiedades listas, sitemap con ${urls.length} URLs.`);
