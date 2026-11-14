# Pendientes por confirmar

Todo lo que aparece como `[PLACEHOLDER]` en el sitio, y dónde cambiarlo.

## Negocio (src/config/site.ts)
- [ ] Nombre completo de Cristy y su cargo
- [ ] Foto de Cristy → `public/img/cristy.webp`
- [ ] Foto de portada (real, sin stock) → `public/img/hero.webp`
- [ ] Horario de atención (sale en el mensaje de gracias, Contacto y pie)
- [ ] Colonias y municipios donde trabaja (portada, Nosotros, pie)
- [ ] Dirección de oficina o zona de servicio
- [ ] Teléfono, si es distinto al WhatsApp
- [ ] URL de Facebook
- [ ] Usuario de TikTok
- [ ] Enlace a reseñas de Google (Perfil de Empresa)
- [ ] ¿"Te escribo hoy mismo" aplica fines de semana?
- [ ] Confirmar que Cristy contesta personalmente el WhatsApp (el texto lo dice)

## Páginas
- [ ] Nosotros: historia en primera persona, con datos reales (src/pages/About.tsx)
- [ ] Aviso de privacidad: texto actual (src/pages/Privacy.tsx)

## Medición y servicios (.env / Supabase)
- [ ] ID de GA4
- [ ] ID de Meta Pixel
- [ ] Proyecto de Supabase
- [ ] Cuenta de Resend + dominio verificado para los correos de leads
- [ ] Correo(s) de acceso al panel
- [ ] Quién controla el DNS de inmobiliariavalle.com

## Inmuebles (los 7)
- [ ] Fotos reales de todos (ninguna se ha entregado)
- [ ] Créditos que acepta cada uno (Infonavit / Fovissste / Bancario / Contado)
- [ ] Cada cifra de m²: ¿terreno o construcción? (por ahora todas están como terreno)
- [ ] Estacionamientos y plantas
- [ ] Qué hay cerca
- [ ] Descripción en palabras de Cristy
- [ ] Ubicación aproximada (lat/lng) para el mapa
- [ ] Cuál o cuáles son destacadas (por ahora: la de Esteban Alatorre)
- [ ] #1 Esteban Alatorre: municipio Guadalajara, confirmar
- [ ] #2 Beatriz Hernández: cargar la dirección privada desde el panel y decidir si se muestra; cochera para cuántos autos
- [ ] #3 Santa Paula: municipio
- [ ] #4 Nubia: municipio
- [ ] #5 Felipe Ángeles: ¿ya está vendida? (por ahora disponible)
- [ ] #6 Beatriz Hernández (6 recámaras): nombre público "Casa de 6 recámaras en Beatriz Hernández", confirmar
- [ ] #7 GDL-31: nombre público, colonia y municipio

## Accesibilidad (decisión de marca)
- [ ] Botón de WhatsApp: blanco sobre #25D366 tiene contraste 2:1 (WCAG AA pide 4.5:1). Si quieres AA completo, texto en #14262B sobre el mismo verde da 7.9:1.
- [ ] Etiqueta "Disponible": #2E7D4F sobre #E7F4EC da 4.45:1, apenas abajo de 4.5:1. Con #2A7349 da 5.1:1.
