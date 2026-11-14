import { CREDITO_LABEL, ESTATUS_LABEL } from '../config/site';
import type { Credito, Estatus } from '../types';

const STATUS_CLASS: Record<Estatus, string> = {
  disponible: 'bg-status-ok-bg text-status-ok',
  apartada: 'bg-status-hold-bg text-status-hold',
  vendida: 'bg-status-sold-bg text-status-sold',
};

export function StatusBadge({ estatus, className = '' }: { estatus: Estatus; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[estatus]} ${className}`}>
      {ESTATUS_LABEL[estatus]}
    </span>
  );
}

export function CreditBadges({ creditos, size = 'sm' }: { creditos: Credito[]; size?: 'sm' | 'md' }) {
  if (!creditos.length) return null;
  const cls = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Créditos que acepta">
      {creditos.map((c) => (
        <li key={c} className={`rounded-md border border-teal-500/40 bg-teal-50 font-semibold text-teal-900 ${cls}`}>
          {CREDITO_LABEL[c]}
        </li>
      ))}
    </ul>
  );
}
