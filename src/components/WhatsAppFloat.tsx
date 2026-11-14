import { WA, waLink } from '../lib/whatsapp';
import { track } from '../lib/track';
import { IconWhatsApp } from './Icons';

/** Botón flotante en todas las páginas, excepto en la ficha de una casa (ahí hay barra fija). */
export function WhatsAppFloat() {
  return (
    <a
      href={waLink(WA.general())}
      target="_blank"
      rel="noopener"
      onClick={() => track('whatsapp_click', { location: 'float' })}
      className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-wa text-white shadow-hover hover:bg-wa-hover sm:bottom-6 sm:right-6"
      aria-label="Escribir por WhatsApp"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  );
}
