# Inmobiliaria Valle

Sitio web de Inmobiliaria Valle (Guadalajara). Su único trabajo es convertir visitas en conversaciones de WhatsApp, visitas agendadas y vendedores interesados.

Stack: React + Vite + TypeScript + Tailwind CSS + Supabase. Compatible con Bolt.new.

---

## 1. Correrlo en tu computadora

```bash
npm install
cp .env.example .env    # llena las variables (ver abajo)
npm run dev             # http://localhost:5173
```

Sin variables de Supabase el sitio funciona igual con los 7 inmuebles de `src/data/seed.json`. Los formularios muestran el mensaje de gracias, pero no guardan nada. Sirve para revisar diseño y textos.

`npm run build` compila el sitio y además:
- genera un HTML por página y por propiedad con su título, precio y foto de portada (para las vistas previas de WhatsApp, Facebook y Google)
- genera `sitemap.xml` y `robots.txt`

## 2. Abrirlo en Bolt sin gastar créditos

1. En Bolt: **Import from GitHub** y elige este repositorio (o abre `https://bolt.new/~/github.com/zabdyperez-a11y/inmobiliaria-valle`).
2. En Bolt, conecta Supabase desde el botón de integraciones o pon las variables de `.env.example` en el archivo `.env`.
3. Edita archivos directamente en el editor de código de Bolt. Los cambios a mano no gastan tokens; solo el chat de la IA los gasta.

## 3. Configurar Supabase (una vez)

1. Crea un proyecto en supabase.com (o usa el que Bolt crea al conectar).
2. **SQL Editor** → pega y corre `supabase/schema.sql`. Crea tablas, vista pública, permisos y los dos buckets de fotos.
3. **SQL Editor** → pega y corre `supabase/seed.sql` (los 7 inmuebles iniciales).
4. **Authentication → Users → Add user**: crea el usuario de Cristy con correo y contraseña.
5. **SQL Editor**, para darle permisos de administradora:
   ```sql
   insert into admins (user_id) select id from auth.users where email = 'CORREO_DE_CRISTY';
   ```
6. **Project Settings → API**: copia `Project URL` y `anon public key` a `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Aviso por correo con cada lead

1. Crea una cuenta gratis en resend.com, verifica el dominio `inmobiliariavalle.com` y saca una API key.
2. Instala el CLI de Supabase y publica la función:
   ```bash
   supabase functions deploy notify-lead --no-verify-jwt
   supabase secrets set RESEND_API_KEY=re_xxx WEBHOOK_SECRET=una-clave-larga NOTIFY_FROM="Página web <avisos@inmobiliariavalle.com>"
   ```
3. **Database → Webhooks → Create**: tabla `leads`, evento `INSERT`, tipo *Supabase Edge Function* → `notify-lead`. Agrega el header `x-webhook-secret` con el mismo valor de `WEBHOOK_SECRET`.

Cada formulario manda un correo a info@inmobiliariavalle.com con nombre, WhatsApp (con botón para escribirle), datos, página y origen (UTM).

## 4. Agregar una propiedad

1. Entra a `/admin` con el usuario de Cristy.
2. **Agregar propiedad** → llena los datos. El slug (dirección web) se arma solo con el nombre y la colonia.
3. **Subir fotos**: se convierten a WebP en el navegador (1600 px y 800 px). Arrastra o usa las flechas para ordenarlas. La primera es la portada.
4. **Guardar**. La casa aparece de inmediato en el sitio.
5. Cuando se venda: cambia el estatus a **Vendida** desde la lista. La página sigue viva con el aviso de vendida y casas parecidas.

Latitud y longitud: en Google Maps, mantén presionado sobre la calle y copia los dos números. Si "Mostrar dirección exacta" está apagado, el mapa enseña solo un círculo de la zona y la dirección nunca sale de la base de datos (la vista `propiedades_publicas` la oculta).

## 5. Ver los leads

`/admin/leads`: todos los formularios, del más nuevo al más viejo, con su origen (utm_source / medium / campaign), la casa que les interesó, las fotos que mandaron los vendedores y un estado (nuevo, contactado, cerrado).

## 6. Publicar

**Opción recomendada: Netlify** (gratis). Conecta el repositorio y pon las variables de `.env.example` en *Site settings → Environment variables*. `netlify.toml` ya trae todo, incluida la función `og` que pone título, precio y foto de cada casa en la vista previa de WhatsApp en el momento, aunque la casa se haya agregado después de publicar.

**Bolt hosting** también funciona: las páginas de las casas se generan al publicar. Después de agregar una casa nueva en el panel, vuelve a publicar en Bolt para que su vista previa en WhatsApp salga con foto y precio (la página en sí ya funciona sin volver a publicar).

Dominio: apunta `inmobiliariavalle.com` al hosting que elijas y cambia `VITE_SITE_URL` si usas otro.

## 7. Medición

- Pon `VITE_GA4_ID` y `VITE_META_PIXEL_ID`. Se cargan solo si el visitante acepta el aviso de cookies (el aviso aparece solo si hay algún ID).
- Eventos: `whatsapp_click` (con `location`: header, float, property, sticky_bar, sell, contact, empty_state, sold_similar, thank_you, intro, about, footer, 404), `visit_form_submit`, `sell_form_submit`, `contact_form_submit`, `property_view` (slug, price, estatus), `filter_used` (filter, value, source).
- En Meta: WhatsApp → `Contact`, formularios → `Lead`, ficha de casa → `ViewContent`, filtros → `Search`.
- Los UTM de la primera visita (o `fbclid`) se guardan y viajan con cada lead.

## Dónde cambiar cosas

| Qué | Dónde |
|---|---|
| Teléfono, horario, zona, redes, nombre y foto de Cristy | `src/config/site.ts` |
| Colores | `src/config/palette.js` (Tailwind solo permite estos) |
| Logo | `public/brand/` |
| Foto de portada y de Cristy | `public/img/hero.webp`, `public/img/cristy.webp` y luego en `src/config/site.ts` |
| Mensajes prellenados de WhatsApp | `src/lib/whatsapp.ts` |
| Textos de "Cómo trabajo" | `src/pages/Home.tsx` |
| Pasos para vender | `src/pages/Sell.tsx` |
| Aviso de privacidad | `src/pages/Privacy.tsx` |

## Estructura

```
public/            logo, favicon, imagen para compartir
scripts/           prerender.mjs (HTML por casa + sitemap)
supabase/          schema.sql, seed.sql, functions/notify-lead
netlify/           edge-functions/og.ts
src/
  config/          site.ts (datos del negocio), palette.js
  data/            seed.json (7 inmuebles iniciales)
  lib/             datos, filtros, WhatsApp, medición, UTM, SEO, schema.org
  components/      tarjetas, galería, mapa, formularios, encabezado, pie
  pages/           Inicio, Propiedades, Ficha, Vende tu casa, Nosotros, Contacto, Aviso
  admin/           panel: propiedades, fotos, leads
```
