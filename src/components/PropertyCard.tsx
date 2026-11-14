import { Link } from 'react-router-dom';
import { TIPO_LABEL } from '../config/site';
import { banosTexto, numero, plural, precioTexto, ubicacion } from '../lib/format';
import type { Propiedad } from '../types';
import { CreditBadges, StatusBadge } from './Badges';
import { PropertyImage } from './PropertyImage';

export function PropertyCard({ p, priority = false }: { p: Propiedad; priority?: boolean }) {
  const facts: string[] = [];
  if (p.recamaras != null) facts.push(plural(p.recamaras, 'recámara', 'recámaras'));
  if (p.banos != null) facts.push(banosTexto(p.banos));
  const m2: string[] = [];
  if (p.m2_terreno != null) m2.push(`${numero(p.m2_terreno)} m² terreno`);
  if (p.m2_construccion != null) m2.push(`${numero(p.m2_construccion)} m² construcción`);
  const sold = p.estatus === 'vendida';

  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-hover">
      <div className="relative">
        <PropertyImage path={p.fotos[0]} alt={`${p.nombre}, ${ubicacion(p)}`} priority={priority} className={sold ? 'opacity-80' : ''} />
        <StatusBadge estatus={p.estatus} className="absolute left-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className={`price text-2xl ${sold ? 'text-muted' : ''}`}>{precioTexto(p)}</p>
        <h3 className="text-lg leading-snug">
          <Link to={`/propiedades/${p.slug}`} className="no-underline after:absolute after:inset-0 hover:underline">
            {p.nombre}
          </Link>
        </h3>
        <p className="text-muted">
          {p.tipo !== 'casa' && <span>{TIPO_LABEL[p.tipo]} · </span>}
          {ubicacion(p)}
        </p>
        {facts.length > 0 && <p className="text-ink tabular">{facts.join(' · ')}</p>}
        {m2.length > 0 && <p className="text-sm text-muted tabular">{m2.join(' · ')}</p>}
        <div className="mt-auto pt-2">
          <CreditBadges creditos={p.creditos} />
        </div>
      </div>
    </article>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="aspect-[4/3] bg-teal-50" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-32 rounded bg-teal-50" />
        <div className="h-5 w-3/4 rounded bg-teal-50" />
        <div className="h-4 w-1/2 rounded bg-teal-50" />
      </div>
    </div>
  );
}
