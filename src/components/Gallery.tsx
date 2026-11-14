import { useEffect, useRef, useState } from 'react';
import { photoSrcSet, photoUrl } from '../lib/images';
import { IconChevron, IconClose, IconExpand } from './Icons';
import { PropertyImage } from './PropertyImage';

/** Galería: deslizable en móvil, mosaico en escritorio, visor a pantalla completa. */
export function Gallery({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const total = fotos.length;
  const alt = (i: number) => `${nombre}, foto ${i + 1} de ${total}`;

  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!total) return <PropertyImage alt={nombre} className="sm:rounded-card" />;

  return (
    <>
      {/* Móvil */}
      <div className="relative sm:hidden">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label={`Fotos de ${nombre}`}>
          {fotos.map((f, i) => (
            <button key={f} type="button" className="w-full shrink-0 snap-center" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1} en grande`}>
              <img
                src={photoUrl(f, 'lg')}
                srcSet={photoSrcSet(f)}
                sizes="100vw"
                alt={alt(i)}
                width={800}
                height={600}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                className="aspect-[4/3] w-full bg-teal-50 object-cover"
              />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-scrim px-3 py-1 text-sm font-semibold text-white tabular">
          {index + 1} / {total}
        </span>
      </div>

      {/* Escritorio */}
      <div className="relative hidden gap-2 overflow-hidden rounded-card sm:grid sm:grid-cols-4 sm:grid-rows-2">
        {fotos.slice(0, 5).map((f, i) => (
          <button
            key={f}
            type="button"
            onClick={() => setViewer(i)}
            className={i === 0 ? 'col-span-2 row-span-2' : total < 5 && i === total - 1 ? 'col-span-2' : ''}
            aria-label={`Ver foto ${i + 1} en grande`}
          >
            <img
              src={photoUrl(f, i === 0 ? 'lg' : 'sm')}
              alt={alt(i)}
              width={800}
              height={600}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full bg-teal-50 object-cover"
            />
          </button>
        ))}
        <button type="button" className="btn absolute bottom-3 right-3 min-h-tap bg-white text-sm text-teal-900 shadow-hover hover:bg-teal-50" onClick={() => setViewer(0)}>
          <IconExpand /> Ver las {total} fotos
        </button>
      </div>

      {viewer != null && <Viewer fotos={fotos} start={viewer} alt={alt} onClose={() => setViewer(null)} />}
    </>
  );
}

function Viewer({ fotos, start, alt, onClose }: { fotos: string[]; start: number; alt: (i: number) => string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(start);
  const go = (n: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(fotos.length - 1, n));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = start * el.clientWidth;
    document.body.style.overflow = 'hidden';
    el?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, [start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-scrim" role="dialog" aria-modal="true" aria-label="Fotos a pantalla completa">
      <div className="flex items-center justify-between p-2 text-white">
        <span className="px-3 font-semibold tabular">{i + 1} / {fotos.length}</span>
        <button type="button" className="btn min-h-tap px-3 text-white" onClick={onClose}>
          <IconClose className="h-7 w-7" />
          <span className="sr-only">Cerrar</span>
        </button>
      </div>
      <div
        ref={ref}
        tabIndex={-1}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto outline-none"
      >
        {fotos.map((f, n) => (
          <div key={f} className="flex w-full shrink-0 snap-center items-center justify-center p-2">
            <img src={photoUrl(f, 'lg')} alt={alt(n)} loading={Math.abs(n - start) <= 1 ? 'eager' : 'lazy'} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
      <div className="hidden justify-center gap-4 p-4 sm:flex">
        <button type="button" className="btn min-h-tap bg-white text-teal-900" onClick={() => go(i - 1)} disabled={i === 0}>
          <IconChevron dir="left" /> Anterior
        </button>
        <button type="button" className="btn min-h-tap bg-white text-teal-900" onClick={() => go(i + 1)} disabled={i === fotos.length - 1}>
          Siguiente <IconChevron />
        </button>
      </div>
    </div>
  );
}
