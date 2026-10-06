create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  constraint categories_parent_not_self check (parent_id is distinct from id)
);

create index categories_parent_idx on public.categories (parent_id);

alter table public.categories enable row level security;

revoke all on table public.categories from public, anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (true);

create policy categories_admin_write
on public.categories
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

insert into public.categories (slug, name, sort_order) values
  ('mobiliario', 'Mobiliario', 10),
  ('iluminacion', 'Iluminación', 20),
  ('accesorios', 'Accesorios', 30),
  ('textiles', 'Textiles', 40),
  ('art-de-la-table', 'Art de la table', 50);

insert into public.categories (parent_id, slug, name, sort_order)
select parent.id, child.slug, child.name, child.sort_order
from (
  values
    ('mobiliario', 'sofas', 'Sofás', 10),
    ('mobiliario', 'butacas', 'Butacas', 20),
    ('mobiliario', 'sillas', 'Sillas', 30),
    ('mobiliario', 'taburetes', 'Taburetes', 40),
    ('mobiliario', 'mesas', 'Mesas', 50),
    ('mobiliario', 'mesas-auxiliares', 'Mesas auxiliares', 60),
    ('mobiliario', 'bancas', 'Bancas', 70),
    ('mobiliario', 'pufs', 'Pufs', 80),
    ('mobiliario', 'estanterias', 'Estanterías', 90),
    ('mobiliario', 'exterior', 'Exterior', 100),
    ('iluminacion', 'lamparas-de-mesa', 'Lámparas de mesa', 10),
    ('iluminacion', 'otras-lamparas', 'Otras lámparas', 20),
    ('accesorios', 'jarrones', 'Jarrones', 10),
    ('accesorios', 'objetos-decorativos', 'Objetos decorativos', 20),
    ('accesorios', 'relojes', 'Relojes', 30),
    ('accesorios', 'libros', 'Libros', 40),
    ('accesorios', 'posters', 'Pósters', 50),
    ('accesorios', 'portavelas', 'Portavelas', 60),
    ('accesorios', 'contenedores', 'Contenedores', 70),
    ('accesorios', 'organizacion', 'Organización', 80),
    ('accesorios', 'repisas', 'Repisas', 90),
    ('textiles', 'alfombras', 'Alfombras', 10),
    ('textiles', 'cojines', 'Cojines', 20),
    ('art-de-la-table', 'vajilla', 'Vajilla', 10),
    ('art-de-la-table', 'bandejas', 'Bandejas', 20)
) as child(parent_slug, slug, name, sort_order)
join public.categories parent on parent.slug = child.parent_slug;

alter table public.products
  add column category_id uuid references public.categories (id);

create index products_category_id_idx on public.products (category_id);

create or replace function public.products_sync_category()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_slug text;
begin
  if new.category_id is null then
    return new;
  end if;

  select parent.slug into parent_slug
  from public.categories child
  join public.categories parent on parent.id = child.parent_id
  where child.id = new.category_id;

  if parent_slug is null then
    raise exception 'Elige una subcategoría';
  elsif parent_slug = 'mobiliario' then
    new.category := 'mobiliario';
  else
    new.category := 'accesorio';
  end if;

  return new;
end;
$$;

revoke all on function public.products_sync_category() from public;
grant execute on function public.products_sync_category() to authenticated;

create trigger products_sync_category
before insert or update of category_id on public.products
for each row
execute function public.products_sync_category();

update public.products
set category_id = (
  select id from public.categories where slug = case
    when model ilike '%cork family%' then 'taburetes'
    when model ilike '%cork bowl%' then 'vajilla'
    when model ilike '%wooden side table%' or model ilike '%mesa eclipse%' then 'mesas-auxiliares'
    when model ilike '%amivera, 1 plaza%' or model ilike '%baobab%' then 'sofas'
    when model ilike '%ralik, banca%' then 'bancas'
    when model ilike '%otomana%' or model ilike '%puf%' then 'pufs'
    when model ilike '%columpio%' then 'exterior'
    when model ilike '%lámpara oh%' then 'otras-lamparas'
    when model ilike '%night owl%' or model ilike '%kaiser%' then 'lamparas-de-mesa'
    when model ilike '%sofá%' or model ilike '%sofa%' then 'sofas'
    when model ilike '%butaca%' or model ilike '%sillón%' or model ilike '%sillon%'
      or model ilike '%petit repos%' or model ilike '%citizen%' or model ilike '%acx soft%'
      or model = 'Cité' then 'butacas'
    when model ilike '%silla%' or model ilike '%grand prix%' then 'sillas'
    when model ilike '%taburete%' or model ilike '%banqueta%' or model ilike '%tabouret%' then 'taburetes'
    when model ilike '%estantería%' or model ilike '%estanteria%' then 'estanterias'
    when model ilike '%mesa%' then 'mesas'
    when model ilike '%alfombra%' then 'alfombras'
    when model ilike '%office nap%' or model ilike '%elephant pad%' then 'cojines'
    when model ilike '%vase%' or model ilike '%ikebana%' or model ilike '%ikeru%'
      or model ilike '%nuage%' or model ilike '%showtime%' or model ilike '%explorer vase%' then 'jarrones'
    when model ilike '%clock%' or model ilike '%chronopak%' then 'relojes'
    when model ilike '%poster%' then 'posters'
    when model ilike '%drip candle%' then 'portavelas'
    when model ilike '%ceramic container%' or model ilike '%locker box%'
      or model ilike '%tool.box%' or model = 'Basket' then 'contenedores'
    when model ilike '%uten.silo%' or model ilike '%o-tidy%' or model ilike '%rotary tray%' then 'organizacion'
    when model ilike '%corniches%' then 'repisas'
    when model ilike '%bowl%' or model ilike '%cup%' or model ilike '%plate%' or model ilike '%mug%'
      or model ilike '%zig zag%' or model ilike '%espresso%' or model ilike '%bottle%' then 'vajilla'
    when model ilike '%tray%' then 'bandejas'
    when model ilike '%catalogue%' or model ilike '%art of resilience%'
      or model ilike '%garden futures%' or model ilike '%hello, robot%' or model ilike '%home stories%'
      or model ilike '%objects of desire%' or model ilike '%eames & vitra%'
      or model ilike '%nike from follows%' then 'libros'
    when category = 'accesorio' then 'objetos-decorativos'
    else null
  end
);

do $$
declare
  missing text;
begin
  select string_agg(brand || ' / ' || model, ', ' order by brand, model)
  into missing
  from public.products
  where category_id is null;

  if missing is not null then
    raise exception 'Sin subcategoría: %', missing;
  end if;
end $$;

alter table public.products
  alter column category_id set not null;

grant select (category_id) on public.products to anon;
