
-- Roles enum
create type public.app_role as enum ('super_admin','admin','manager','employee');
create type public.attendance_type as enum ('work','sick','vacation','constraint');
create type public.profile_status as enum ('active','inactive','frozen');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid references public.companies(id) on delete cascade,
  manager_id uuid,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  company_id uuid references public.companies(id),
  team_id uuid references public.teams(id),
  job_title text,
  avatar_url text,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.teams add constraint teams_manager_fk foreign key (manager_id) references public.profiles(id) on delete set null;

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  type public.attendance_type not null default 'work',
  note text,
  created_at timestamptz not null default now()
);

create index attendance_user_date_idx on public.attendance(user_id, date);

create table public.points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index points_user_idx on public.points(user_id);

-- Security definer functions
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = _user_id and role = _role)
$$;

create or replace function public.get_user_company(_user_id uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select company_id from public.profiles where id = _user_id
$$;

create or replace function public.get_user_role(_user_id uuid)
returns public.app_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = _user_id
$$;

-- Auto-create profile on signup
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

-- Enable RLS
alter table public.companies enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.points enable row level security;

-- Companies policies
create policy "Authenticated can view companies" on public.companies for select to authenticated using (true);
create policy "Super admin can manage companies" on public.companies for all to authenticated
  using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- Profiles
create policy "Users can view profiles in their company" on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.has_role(auth.uid(),'super_admin')
    or company_id = public.get_user_company(auth.uid())
  );
create policy "Users can update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins can manage profiles in company" on public.profiles for all to authenticated
  using (
    public.has_role(auth.uid(),'super_admin')
    or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid()))
  )
  with check (
    public.has_role(auth.uid(),'super_admin')
    or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid()))
  );

-- Teams
create policy "Users can view teams in company" on public.teams for select to authenticated
  using (
    public.has_role(auth.uid(),'super_admin')
    or company_id = public.get_user_company(auth.uid())
  );
create policy "Admins can manage teams" on public.teams for all to authenticated
  using (
    public.has_role(auth.uid(),'super_admin')
    or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid()))
  )
  with check (
    public.has_role(auth.uid(),'super_admin')
    or (public.has_role(auth.uid(),'admin') and company_id = public.get_user_company(auth.uid()))
  );

-- Attendance
create policy "Users view own attendance" on public.attendance for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
  );
create policy "Users insert own attendance" on public.attendance for insert to authenticated
  with check (user_id = auth.uid());
create policy "Users update own attendance today" on public.attendance for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins manage attendance" on public.attendance for all to authenticated
  using (
    public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
  )
  with check (
    public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = attendance.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
  );

-- Points
create policy "Users view own points and company points" on public.points for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = points.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
  );
create policy "Users can insert own auto points" on public.points for insert to authenticated
  with check (user_id = auth.uid());
create policy "Admins/managers can insert points" on public.points for insert to authenticated
  with check (
    public.has_role(auth.uid(),'super_admin')
    or exists (select 1 from public.profiles p where p.id = points.user_id and p.company_id = public.get_user_company(auth.uid())
               and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
  );

-- Seed both companies
insert into public.companies (name) values ('חופית וגוני בע"מ'), ('פיוצ''רס פייננס בע"מ');
