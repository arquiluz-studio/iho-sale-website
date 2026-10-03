alter table public.products
  add column sku text;

alter table public.products
  add constraint products_sku_length check (sku is null or char_length(sku) <= 80);

grant select (sku) on public.products to anon;
