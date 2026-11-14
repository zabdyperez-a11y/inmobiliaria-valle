import { Link } from 'react-router-dom';
import { CardGrid, CardSkeleton, PropertyCard } from '../components/PropertyCard';
import { QuickSearch } from '../components/QuickSearch';
import { Section } from '../components/Layout';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { AgentPhoto } from '../components/AgentPhoto';
import { SITE } from '../config/site';
import { zonas } from '../lib/filters';
import { byRecent, useProperties } from '../lib/properties';
import { useSeo } from '../lib/seo';
import { WA } from '../lib/whatsapp';
import { agentJsonLd } from '../lib/schema';

const COMPRAR = [
  'Me dices qué buscas: zona, presupuesto y si vas con Infonavit, Fovissste, banco o de contado.',
  'Te mando solo casas que aceptan tu forma de pago y vamos a verlas el día que te acomode.',
  'Antes de que firmes reviso escrituras y adeudos. La firma es en notaría y ahí estoy contigo.',
];
const VENDER = [
  'Voy a ver tu casa y te digo en cuánto se puede vender, con precios de casas parecidas en tu colonia.',
  'Le tomo fotos reales y la publico donde la gente de la zona busca: Facebook, Instagram, TikTok y WhatsApp.',
  'Yo atiendo las visitas y llevo los papeles hasta la firma en notaría.',
];

export default function Home() {
  const { data, loading } = useProperties();
  useSeo({
    title: 'Casas en venta en Guadalajara con papeles en orden | Inmobiliaria Valle',
    description:
      'Casas en venta en la zona metropolitana de Guadalajara, de $700 mil a $4 millones. Aceptan Infonavit, Fovissste o crédito bancario. Escríbele a Cristy por WhatsApp.',
    path: '/',
    jsonLd: agentJsonLd(),
  });

  const all = data ?? [];
  const available = all
    .filter((p) => p.estatus !== 'vendida')
    .sort((a, b) => Number(b.destacada) - Number(a.destacada) || byRecent(a, b))
    .slice(0, 6);
  const sold = all
    .filter((p) => p.estatus === 'vendida')
    .sort((a, b) => (b.fecha_vendida ?? '').localeCompare(a.fecha_vendida ?? ''))
    .slice(0, 3);

  return (
    <>
      {/* Portada */}
      <section className="bg-white">
        <div className="wrap grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12">
          <div>
            <h1 className="text-[2rem] leading-[1.15] sm:text-5xl">Casas en venta en Guadalajara, con papeles en orden</h1>
            <p className="mt-4 max-w-xl text-lg text-ink">
              Te ayudo a comprar o vender tu casa en {SITE.serviceArea}. Revisamos escrituras y crédito antes de que des un paso.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/propiedades" className="btn-primary">Ver casas disponibles</Link>
              <Link to="/vende-tu-casa" className="btn-outline">Quiero vender mi casa</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-card">
            {SITE.heroPhoto ? (
              <img src={SITE.heroPhoto} alt="[PLACEHOLDER: describe la foto]" width={1200} height={900} fetchPriority="high" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-teal-50 p-6 text-center text-muted">
                [PLACEHOLDER: foto real de una casa o de Cristy en una colonia donde trabaja]
              </div>
            )}
          </div>
        </div>
        <div className="wrap pb-10">
          <QuickSearch zonas={zonas(all)} />
        </div>
      </section>

      {/* Disponibles */}
      <Section tone="paper">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">Casas disponibles</h2>
          <Link to="/propiedades" className="font-semibold">Ver todas las casas</Link>
        </div>
        <div className="mt-6">
          <CardGrid>
            {loading
              ? Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)
              : available.map((p, i) => <PropertyCard key={p.id} p={p} priority={i === 0} />)}
          </CardGrid>
        </div>
      </Section>

      {/* Cómo trabajo */}
      <Section>
        <h2 className="text-2xl sm:text-3xl">Cómo trabajo</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          <Steps title="Si vas a comprar" steps={COMPRAR} />
          <Steps title="Si vas a vender" steps={VENDER} />
        </div>
      </Section>

      {/* Vendidas */}
      {sold.length > 0 && (
        <Section tone="paper">
          <h2 className="text-2xl sm:text-3xl">Vendidas recientemente</h2>
          <p className="mt-2 text-muted">Casas que ya encontraron dueño.</p>
          <div className="mt-6">
            <CardGrid>{sold.map((p) => <PropertyCard key={p.id} p={p} />)}</CardGrid>
          </div>
        </Section>
      )}

      {/* Cristy */}
      <Section>
        <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-center">
          <AgentPhoto className="mx-auto w-full max-w-[280px]" />
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl">Hola, soy {SITE.agent.shortName}</h2>
            <p className="mt-4 text-lg">
              Me dedico a vender y comprar casas en {SITE.serviceArea}. Antes de enseñarte una casa reviso que tenga los papeles en orden y te digo con qué crédito se puede comprar.
            </p>
            <p className="mt-3 text-lg">Si tienes una duda, por pequeña que sea, escríbeme. Los mensajes de WhatsApp los contesto yo.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton message={WA.general()} location="intro" />
              <Link to="/nosotros" className="btn-ghost">Conoce más de mí</Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Vender */}
      <section className="bg-teal-900 py-12 text-white sm:py-16">
        <div className="wrap flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-2xl text-2xl text-white sm:text-3xl">¿Quieres vender tu casa? Te digo cuánto vale y cómo venderla.</h2>
          <Link to="/vende-tu-casa" className="btn shrink-0 bg-white text-teal-900 hover:bg-teal-50">Quiero vender mi casa</Link>
        </div>
      </section>
    </>
  );
}

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="text-xl">{title}</h3>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="price flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-teal-500 text-base">{i + 1}</span>
            <p className="pt-1">{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
