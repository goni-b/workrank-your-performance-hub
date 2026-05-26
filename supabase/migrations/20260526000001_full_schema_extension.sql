-- ============================================================
-- Migration: Full Schema Extension for WorkRank
-- Adds: tasks, rewards, reward_claims, notifications,
--       performance_reviews, employee_documents
-- Extends: profiles, attendance with additional HR fields
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────

do $$ begin
  create type task_status as enum ('pending', 'in_progress', 'done', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

-- ── EXTEND profiles ──────────────────────────────────────────

alter table profiles
  add column if not exists phone text,
  add column if not exists start_date date,
  add column if not exists notes text,
  add column if not exists id_number text,
  add column if not exists bank_account text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists address text,
  add column if not exists birth_date date,
  add column if not exists contract_type text; -- full_time, part_time, freelance, intern

-- ── EXTEND attendance ────────────────────────────────────────

alter table attendance
  add column if not exists location_in text,
  add column if not exists location_out text,
  add column if not exists approved_by uuid references profiles(id),
  add column if not exists is_approved boolean default true;

-- ── TABLE: tasks ─────────────────────────────────────────────

create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  assigned_to   uuid references profiles(id) on delete set null,
  assigned_by   uuid references profiles(id) on delete set null,
  company_id    uuid references companies(id) on delete cascade,
  team_id       uuid references teams(id) on delete set null,
  status        task_status default 'pending',
  priority      task_priority default 'medium',
  due_date      date,
  completed_at  timestamptz,
  points_reward integer default 0,
  created_at    timestamptz default now()
);

create index if not exists tasks_assigned_to_idx on tasks(assigned_to);
create index if not exists tasks_company_idx on tasks(company_id);

alter table tasks enable row level security;

-- employees see tasks assigned to them
create policy "employees see own tasks"
  on tasks for select
  using (assigned_to = auth.uid());

-- managers/admins see all tasks in their company
create policy "managers see company tasks"
  on tasks for select
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- managers/admins can insert/update/delete tasks in their company
create policy "managers manage tasks"
  on tasks for all
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- ── TABLE: rewards ───────────────────────────────────────────

create table if not exists rewards (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  name        text not null,
  description text,
  image_url   text,
  points_cost integer not null check (points_cost > 0),
  stock       integer,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index if not exists rewards_company_idx on rewards(company_id);

alter table rewards enable row level security;

create policy "all employees see active rewards"
  on rewards for select
  using (get_user_company(auth.uid()) = company_id and is_active = true);

create policy "admins manage rewards"
  on rewards for all
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('admin','super_admin'));

-- ── TABLE: reward_claims ─────────────────────────────────────

create table if not exists reward_claims (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  reward_id    uuid references rewards(id) on delete cascade,
  points_spent integer not null,
  status       text default 'pending', -- pending, approved, rejected, delivered
  notes        text,
  approved_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz default now()
);

create index if not exists reward_claims_user_idx on reward_claims(user_id);

alter table reward_claims enable row level security;

create policy "employees see own claims"
  on reward_claims for select
  using (user_id = auth.uid());

create policy "employees insert own claims"
  on reward_claims for insert
  with check (user_id = auth.uid());

create policy "managers see company claims"
  on reward_claims for select
  using (
    get_user_role(auth.uid()) in ('manager','admin','super_admin')
    and exists (
      select 1 from profiles p
      where p.id = reward_claims.user_id
        and p.company_id = get_user_company(auth.uid())
    )
  );

create policy "admins update claims"
  on reward_claims for update
  using (
    get_user_role(auth.uid()) in ('admin','super_admin')
    and exists (
      select 1 from profiles p
      where p.id = reward_claims.user_id
        and p.company_id = get_user_company(auth.uid())
    )
  );

-- ── TABLE: notifications ─────────────────────────────────────

create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  title      text not null,
  body       text,
  type       text, -- attendance, points, task, reward, system
  is_read    boolean default false,
  related_id uuid,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on notifications(user_id, is_read);

alter table notifications enable row level security;

create policy "users see own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "users update own notifications"
  on notifications for update
  using (user_id = auth.uid());

create policy "system insert notifications"
  on notifications for insert
  with check (
    get_user_role(auth.uid()) in ('admin','manager','super_admin')
    or user_id = auth.uid()
  );

-- ── TABLE: performance_reviews ───────────────────────────────

create table if not exists performance_reviews (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid references profiles(id) on delete cascade,
  reviewer_id  uuid references profiles(id) on delete set null,
  company_id   uuid references companies(id) on delete cascade,
  period_start date,
  period_end   date,
  score        integer check (score between 1 and 100),
  strengths    text,
  improvements text,
  goals        text,
  notes        text,
  created_at   timestamptz default now()
);

create index if not exists perf_reviews_employee_idx on performance_reviews(employee_id);

alter table performance_reviews enable row level security;

create policy "employees see own reviews"
  on performance_reviews for select
  using (employee_id = auth.uid());

create policy "managers see company reviews"
  on performance_reviews for select
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

create policy "managers manage reviews"
  on performance_reviews for all
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- ── TABLE: employee_documents ────────────────────────────────

create table if not exists employee_documents (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid references profiles(id) on delete cascade,
  company_id      uuid references companies(id) on delete cascade,
  document_type   text not null, -- contract, id, tax, medical, other
  file_name       text not null,
  file_url        text not null,
  file_size_bytes bigint,
  uploaded_by     uuid references profiles(id) on delete set null,
  notes           text,
  created_at      timestamptz default now()
);

create index if not exists emp_docs_employee_idx on employee_documents(employee_id);
create index if not exists emp_docs_company_idx  on employee_documents(company_id);

alter table employee_documents enable row level security;

create policy "employees see own documents"
  on employee_documents for select
  using (employee_id = auth.uid());

create policy "managers see company documents"
  on employee_documents for select
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

create policy "managers manage documents"
  on employee_documents for all
  using (get_user_company(auth.uid()) = company_id
         and get_user_role(auth.uid()) in ('manager','admin','super_admin'));

-- ── STORAGE BUCKETS ──────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employee-documents',
  'employee-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'image/jpeg','image/png','image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) on conflict (id) do nothing;

-- Storage policies: avatars
create policy "avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: employee-documents
create policy "employees see own documents in storage"
  on storage.objects for select
  using (
    bucket_id = 'employee-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or get_user_role(auth.uid()) in ('manager','admin','super_admin')
    )
  );

create policy "managers upload employee documents"
  on storage.objects for insert
  with check (
    bucket_id = 'employee-documents'
    and get_user_role(auth.uid()) in ('manager','admin','super_admin')
  );

create policy "managers delete employee documents"
  on storage.objects for delete
  using (
    bucket_id = 'employee-documents'
    and get_user_role(auth.uid()) in ('manager','admin','super_admin')
  );

-- ── SEED DATA ────────────────────────────────────────────────

insert into companies (name) values
  ('חופית וגוני בע"מ'),
  ('פיוצ''רס פייננס בע"מ')
on conflict do nothing;
