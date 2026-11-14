import { AgentPhoto } from '../components/AgentPhoto';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SITE } from '../config/site';
import { useSeo } from '../lib/seo';
import { WA } from '../lib/whatsapp';

export default function About() {
  useSeo({
    title: `${SITE.agent.shortName} Valle, asesora inmobiliaria en Guadalajara | Inmobiliaria Valle`,
    description: `Conoce a ${SITE.agent.shortName}, de Inmobiliaria Valle. Compra y venta de casas en ${SITE.serviceArea}.`,
    path: '/nosotros',
  });
  return (
    <div className="wrap grid gap-10 py-10 sm:py-14 md:grid-cols-[320px_1fr] md:gap-14">
      <AgentPhoto className="w-full max-w-[320px]" />
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Hola, soy {SITE.agent.shortName}</h1>
        <p className="mt-1 font-semibold text-muted">{SITE.agent.fullName} · {SITE.agent.role}</p>

        <div className="mt-6 space-y-4 text-lg">
          <p>[PLACEHOLDER: tu historia en primera persona. Cómo empezaste a vender casas, por qué en estas colonias y qué te gusta de este trabajo. Usa solo datos reales: años, número de casas vendidas o certificaciones únicamente si son ciertos.]</p>
          <p>[PLACEHOLDER: un párrafo sobre cómo trabajas con compradores que van con Infonavit, Fovissste o banco.]</p>
        </div>

        <h2 className="mt-10 text-2xl">Dónde trabajo</h2>
        <p className="mt-3 text-lg">{SITE.serviceArea}</p>

        <div className="mt-8">
          <WhatsAppButton message={WA.general()} location="about" />
        </div>
      </div>
    </div>
  );
}
