import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { FiltersForm } from '../components/FiltersForm';
import { IconSliders } from '../components/Icons';
import { CardGrid, CardSkeleton, PropertyCard } from '../components/PropertyCard';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { applyFilters, countActive, describeFilters, filtersToParams, parseFilters, zonas, type Filters } from '../lib/filters';
import { useProperties } from '../lib/properties';
import { useSeo } from '../lib/seo';
import { track } from '../lib/track';

export default function Properties() {
  const { data, loading, error } = useProperties();
  const [sp, setSp] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const f = useMemo(() => parseFilters(sp), [sp]);
  const rows = useMemo(() => applyFilters(data ?? [], f), [data, f]);
  const active = countActive(f);

  useSeo({
    title: 'Casas en venta en Guadalajara | Inmobiliaria Valle',
    description: 'Todas las casas en venta de Inmobiliaria Valle con precio, recámaras, metros y créditos que aceptan (Infonavit, Fovissste, bancario).',
    path: '/propiedades',
  });

  const update = useCallback(
    (next: Filters, changed: string, val: string) => {
      setSp(filtersToParams(next), { replace: true });
      track('filter_used', { filter: changed, value: val, source: 'listado' });
    },
    [setSp],
  );

  const clear = () => setSp(new URLSearchParams(), { replace: true });
  const desc = describeFilters(f);
  const emptyMsg = `Hola Cristy, busco casa${desc ? ` ${desc}` : ''}. Vi que ahorita no hay en su página, ¿me avisa si entra una?`;
  const zonasList = zonas(data ?? []);

  return (
    <div className="bg-paper">
      <div className="wrap py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl">Casas en venta</h1>
        <p className="mt-2 text-muted" aria-live="polite">
          {loading ? 'Cargando casas…' : `${rows.length} ${rows.length === 1 ? 'casa' : 'casas'}${desc ? ` ${desc}` : ''}`}
        </p>

        <div className="mt-6 lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Filtros escritorio */}
          <aside className="hidden lg:block" aria-label="Filtros">
            <div className="card sticky top-24 bg-teal-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg">Filtros</h2>
                {active > 0 && (
                  <button type="button" className="text-sm font-semibold text-teal-900 underline" onClick={clear}>
                    Quitar filtros
                  </button>
                )}
              </div>
              <FiltersForm value={f} zonas={zonasList} onChange={update} />
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <button type="button" className="btn-outline min-h-tap px-4 lg:hidden" onClick={() => setSheet(true)}>
                <IconSliders />
                Filtros{active > 0 && <span className="rounded-full bg-teal-900 px-2 text-sm text-white">{active}</span>}
              </button>
              <div className="ml-auto flex min-w-0 items-center gap-2">
                <label htmlFor="orden" className="sr-only text-sm font-semibold text-muted sm:not-sr-only">Ordenar</label>
                <select
                  id="orden"
                  className="field min-h-tap w-auto min-w-0 max-w-[13rem] py-1.5"
                  value={f.orden}
                  onChange={(e) => update({ ...f, orden: e.target.value as Filters['orden'] }, 'orden', e.target.value)}
                >
                  <option value="recientes">Más recientes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>

            {error && <p className="card p-5 text-status-hold">{error}</p>}

            {loading ? (
              <CardGrid>{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</CardGrid>
            ) : rows.length ? (
              <CardGrid>{rows.map((p, i) => <PropertyCard key={p.id} p={p} priority={i < 1} />)}</CardGrid>
            ) : (
              <div className="card max-w-xl p-6">
                <p className="text-lg font-semibold text-ink">No hay casas con esos filtros ahora. Dime qué buscas y te aviso cuando entre una.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <WhatsAppButton message={emptyMsg} location="empty_state" />
                  {active > 0 && (
                    <button type="button" className="btn-ghost" onClick={clear}>Quitar filtros</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filtros"
        footer={
          <div className="flex gap-3">
            {active > 0 && (
              <button type="button" className="btn-ghost" onClick={clear}>Quitar</button>
            )}
            <button type="button" className="btn-primary flex-1" onClick={() => setSheet(false)}>
              Ver {rows.length} {rows.length === 1 ? 'casa' : 'casas'}
            </button>
          </div>
        }
      >
        <FiltersForm value={f} zonas={zonasList} onChange={update} />
      </BottomSheet>
    </div>
  );
}
