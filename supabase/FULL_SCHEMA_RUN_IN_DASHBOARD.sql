-- ============================================================
-- WorkRank – Complete Schema for New Supabase Project
-- הרץ את כל הקובץ הזה ב: Supabase Dashboard > SQL Editor
-- Project: qnqhhdezaklekufyfmba
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────

create type public.app_role as enum ('super_admin','admin','manager','employee');
create type public.attendance_type as enum ('work','sick','vacation','constraint');
create type public.profile_status as enum ('active','inactive','frozen');
create type public.task_status as enum ('pending','in_progress','done','cancelled');
create type public.task_priority as enum ('low','medium','high','urgent');

-- ── CORE TABLES ──────────────────────────────────────────────

create table public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo_url   text,
  created_at timestamptz not null default now()
);

create table public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company_id uuid references public.companies(id) on delete cascade,
  manager_id uuid,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  full_name               text not null,
  role                    public.app_role not null default 'employee',
  company_id              uuid references public.companies(id),
  team_id                 uuid references public.teams(id),
  job_title               text,
  avatar_url              text,
  status                  public.profile_status not null default 'active',
  phone                   text,
  start_date              date,
  notes                   text,
  id_number               text,
  bank_account            text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  address                 text,
  birth_date              date,
  contract_type           text,
  created_at              timestamptz not null default now()
);

alter table public.teams add constraint teams_manager_fk
  foreign key (manager_id) references public.profiles(id) on delete set null;

create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  date        date not null,
  check_in    timestamptz,
  check_out   timestamptz,
  type        public.attendance_type not null default 'work',
  note        text,
  location_in  text,
  location_out text,
  approved_by  uuid references public.profiles(id),
  is_approved  boolean default true,
  created_at  timestamptz not null default now()
);
create index attendance_user_date_idx on public.attendance(user_id, date);

create table public.break_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  date             date not null,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_minutes integer,
  created_at       timestamptz not null default now()
);
create index idx_break_sessions_user_date on public.break_sessions(user_id, date);
create index idx_break_sessions_active on public.break_sessions(user_id, date) where ended_at is null;

create table public.points (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      integer not null,
  reason      text,
  approved_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index points_user_idx on public.points(user_id);

-- ── TASKS (M5) ───────────────────────────────────────────────

create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  assigned_to   uuid references public.profiles(id) on delete set null,
  assigned_by   uuid references public.profiles(id) on delete set null,
  company_id    uuid references public.companies(id) on delete cascade,
  team_id       uuid references public.teams(id) on delete set null,
  status        public.task_status default 'pending',
  priority      public.task_priority default 'medium',
  due_date      date,
  completed_at  timestamptz,
  points_reward integer default 0,
  created_at    timestamptz default now()
);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index tasks_company_idx on public.tasks(company_id);

-- ── REWARDS (M6) ─────────────────────────────────────────────

create table public.rewards (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references public.companies(id) on delete cascade,
  name        text not null,
  description text,
  image_url   text,
  points_cost integer not null check (points_cost > 0),
  stock       integer,
  is_active   boolean default true,
  created_at  timestamptz default now()
);
create index rewards_company_idx on public.rewards(company_id);

create table public.reward_claims (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  reward_id    uuid references public.rewards(id) on delete cascade,
  points_spent integer not null,
  status       text default 'pending',
  notes        text,
  approved_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);
create index reward_claims_user_idx on public.reward_claims(user_id);

-- ── NOTIFICATIONS ────────────────────────────────────────────

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  type       text,
  is_read    boolean default false,
  related_id uuid,
  created_at timestamptz default now()
);
create index notifications_user_idx on public.notifications(user_id, is_read);

-- ── PERFORMANCE REVIEWS ──────────────────────────────────────

create table public.performance_reviews (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid references public.profiles(id) on delete cascade,
  reviewer_id  uuid references public.profiles(id) on delete set null,
  company_id   uuid references public.companies(id) on delete cascade,
  period_start date,
  period_end   date,
  score        integer check (score between 1 and 100),
  strengths    text,
  improvements text,
  goals        text,
  notes        text,
  created_at   timestamptz default now()
);
create index perf_reviews_employee_idx on public.performance_reviews(employee_id);

-- ── EMPLOYEE DOCUMENTS ───────────────────────────────────────

create table public.employee_documents (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid references public.profiles(id) on delete cascade,
  company_id      uuid references public.companies(id) on delete cascade,
  document_type   text not null,
  file_name       text not null,
  file_url        text not null,
  file_size_bytes bigint,
  uploaded_by     uuid references public.profiles(id) on delete set null,
  notes           text,
  created_at      timestamptz default now()
);
create index emp_docs_employee_idx on public.employee_documents(employee_id);
create index emp_docs_company_idx  on public.employee_documents(company_id);

-- ── SECURITY FUNCTIONS ───────────────────────────────────────

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = _user_id and role = _role)
$$;

create or replace function public.get_user_company(_user_id uuid)
returns uuid language sql stable security definer set search_path = public
as $$
  select company_id from public.profiles where id = _user_id
$$;

create or replace function public.get_user_role(_user_id uuid)
returns public.app_role language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = _user_id
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'employee')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.get_user_company(uuid) from anon, authenticated;
revoke execute on function public.get_user_role(uuid) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ── ENABLE RLS ───────────────────────────────────────────────

