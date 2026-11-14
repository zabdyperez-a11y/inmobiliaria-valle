import { useEffect } from 'react';
import { SITE } from '../config/site';

interface Seo {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Título, descripción, Open Graph y JSON-LD por página. El HTML pre-renderizado ya trae lo mismo para los bots. */
export function useSeo({ title, description, path, image, jsonLd, noindex }: Seo) {
  useEffect(() => {
    const url = SITE.url + path;
    const img = image ? (image.startsWith('http') ? image : SITE.url + image) : `${SITE.url}/og-default.png`;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex' : 'index,follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:card', 'summary_large_image');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    document.getElementById('jsonld')?.remove();
    if (jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'jsonld';
      s.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
  }, [title, description, path, image, jsonLd, noindex]);
}
