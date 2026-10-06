create table public.outlet_settings (
  id integer primary key default 1 check (id = 1),
  inquiry_email text not null,
  constraint outlet_settings_email_check check (inquiry_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

insert into public.outlet_settings (id, inquiry_email)
values (1, 'cbembo@iho.com.pa');

alter table public.outlet_settings enable row level security;

revoke all on table public.outlet_settings from public, anon, authenticated;
grant select on public.outlet_settings to anon, authenticated;
grant update (inquiry_email) on public.outlet_settings to authenticated;

create policy outlet_settings_read
on public.outlet_settings
for select
to anon, authenticated
using (true);

create policy outlet_settings_admin_update
on public.outlet_settings
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());
