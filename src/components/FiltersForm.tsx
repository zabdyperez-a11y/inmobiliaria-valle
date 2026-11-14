import { CREDITO_LABEL, ESTATUS_LABEL } from '../config/site';
import { DEFAULT_ESTATUS, PRESUPUESTOS, type Filters } from '../lib/filters';
import type { Credito, Estatus } from '../types';

interface Props {
  value: Filters;
  zonas: string[];
  onChange: (next: Filters, changed: string, val: string) => void;
}

const CREDITOS: Credito[] = ['infonavit', 'fovissste', 'bancario', 'contado'];
const ESTATUS: Estatus[] = ['disponible', 'apartada', 'vendida'];

export function FiltersForm({ value: f, zonas, onChange }: Props) {
  const presIdx = Math.max(0, PRESUPUESTOS.findIndex((p) => p.min === f.min && p.max === f.max));
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="f-zona" className="label">Colonia o municipio</label>
        <select id="f-zona" className="field" value={f.zona} onChange={(e) => onChange({ ...f, zona: e.target.value }, 'zona', e.target.value)}>
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-pres" className="label">Presupuesto</label>
        <select
          id="f-pres"
          className="field"
          value={presIdx}
          onChange={(e) => {
            const p = PRESUPUESTOS[Number(e.target.value)];
            onChange({ ...f, min: p.min, max: p.max }, 'presupuesto', p.label);
          }}
        >
          {PRESUPUESTOS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Recámaras</legend>
        <div className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4].map((n) => (
            <button
              key={String(n)}
              type="button"
              className="chip"
              aria-pressed={f.rec === n}
              onClick={() => onChange({ ...f, rec: n }, 'recamaras', String(n ?? 'todas'))}
            >
              {n == null ? 'Todas' : `${n}+`}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Crédito que acepta</legend>
        <div className="flex flex-wrap gap-2">
          {CREDITOS.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={f.credito.includes(c)}
              onClick={() => onChange({ ...f, credito: toggle(f.credito, c) }, 'credito', c)}
            >
              {CREDITO_LABEL[c]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Estatus</legend>
        <div className="flex flex-wrap gap-2">
          {ESTATUS.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={f.estatus.includes(s)}
              onClick={() => {
                const next = toggle(f.estatus, s);
                onChange({ ...f, estatus: next.length ? next : DEFAULT_ESTATUS }, 'estatus', s);
              }}
            >
              {ESTATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
