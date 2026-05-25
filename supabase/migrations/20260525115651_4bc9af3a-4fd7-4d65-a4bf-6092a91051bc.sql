
create table public.break_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,
  created_at timestamptz not null default now()
);

create index idx_break_sessions_user_date on public.break_sessions(user_id, date);
create index idx_break_sessions_active on public.break_sessions(user_id, date) where ended_at is null;

alter table public.break_sessions enable row level security;

create policy "Users manage own breaks"
on public.break_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Managers/admins view breaks in company"
on public.break_sessions
for select
to authenticated
using (
  has_role(auth.uid(), 'super_admin'::app_role)
  or exists (
    select 1 from public.profiles p
    where p.id = break_sessions.user_id
      and p.company_id = get_user_company(auth.uid())
      and (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'manager'::app_role))
  )
);
