create type public.quote_status as enum ('borrador', 'enviada');

create sequence public.quote_number_seq;

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique default nextval('public.quote_number_seq'),
  inquiry_id uuid unique references public.inquiries (id) on delete set null,
  name text not null,
  company text,
  email text not null,
  phone text not null default '',
  note text,
  shipping numeric(12, 2) not null default 0 check (shipping >= 0),
  status public.quote_status not null default 'borrador',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter sequence public.quote_number_seq owned by public.quotes.number;

create index quotes_created_at_idx on public.quotes (created_at desc);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  brand text not null,
  model text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  msrp numeric(12, 2) not null check (msrp >= 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0)
);

create index quote_items_quote_id_idx on public.quote_items (quote_id);
create unique index quote_items_quote_product_idx on public.quote_items (quote_id, product_id) where product_id is not null;

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function private.set_updated_at();

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

revoke all on table public.quotes from public, anon, authenticated;
revoke all on table public.quote_items from public, anon, authenticated;
revoke all on sequence public.quote_number_seq from public, anon, authenticated;

grant select, insert, update, delete on public.quotes to authenticated;
grant select, insert, update, delete on public.quote_items to authenticated;
grant usage, select on sequence public.quote_number_seq to authenticated;

create policy quotes_admin_all
on public.quotes
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy quote_items_admin_all
on public.quote_items
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());
