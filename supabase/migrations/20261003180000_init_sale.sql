create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.set_updated_at() from public;
grant execute on function private.is_admin() to anon, authenticated;

create type public.product_category as enum ('mobiliario', 'accesorio');
create type public.inquiry_status as enum ('nueva', 'en_contacto', 'surtida', 'cancelada');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  description text not null default '',
  category public.product_category not null,
  cost numeric(12, 2) not null check (cost >= 0),
  msrp numeric(12, 2) not null check (msrp >= 0),
  discount_percent numeric(5, 2) not null check (discount_percent >= 0 and discount_percent <= 100),
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_stock_idx on public.products (stock);
create index products_category_idx on public.products (category);
create index products_brand_idx on public.products (brand);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text not null,
  note text,
  status public.inquiry_status not null default 'nueva',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_idx on public.inquiries (status);
create index inquiries_created_at_idx on public.inquiries (created_at desc);

create table public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  brand text not null,
  model text not null,
  quantity_requested integer not null check (quantity_requested > 0),
  quantity_fulfilled integer not null default 0 check (quantity_fulfilled >= 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0)
);

create index inquiry_items_inquiry_id_idx on public.inquiry_items (inquiry_id);

create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function private.set_updated_at();

alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;

revoke all on table public.products from public, anon, authenticated;
revoke all on table public.inquiries from public, anon, authenticated;
revoke all on table public.inquiry_items from public, anon, authenticated;

grant select (
  id,
  brand,
  model,
  description,
  category,
  msrp,
  discount_percent,
  sale_price,
  stock,
  image_path,
  created_at,
  updated_at
) on public.products to anon;

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiry_items to authenticated;

create policy products_public_read
on public.products
for select
to anon
using (stock > 0);

create policy products_admin_all
on public.products
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy inquiries_admin_all
on public.inquiries
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy inquiry_items_admin_all
on public.inquiry_items
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create or replace function private.create_inquiry(
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_note text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_product_id uuid;
begin
  if p_name is null or length(btrim(p_name)) = 0 or length(btrim(p_name)) > 120 then
    raise exception 'El nombre es obligatorio';
  end if;
  if p_email is null or position('@' in p_email) = 0 or length(btrim(p_email)) > 200 then
    raise exception 'El correo no es válido';
  end if;
  if p_phone is null or length(btrim(p_phone)) < 8 or length(btrim(p_phone)) > 40 then
    raise exception 'El teléfono es obligatorio';
  end if;
  if p_company is not null and length(btrim(p_company)) > 160 then
    raise exception 'La empresa es demasiado larga';
  end if;
  if p_note is not null and length(p_note) > 2000 then
    raise exception 'La nota es demasiado larga';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Agrega al menos una pieza';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Demasiadas piezas en una sola solicitud';
  end if;

  insert into public.inquiries (name, company, email, phone, note)
  values (
    btrim(p_name),
    nullif(btrim(coalesce(p_company, '')), ''),
    btrim(p_email),
    btrim(p_phone),
    nullif(btrim(coalesce(p_note, '')), '')
  )
  returning id into v_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (item ->> 'quantity')::integer;
    v_product_id := (item ->> 'product_id')::uuid;

    if v_qty is null or v_qty < 1 then
      raise exception 'Cantidad inválida';
    end if;

    select * into v_product
    from public.products
    where id = v_product_id;

    if not found or v_product.stock < v_qty then
      raise exception 'Una pieza ya no tiene stock suficiente';
    end if;

    if exists (
      select 1
      from public.inquiry_items
      where inquiry_id = v_id and product_id = v_product.id
    ) then
      raise exception 'Hay una pieza repetida en la lista';
    end if;

    insert into public.inquiry_items (
      inquiry_id,
      product_id,
      brand,
      model,
      quantity_requested,
      sale_price
    ) values (
      v_id,
      v_product.id,
      v_product.brand,
      v_product.model,
      v_qty,
      v_product.sale_price
    );
  end loop;

  return v_id;
end;
$$;

revoke all on function private.create_inquiry(text, text, text, text, text, jsonb) from public;
grant execute on function private.create_inquiry(text, text, text, text, text, jsonb) to anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function public.submit_inquiry(
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_note text,
  p_items jsonb
) returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_inquiry(p_name, p_company, p_email, p_phone, p_note, p_items);
$$;

revoke all on function public.submit_inquiry(text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, jsonb) to anon, authenticated;

create or replace function public.fulfill_inquiry(p_inquiry_id uuid, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item jsonb;
  v_item_id uuid;
  v_product_id uuid;
  v_qty integer;
  v_updated integer;
  v_status public.inquiry_status;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  select status into v_status
  from public.inquiries
  where id = p_inquiry_id
  for update;

  if v_status is null then
    raise exception 'Solicitud no encontrada';
  end if;
  if v_status = 'surtida' then
    raise exception 'Esta solicitud ya fue surtida';
  end if;
  if v_status = 'cancelada' then
    raise exception 'Esta solicitud está cancelada';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Faltan las cantidades';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    v_item_id := (item ->> 'item_id')::uuid;
    v_qty := (item ->> 'quantity')::integer;

    if v_item_id is null or v_qty is null or v_qty < 0 then
      raise exception 'Cantidad inválida';
    end if;

    select product_id into v_product_id
    from public.inquiry_items
    where id = v_item_id and inquiry_id = p_inquiry_id
    for update;

    if not found then
      raise exception 'Pieza no encontrada en la solicitud';
    end if;

    if v_qty > 0 then
      if v_product_id is null then
        raise exception 'No se puede surtir una pieza que ya no existe';
      end if;

      update public.products
      set stock = stock - v_qty
      where id = v_product_id and stock >= v_qty;

      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        raise exception 'No hay stock suficiente';
      end if;
    end if;

    update public.inquiry_items
    set quantity_fulfilled = v_qty
    where id = v_item_id;
  end loop;

  update public.inquiries
  set status = 'surtida'
  where id = p_inquiry_id;
end;
$$;

revoke all on function public.fulfill_inquiry(uuid, jsonb) from public;
grant execute on function public.fulfill_inquiry(uuid, jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_public_read
on storage.objects
for select
to public
using (bucket_id = 'product-images');

create policy product_images_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and private.is_admin()
);

create policy product_images_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and private.is_admin())
with check (bucket_id = 'product-images' and private.is_admin());

create policy product_images_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and private.is_admin());
