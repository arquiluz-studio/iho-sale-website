alter table public.products
  add column dimensions text;

alter table public.products
  add constraint products_dimensions_length check (dimensions is null or char_length(dimensions) <= 120);

grant select (dimensions) on public.products to anon;
