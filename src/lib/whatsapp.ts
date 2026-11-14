import { SITE } from '../config/site';
import type { Propiedad } from '../types';
import { precioTexto } from './format';

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function propertyUrl(slug: string) {
  return `${SITE.url}/propiedades/${slug}`;
}

/** "Casa en Santa Paula" -> "casa en Santa Paula" para que la frase se lea natural. */
function enFrase(nombre: string) {
  return /^(Casa|Departamento|Terreno|Local|Salón)\b/.test(nombre) ? nombre[0].toLowerCase() + nombre.slice(1) : nombre;
}

export const WA = {
  general: () => 'Hola Cristy, vi su página y quiero información.',
  property: (p: Propiedad) => {
    const precio = p.precio_a_consultar || p.precio == null ? '' : ` de ${precioTexto(p)}`;
    return `Hola Cristy, me interesa la ${enFrase(p.nombre)}${precio} (${propertyUrl(p.slug)}). ¿Sigue disponible?`;
  },
  soldSimilar: (p: Propiedad) =>
    `Hola Cristy, vi la ${enFrase(p.nombre)} que ya se vendió (${propertyUrl(p.slug)}). Busco algo parecido.`,
  sell: (colonia?: string) =>
    colonia ? `Hola Cristy, quiero vender mi casa en ${colonia}.` : 'Hola Cristy, quiero vender mi casa.',
};
