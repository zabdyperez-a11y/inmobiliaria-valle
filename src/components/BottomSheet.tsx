import { useEffect, useRef, type ReactNode } from 'react';
import { IconClose } from './Icons';

export function BottomSheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-scrim/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[16px] bg-white shadow-sheet outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 className="text-lg">{title}</h2>
          <button type="button" className="btn-ghost min-h-tap px-2" onClick={onClose}>
            <IconClose className="h-6 w-6" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );
}
