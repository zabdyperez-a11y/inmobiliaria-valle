import type { ReactNode } from 'react';
import { track } from '../lib/track';
import { waLink } from '../lib/whatsapp';
import { IconWhatsApp } from './Icons';

interface Props {
  message: string;
  location: string;
  slug?: string;
  children?: ReactNode;
  className?: string;
}

/** Todos los enlaces de WhatsApp pasan por aquí: mensaje prellenado + evento whatsapp_click. */
export function WhatsAppButton({ message, location, slug, children = 'Escribir por WhatsApp', className = 'btn-wa' }: Props) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => track('whatsapp_click', { location, slug })}
    >
      <IconWhatsApp />
      <span>{children}</span>
    </a>
  );
}
