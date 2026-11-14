import { SITE } from '../config/site';
import type { Propiedad } from '../types';
import { photoUrl } from './images';
import { propertyUrl } from './whatsapp';

export function agentJsonLd() {
  const sameAs = [SITE.social.instagram, SITE.social.facebook].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon-512.png`,
    image: `${SITE.url}/og-default.png`,
    telephone: `+${SITE.whatsapp}`,
    email: SITE.email,
    areaServed: { '@type': 'City', name: 'Guadalajara', containedInPlace: { '@type': 'State', name: 'Jalisco' } },
    address: { '@type': 'PostalAddress', addressLocality: 'Guadalajara', addressRegion: 'Jalisco', addressCountry: 'MX' },
    sameAs,
  };
}

export function propertyJsonLd(p: Propiedad) {
  const residence: Record<string, unknown> = {
    '@type': p.tipo === 'departamento' ? 'Apartment' : p.tipo === 'casa' ? 'SingleFamilyResidence' : 'Place',
    name: p.nombre,
    address: { '@type': 'PostalAddress', addressLocality: p.municipio, addressRegion: 'Jalisco', addressCountry: 'MX', streetAddress: p.direccion ?? undefined },
  };
  if (p.recamaras != null) residence.numberOfRooms = p.recamaras;
  if (p.banos != null) residence.numberOfBathroomsTotal = p.banos;
  if (p.m2_construccion ?? p.m2_terreno) residence.floorSize = { '@type': 'QuantitativeValue', value: p.m2_construccion ?? p.m2_terreno, unitCode: 'MTK' };
  if (p.lat != null && p.lng != null) residence.geo = { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng };

  const offer: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    url: propertyUrl(p.slug),
    name: p.nombre,
    image: p.fotos.slice(0, 5).map((f) => photoUrl(f)),
    availability: p.estatus === 'disponible' ? 'https://schema.org/InStock' : p.estatus === 'apartada' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/SoldOut',
    seller: { '@type': 'RealEstateAgent', name: SITE.name, url: SITE.url },
    itemOffered: residence,
  };
  if (p.precio != null && !p.precio_a_consultar) {
    offer.price = p.precio;
    offer.priceCurrency = 'MXN';
  }
  return offer;
}
