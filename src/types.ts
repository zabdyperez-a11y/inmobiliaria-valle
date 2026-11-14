export type Tipo = 'casa' | 'departamento' | 'terreno' | 'local' | 'salon_eventos';
export type Estatus = 'disponible' | 'apartada' | 'vendida';
export type Credito = 'infonavit' | 'fovissste' | 'bancario' | 'contado';

export interface Propiedad {
  id: string;
  slug: string;
  nombre: string;
  tipo: Tipo;
  colonia: string;
  municipio: string;
  /** Solo llega al sitio público si mostrar_direccion = true. */
  direccion: string | null;
  mostrar_direccion: boolean;
  lat: number | null;
  lng: number | null;
  precio: number | null;
  precio_a_consultar: boolean;
  estatus: Estatus;
  recamaras: number | null;
  banos: number | null;
  estacionamientos: number | null;
  plantas: number | null;
  m2_terreno: number | null;
  m2_construccion: number | null;
  caracteristicas: string[];
  creditos: Credito[];
  descripcion: string;
  cerca_de: string[];
  /** Rutas en el bucket "propiedades" o URLs completas. La primera es la portada. */
  fotos: string[];
  destacada: boolean;
  fecha_publicacion: string;
  fecha_vendida: string | null;
}

export type LeadTipo = 'visita' | 'vender' | 'contacto';

export interface Lead {
  id: string;
  tipo: LeadTipo;
  nombre: string;
  whatsapp: string;
  propiedad_id: string | null;
  datos: Record<string, unknown>;
  pagina_origen: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  estado: 'nuevo' | 'contactado' | 'cerrado';
  created_at: string;
}