alter table public.companies          enable row level security;
alter table public.teams              enable row level security;
alter table public.profiles           enable row level security;
alter table public.attendance         enable row level security;
alter table public.break_sessions     enable row level security;
alter table public.points             enable row level security;
alter table public.tasks              enable row level security;
alter table public.rewards            enable row level security;
alter table public.reward_claims      enable row level security;
alter table public.notifications      enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.employee_documents enable row level security;

-- ── RLS POLICIES ─────────────────────────────────────────────

-- companies
create policy "Authenticated can view companies" on public.companies
  for select to authenticated using (true);
create policy "Super admin can manage companies" on public.companies
  for all to authenticated
  using (public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'super_admin'));

-- profiles
create policy "Users can view profiles in their company" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'super_admin') or company_id = public.get_user_company(auth.uid()));
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins can manage profiles in company" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(),'super_admin') or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid())))
  with check (public.has_role(auth.uid(),'super_admin') or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid())));

-- teams
create policy "Users can view teams in company" on public.teams
  for select to authenticated
  using (public.has_role(auth.uid(),'super_admin') or company_id = public.get_user_company(auth.uid()));
create policy "Admins can manage teams" on public.teams
  for all to authenticated
  using (public.has_role(auth.uid(),'super_admin') or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid())))
  with check (public.has_role(auth.uid(),'super_admin') or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid())));

-- attendance
create policy "Users view own attendance" on public.attendance for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))));
create policy "Users insert own attendance" on public.attendance for insert to authenticated
  with check (user_id = auth.uid());
create policy "Users update own attendance" on public.attendance for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins manage attendance" on public.attendance for all to authenticated
  using (public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))))
  with check (public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))));

-- break_sessions
create policy "Users manage own breaks" on public.break_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Managers view breaks in company" on public.break_sessions for select to authenticated
  using (public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = break_sessions.user_id
               and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))));

-- points
create policy "Users view own and company points" on public.points for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = points.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))));
create policy "Users insert own points" on public.points for insert to authenticated
  with check (user_id = auth.uid());
create policy "Admins insert points" on public.points for insert to authenticated
  with check (public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = points.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager'))));

-- tasks
create policy "employees see own tasks" on public.tasks for select
  using (assigned_to = auth.uid());
create policy "managers see company tasks" on public.tasks for select
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));
create policy "managers manage tasks" on public.tasks for all
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- rewards
create policy "employees see active rewards" on public.rewards for select
  using (public.get_user_company(auth.uid()) = company_id and is_active = true);
create policy "admins manage rewards" on public.rewards for all
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('admin','super_admin'));

-- reward_claims
create policy "employees see own claims" on public.reward_claims for select
  using (user_id = auth.uid());
create policy "employees insert own claims" on public.reward_claims for insert
  with check (user_id = auth.uid());
create policy "managers see company claims" on public.reward_claims for select
  using (public.get_user_role(auth.uid()) in ('manager','admin','super_admin')
    and exists (select 1 from public.profiles p where p.id = reward_claims.user_id
                and p.company_id = public.get_user_company(auth.uid())));
create policy "admins update claims" on public.reward_claims for update
  using (public.get_user_role(auth.uid()) in ('admin','super_admin')
    and exists (select 1 from public.profiles p where p.id = reward_claims.user_id
                and p.company_id = public.get_user_company(auth.uid())));

-- notifications
create policy "users see own notifications" on public.notifications for select
  using (user_id = auth.uid());
create policy "users mark notifications read" on public.notifications for update
  using (user_id = auth.uid());
create policy "system insert notifications" on public.notifications for insert
  with check (public.get_user_role(auth.uid()) in ('admin','manager','super_admin') or user_id = auth.uid());

-- performance_reviews
create policy "employees see own reviews" on public.performance_reviews for select
  using (employee_id = auth.uid());
create policy "managers see company reviews" on public.performance_reviews for select
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));
create policy "managers manage reviews" on public.performance_reviews for all
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- employee_documents
create policy "employees see own documents" on public.employee_documents for select
  using (employee_id = auth.uid());
create policy "managers see company documents" on public.employee_documents for select
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));
create policy "managers manage documents" on public.employee_documents for all
  using (public.get_user_company(auth.uid()) = company_id
         and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- ── STORAGE BUCKETS ──────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employee-documents', 'employee-documents', false, 52428800,
        array['application/pdf','image/jpeg','image/png','image/webp',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

-- avatars storage policies
create policy "Avatars are publicly readable" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
create policy "Authenticated users can update avatars" on storage.objects for update to authenticated
  using (bucket_id = 'avatars');
create policy "Authenticated users can delete avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars');

-- employee-documents storage policies
create policy "employees see own documents in storage" on storage.objects for select
  using (bucket_id = 'employee-documents'
    and (auth.uid()::text = (storage.foldername(name))[1]
         or public.get_user_role(auth.uid()) in ('manager','admin','super_admin')));
create policy "managers upload employee documents" on storage.objects for insert
  with check (bucket_id = 'employee-documents'
    and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));
create policy "managers delete employee documents" on storage.objects for delete
  using (bucket_id = 'employee-documents'
    and public.get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- ── SEED DATA ────────────────────────────────────────────────

insert into public.companies (name) values
  ('חופית וגוני בע"מ'),
  ('פיוצ''רס פייננס בע"מ')
on conflict do nothing;
