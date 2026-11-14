import { SUPABASE_URL } from './supabase';

/** Las fotos se guardan como "<id>.webp" (1600 px) y "<id>-sm.webp" (800 px). */
export function photoUrl(path: string, size: 'lg' | 'sm' = 'lg') {
  if (/^(https?:)?\//.test(path)) return path;
  const file = size === 'sm' ? path.replace(/\.webp$/, '-sm.webp') : path;
  return `${SUPABASE_URL}/storage/v1/object/public/propiedades/${file}`;
}

export function photoSrcSet(path: string) {
  if (/^(https?:)?\//.test(path)) return undefined;
  return `${photoUrl(path, 'sm')} 800w, ${photoUrl(path, 'lg')} 1600w`;
}

/** Convierte una imagen a WebP en el navegador, con el lado largo limitado a `max` px. */
export async function toWebp(file: File, max: number, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo convertir la imagen'))), 'image/webp', quality),
  );
}
