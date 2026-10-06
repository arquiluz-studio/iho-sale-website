alter type public.quote_status add value if not exists 'confirmada';
alter type public.quote_status add value if not exists 'despachada';

create or replace function public.dispatch_quote(p_quote_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item record;
  v_status public.quote_status;
  v_updated integer;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  select status into v_status
  from public.quotes
  where id = p_quote_id
  for update;

  if v_status is null then
    raise exception 'Cotización no encontrada';
  end if;
  if v_status = 'despachada' then
    raise exception 'Esta cotización ya fue despachada';
  end if;

  if not exists (select 1 from public.quote_items where quote_id = p_quote_id) then
    raise exception 'Agrega al menos una pieza';
  end if;

  for item in
    select id, product_id, quantity
    from public.quote_items
    where quote_id = p_quote_id
    order by id
    for update
  loop
    if item.product_id is null then
      raise exception 'No se puede despachar una pieza que ya no existe';
    end if;

    update public.products
    set stock = stock - item.quantity
    where id = item.product_id and stock >= item.quantity;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'No hay stock suficiente';
    end if;
  end loop;

  update public.quotes
  set status = 'despachada'
  where id = p_quote_id;
end;
$$;

revoke all on function public.dispatch_quote(uuid) from public;
grant execute on function public.dispatch_quote(uuid) to authenticated;
