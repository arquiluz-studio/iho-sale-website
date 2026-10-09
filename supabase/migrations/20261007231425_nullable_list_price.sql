alter table public.products
  alter column msrp drop not null,
  alter column sale_price drop not null,
  alter column discount_percent drop not null;
