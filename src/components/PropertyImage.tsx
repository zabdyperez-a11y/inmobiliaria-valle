import { photoSrcSet, photoUrl } from '../lib/images';
import { IconCamera } from './Icons';

interface Props {
  path?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  size?: 'sm' | 'lg';
}

/** Foto 4:3 con espacio reservado (sin saltos de diseño). Si aún no hay foto, muestra un aviso neutro. */
export function PropertyImage({ path, alt, priority, sizes = '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw', className = '', size = 'sm' }: Props) {
  if (!path) {
    return (
      <div className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-teal-50 text-muted ${className}`} role="img" aria-label={`${alt} (foto pendiente)`}>
        <IconCamera className="h-8 w-8 text-teal-500" />
        <span className="text-sm font-medium">Foto pendiente</span>
      </div>
    );
  }
  return (
    <img
      src={photoUrl(path, size)}
      srcSet={photoSrcSet(path)}
      sizes={sizes}
      alt={alt}
      width={800}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`aspect-[4/3] w-full bg-teal-50 object-cover ${priority ? '' : 'fade-in'} ${className}`}
    />
  );
}
