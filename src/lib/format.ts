import type { Propiedad } from '../types';

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function precioTexto(p: Pick<Propiedad, 'precio' | 'precio_a_consultar'>): string {
  if (p.precio_a_consultar || p.precio == null) return 'Precio a consultar';
  return mxn.format(p.precio);
}

export function numero(n: number): string {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(n);
}

export function banosTexto(n: number): string {
  const enteros = Math.floor(n);
  const medio = n - enteros >= 0.5;
  if (!medio) return `${enteros} ${enteros === 1 ? 'baño' : 'baños'}`;
  if (enteros === 0) return 'Medio baño';
  return `${enteros} ${enteros === 1 ? 'baño' : 'baños'} y medio`;
}

export function plural(n: number, uno: string, varios: string) {
  return `${numero(n)} ${n === 1 ? uno : varios}`;
}

/** "Santa Paula, Tonalá" */
export function ubicacion(p: Pick<Propiedad, 'colonia' | 'municipio'>) {
  return [p.colonia, p.municipio].filter(Boolean).join(', ');
}

export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `${d.slice(0, 2)} ${d.slice(2)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
}

export function fechaCorta(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}
