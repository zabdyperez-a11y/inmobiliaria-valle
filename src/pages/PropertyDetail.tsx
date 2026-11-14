import { lazy, Suspense, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditBadges, StatusBadge } from '../components/Badges';
import { Gallery } from '../components/Gallery';
import { IconBath, IconBed, IconBuilt, IconCar, IconCheck, IconLand, IconPin, IconStairs } from '../components/Icons';
import { CardGrid, PropertyCard } from '../components/PropertyCard';
import { VisitForm } from '../components/VisitForm';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { TIPO_LABEL } from '../config/site';
import { banosTexto, numero, plural, precioTexto, ubicacion } from '../lib/format';
import { photoUrl } from '../lib/images';
import { similarTo, useProperties } from '../lib/properties';
import { propertyJsonLd } from '../lib/schema';
import { useSeo } from '../lib/seo';
import { track } from '../lib/track';
import { WA } from '../lib/whatsapp';
import type { Propiedad } from '../types';
import NotFound from './NotFound';

const MapApprox = lazy(() => import('../components/MapApprox').then((m) => ({ default: m.MapApprox })));

export function propertyTitle(p: Propiedad) {
  const parts = [p.nombre];
  if (p.recamaras) parts.push(plural(p.recamaras, 'recámara', 'recámaras'));
  parts.push(precioTexto(p));
  return `${parts.join(', ')} | Inmobiliaria Valle`;
}

export function propertyDescription(p: Propiedad) {
  const bits = [`${TIPO_LABEL[p.tipo]} en ${ubicacion(p)}`];
  if (p.recamaras) bits.push(plural(p.recamaras, 'recámara', 'recámaras'));
  if (p.banos) bits.push(banosTexto(p.banos));
  if (p.m2_terreno) bits.push(`${numero(p.m2_terreno)} m² de terreno`);
  let s = `${bits.join(', ')}. ${precioTexto(p)}.`;
  if (p.creditos.length) s += ` Acepta ${p.creditos.map((c) => c[0].toUpperCase() + c.slice(1)).join(', ')}.`;
  if (p.estatus === 'vendida') s += ' Vendida.';
  return s;
}

export default function PropertyDetail() {
  const { slug } = useParams();
  const { data, loading } = useProperties();
  const p = data?.find((x) => x.slug === slug);

  useEffect(() => {
    if (p) track('property_view', { slug: p.slug, price: p.precio ?? undefined, estatus: p.estatus });
  }, [p]);

  if (loading)
    return (
      <div className="sm:wrap sm:pt-14" aria-busy="true">
        <div className="aspect-[4/3] w-full bg-teal-50 sm:aspect-[2/1] sm:rounded-card" />
        <p className="wrap py-6 text-muted">Cargando…</p>
      </div>
    );
  if (!p) return <NotFound />;
  return <Detail p={p} all={data!} />;
}

