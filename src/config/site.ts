/**
 * Datos del negocio. Todo lo que dice [PLACEHOLDER] falta confirmarlo con Cristy.
 * Cambia aquí y se actualiza en todo el sitio.
 */
export const SITE = {
  name: 'Inmobiliaria Valle',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://inmobiliariavalle.com',

  agent: {
    shortName: 'Cristy',
    fullName: 'Cristy Valle [PLACEHOLDER: nombre completo]',
    role: '[PLACEHOLDER: cargo, p. ej. asesora inmobiliaria y dueña]',
    /** Pon la foto en public/img/cristy.webp (retrato, 4:5) y cambia a '/img/cristy.webp'. */
    photo: null as string | null,
  },

  /** Foto principal de la portada: public/img/hero.webp (4:3, al menos 1600 px de ancho). */
  heroPhoto: null as string | null,

  whatsapp: '523313501435',
  whatsappDisplay: '33 1350 1435',
  phone: '[PLACEHOLDER: teléfono, si es distinto al WhatsApp]',
  email: 'info@inmobiliariavalle.com',
  hours: '[PLACEHOLDER: horario, p. ej. lunes a sábado de 9:00 a 19:00]',

  /** Colonias y municipios donde trabaja Cristy. Se usan en la portada y en Nosotros. */
  serviceArea: '[PLACEHOLDER: colonias y municipios]',
  address: '[PLACEHOLDER: dirección de oficina o “Atiendo en toda la zona metropolitana de Guadalajara”]',

  social: {
    instagram: 'https://www.instagram.com/inmobiliaria.valle/',
    facebook: '' as string /* [PLACEHOLDER: URL de la página de Facebook] */,
    tiktok: '' as string /* [PLACEHOLDER: usuario de TikTok] */,
  },

  /** Enlace a las reseñas del Perfil de Empresa en Google. Vacío = no se muestra. */
  googleReviews: '' as string /* [PLACEHOLDER: enlace de reseñas de Google] */,
} as const;

export const TIPO_LABEL: Record<string, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  terreno: 'Terreno',
  local: 'Local',
  salon_eventos: 'Salón de eventos',
};

export const CREDITO_LABEL: Record<string, string> = {
  infonavit: 'Infonavit',
  fovissste: 'Fovissste',
  bancario: 'Bancario',
  contado: 'Contado',
};

export const ESTATUS_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  apartada: 'Apartada',
  vendida: 'Vendida',
};
