-- Inmobiliaria Valle · esquema de Supabase
-- Correr una sola vez en Supabase > SQL Editor. Después correr seed.sql.

create extension if not exists pgcrypto;

-- Tipos -------------------------------------------------------------------
do $$ begin
  create type tipo_inmueble as enum ('casa', 'departamento', 'terreno', 'local', 'salon_eventos');
exception when duplicate_object then null; end $$;
do $$ begin
  create type estatus_propiedad as enum ('disponible', 'apartada', 'vendida');
exception when duplicate_object then null; end $$;
do $$ begin
  create type tipo_lead as enum ('visita', 'vender', 'contacto');
exception when duplicate_object then null; end $$;

-- Administradores -----------------------------------------------------------
-- Crea el usuario en Authentication > Users y luego:
--   insert into admins (user_id) select id from auth.users where email = 'info@inmobiliariavalle.com';
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table admins enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create policy "admins se ven a sí mismos" on admins for select to authenticated using (user_id = auth.uid());

-- Propiedades -------------------------------------------------------------
create table if not exists propiedades (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nombre text not null,
  tipo tipo_inmueble not null default 'casa',
  colonia text not null,
  municipio text not null default 'Guadalajara',
  direccion text,                              -- privada
  mostrar_direccion boolean not null default false,
  lat double precision,
  lng double precision,
  precio integer check (precio is null or precio >= 0),
  precio_a_consultar boolean not null default false,
  estatus estatus_propiedad not null default 'disponible',
  recamaras smallint,
  banos numeric(3,1),
  estacionamientos smallint,
  plantas smallint,
  m2_terreno numeric(10,2),
  m2_construccion numeric(10,2),
  caracteristicas text[] not null default '{}',
  creditos text[] not null default '{}' check (creditos <@ array['infonavit','fovissste','bancario','contado']),
  descripcion text not null default '',
  cerca_de text[] not null default '{}',
  fotos text[] not null default '{}',
  destacada boolean not null default false,
  fecha_publicacion date not null default current_date,
  fecha_vendida date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists propiedades_estatus_idx on propiedades (estatus);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists propiedades_touch on propiedades;
create trigger propiedades_touch before update on propiedades for each row execute function touch_updated_at();

alter table propiedades enable row level security;
-- La tabla completa (con dirección privada) solo la ve el panel.
create policy "admin lee propiedades" on propiedades for select to authenticated using (is_admin());
create policy "admin crea propiedades" on propiedades for insert to authenticated with check (is_admin());
create policy "admin edita propiedades" on propiedades for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin borra propiedades" on propiedades for delete to authenticated using (is_admin());

-- Vista pública: igual que la tabla, pero la dirección solo sale si mostrar_direccion = true.
-- Corre con los permisos de su dueño a propósito, para que el público no toque la tabla.
create or replace view propiedades_publicas as
select
  id, slug, nombre, tipo, colonia, municipio,
  case when mostrar_direccion then direccion end as direccion,
  mostrar_direccion, lat, lng,
  case when precio_a_consultar then null else precio end as precio,
  precio_a_consultar, estatus, recamaras, banos, estacionamientos, plantas,
  m2_terreno, m2_construccion, caracteristicas, creditos, descripcion, cerca_de,
  fotos, destacada, fecha_publicacion, fecha_vendida
from propiedades;

revoke all on propiedades_publicas from anon, authenticated;
grant select on propiedades_publicas to anon, authenticated;

-- Leads -------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_lead not null,
  nombre text not null check (char_length(nombre) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^\+52[0-9]{10}$'),
  propiedad_id uuid references propiedades (id) on delete set null,
  datos jsonb not null default '{}',
  pagina_origen text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'cerrado')),
  created_at timestamptz not null default now()
);
create index if not exists leads_created_idx on leads (created_at desc);

alter table leads enable row level security;
-- Cualquiera puede mandar un formulario; nadie de fuera puede leerlos.
create policy "público crea leads" on leads for insert to anon, authenticated
  with check (estado = 'nuevo' and octet_length(datos::text) < 8000);
create policy "admin lee leads" on leads for select to authenticated using (is_admin());
create policy "admin edita leads" on leads for update to authenticated using (is_admin());

-- Storage -----------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('propiedades', 'propiedades', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-vendedores', 'fotos-vendedores', false, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Fotos de propiedades: públicas para ver, solo el admin sube o borra.
create policy "admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'propiedades' and is_admin());
create policy "admin cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'propiedades' and is_admin());
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'propiedades' and is_admin());

-- Fotos que manda quien quiere vender: cualquiera sube, solo el admin las ve.
create policy "público sube fotos de venta" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'fotos-vendedores');
create policy "admin ve fotos de venta" on storage.objects for select to authenticated
  using (bucket_id = 'fotos-vendedores' and is_admin());