function Detail({ p, all }: { p: Propiedad; all: Propiedad[] }) {
  const sold = p.estatus === 'vendida';
  const similar = similarTo(p, all);

  useSeo({
    title: propertyTitle(p),
    description: propertyDescription(p),
    path: `/propiedades/${p.slug}`,
    image: p.fotos[0] ? photoUrl(p.fotos[0]) : undefined,
    jsonLd: propertyJsonLd(p),
  });

  const facts = [
    p.recamaras != null && { icon: <IconBed />, label: plural(p.recamaras, 'recámara', 'recámaras') },
    p.banos != null && { icon: <IconBath />, label: banosTexto(p.banos) },
    p.estacionamientos != null && { icon: <IconCar />, label: p.estacionamientos === 0 ? 'Sin cochera' : plural(p.estacionamientos, 'estacionamiento', 'estacionamientos') },
    p.plantas != null && { icon: <IconStairs />, label: plural(p.plantas, 'planta', 'plantas') },
    p.m2_terreno != null && { icon: <IconLand />, label: `${numero(p.m2_terreno)} m² de terreno` },
    p.m2_construccion != null && { icon: <IconBuilt />, label: `${numero(p.m2_construccion)} m² de construcción` },
  ].filter(Boolean) as { icon: JSX.Element; label: string }[];

  return (
    <div className="pb-24 sm:pb-0">
      {sold && (
        <div className="bg-status-sold-bg">
          <p className="wrap py-3 font-semibold text-status-sold">Esta casa ya se vendió. Abajo te dejo opciones parecidas.</p>
        </div>
      )}

      <div className="wrap sm:pt-6">
        <nav className="hidden py-2 text-sm text-muted sm:block" aria-label="Ruta">
          <Link to="/propiedades">Propiedades</Link> <span aria-hidden="true">/</span> {p.colonia}
        </nav>
      </div>

      <div className="sm:wrap">
        <Gallery fotos={p.fotos} nombre={p.nombre} />
      </div>

      <div className="wrap mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge estatus={p.estatus} />
            {p.tipo !== 'casa' && <span className="text-sm font-semibold text-muted">{TIPO_LABEL[p.tipo]}</span>}
          </div>
          <h1 className="mt-3 text-[1.75rem] sm:text-4xl">{p.nombre}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <IconPin className="h-5 w-5 text-teal-500" />
            {p.direccion ? `${p.direccion}, ` : ''}
            {ubicacion(p)}
          </p>
          <p className={`price mt-4 text-3xl sm:text-4xl ${sold ? 'text-muted line-through decoration-2' : ''}`}>{precioTexto(p)}</p>

          {facts.length > 0 && (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 rounded-btn border border-line p-3">
                  <span className="text-teal-500">{f.icon}</span>
                  <span className="font-medium tabular">{f.label}</span>
                </li>
              ))}
            </ul>
          )}

          <section className="mt-8">
            <h2 className="text-xl">Créditos que acepta</h2>
            <div className="mt-3">
              {p.creditos.length ? <CreditBadges creditos={p.creditos} size="md" /> : <p className="text-muted">Pregúntame por WhatsApp con qué crédito se puede comprar.</p>}
            </div>
          </section>

          {p.caracteristicas.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl">Qué tiene</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {p.caracteristicas.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.descripcion && (
            <section className="mt-8">
              <h2 className="text-xl">Descripción</h2>
              <div className="mt-3 max-w-prose space-y-3 whitespace-pre-line">{p.descripcion}</div>
            </section>
          )}

          {p.cerca_de.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl">Qué hay cerca</h2>
              <ul className="mt-3 space-y-2">
                {p.cerca_de.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <IconPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.lat != null && p.lng != null && (
            <section className="mt-8">
              <h2 className="text-xl">Ubicación</h2>
              {!p.mostrar_direccion && <p className="mt-1 text-sm text-muted">Zona aproximada. La dirección exacta te la paso al agendar la visita.</p>}
              <div className="mt-3">
                <Suspense fallback={<div className="aspect-[4/3] rounded-card bg-teal-50 sm:aspect-[16/9]" />}>
                  <MapApprox lat={p.lat} lng={p.lng} exact={p.mostrar_direccion} />
                </Suspense>
              </div>
            </section>
          )}
        </div>

        {/* Columna de contacto */}
        <aside id="agendar" className="scroll-mt-20 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            {sold ? (
              <>
                <h2 className="text-xl">¿Buscas algo parecido?</h2>
                <p className="mt-2">Dime qué necesitas y te aviso en cuanto tenga una casa así.</p>
                <div className="mt-4">
                  <WhatsAppButton message={WA.soldSimilar(p)} location="sold_similar" slug={p.slug} className="btn-wa w-full">
                    Busco algo parecido
                  </WhatsAppButton>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl">Agendar visita</h2>
                <p className="mt-1 text-muted">Dime cuándo puedes y te confirmo por WhatsApp.</p>
                <div className="mt-4">
                  <VisitForm p={p} />
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-3 text-sm text-muted">¿Prefieres preguntar primero?</p>
                  <WhatsAppButton message={WA.property(p)} location="property" slug={p.slug} className="btn-wa w-full" />
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 bg-paper py-12">
          <div className="wrap">
            <h2 className="text-2xl">Casas parecidas</h2>
            <div className="mt-6">
              <CardGrid>{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</CardGrid>
            </div>
          </div>
        </section>
      )}

      {/* Barra fija en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 sm:hidden">
        {sold ? (
          <WhatsAppButton message={WA.soldSimilar(p)} location="sold_similar" slug={p.slug} className="btn-wa w-full">
            Busco algo parecido
          </WhatsAppButton>
        ) : (
          <div className="grid grid-cols-[1.3fr_1fr] gap-2">
            <WhatsAppButton message={WA.property(p)} location="sticky_bar" slug={p.slug} className="btn-wa gap-1.5 whitespace-nowrap px-2 text-sm" />
            <a href="#agendar" className="btn-primary whitespace-nowrap px-2 text-sm">Agendar visita</a>
          </div>
        )}
      </div>
    </div>
  );
}
