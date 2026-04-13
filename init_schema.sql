-- IgnitED core schema (Postgres / Supabase)
-- HOW TO APPLY: Supabase Dashboard → SQL Editor → New query → paste this file → Run.
-- Logical tables: users, courses, enrollments, payments, questions

create extension if not exists "pgcrypto";

-- Application profiles (link id to auth.users when using Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student', 'teacher', 'accountant')),
  name text not null
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users (id) on delete restrict,
  course_name text not null,
  syllabus_code text not null
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status text not null default 'active'
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_method text not null check (payment_method in ('cash', 'online')),
  paid_on date not null default (timezone('utc', now()))::date
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  syllabus_code text not null,
  topic_node text not null,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  difficulty_level smallint not null check (difficulty_level between 1 and 3)
);

create index if not exists courses_teacher_id_idx on public.courses (teacher_id);
create index if not exists enrollments_student_id_idx on public.enrollments (student_id);
create index if not exists enrollments_course_id_idx on public.enrollments (course_id);
create index if not exists payments_student_id_idx on public.payments (student_id);
create index if not exists questions_syllabus_topic_idx on public.questions (syllabus_code, topic_node);

-- Seed: one teacher + one course + three MCQs (idempotent-ish: only inserts if no rows)
insert into public.users (id, role, name)
select '11111111-1111-4111-8111-111111111101', 'teacher', 'Dr. A. Patel'
where not exists (select 1 from public.users where id = '11111111-1111-4111-8111-111111111101');

insert into public.courses (id, teacher_id, course_name, syllabus_code)
select
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111101',
  'Cambridge IGCSE Mathematics',
  '0580'
where not exists (select 1 from public.courses where id = '22222222-2222-4222-8222-222222222201');

insert into public.questions (
  id,
  syllabus_code,
  topic_node,
  question_text,
  options,
  correct_answer,
  explanation,
  difficulty_level
)
select * from (values
  (
    '33333333-3333-4333-8333-333333333301'::uuid,
    '0580',
    '1.1 Number operations',
    'What is the value of (2^3) × (2^2)?',
    '["10", "16", "32", "64"]'::jsonb,
    '32',
    'When multiplying powers with the same base, add the exponents: 2^(3+2) = 2^5 = 32.',
    1
  ),
  (
    '33333333-3333-4333-8333-333333333302'::uuid,
    '0580',
    '2.3 Linear equations',
    'Solve for x: 3x − 7 = 14.',
    '["x = 5", "x = 7", "x = 9", "x = 21"]'::jsonb,
    'x = 7',
    'Add 7 to both sides: 3x = 21, then divide by 3: x = 7.',
    2
  ),
  (
    '33333333-3333-4333-8333-333333333303'::uuid,
    '0580',
    '4.2 Sequences',
    'In the arithmetic sequence 5, 9, 13, 17, …, what is the 10th term?',
    '["37", "41", "45", "49"]'::jsonb,
    '41',
    'First term a = 5, common difference d = 4. nth term: a + (n−1)d → 5 + 9×4 = 41.',
    3
  )
) as v(id, syllabus_code, topic_node, question_text, options, correct_answer, explanation, difficulty_level)
where not exists (select 1 from public.questions where id = v.id);

-- Sample topic: Kinematics_1.1 (Cambridge-style node id) — 5 MCQs for student quiz UI
insert into public.questions (
  id,
  syllabus_code,
  topic_node,
  question_text,
  options,
  correct_answer,
  explanation,
  difficulty_level
)
select * from (values
  (
    '44444444-4444-4444-8444-444444444401'::uuid,
    '9702',
    'Kinematics_1.1',
    'Which quantity is a vector?',
    '["Speed", "Distance", "Displacement", "Time"]'::jsonb,
    'Displacement',
    'Displacement has magnitude and direction; speed, distance, and time in this list are scalars.',
    1
  ),
  (
    '44444444-4444-4444-8444-444444444402'::uuid,
    '9702',
    'Kinematics_1.1',
    'A car accelerates uniformly from rest to 20 m s⁻¹ in 5.0 s. What is its acceleration?',
    '["2.0 m s⁻²", "4.0 m s⁻²", "5.0 m s⁻²", "100 m s⁻²"]'::jsonb,
    '4.0 m s⁻²',
    'Use a = (v − u) / t with u = 0: a = 20 / 5.0 = 4.0 m s⁻².',
    1
  ),
  (
    '44444444-4444-4444-8444-444444444403'::uuid,
    '9702',
    'Kinematics_1.1',
    'Which SUVAT equation links displacement s, initial velocity u, time t, and acceleration a when final velocity is not needed?',
    '["s = ut + ½at²", "v = u + at", "v² = u² + 2as", "s = ½(u + v)t"]'::jsonb,
    's = ut + ½at²',
    's = ut + ½at² uses u, t, and a without requiring final velocity v.',
    2
  ),
  (
    '44444444-4444-4444-8444-444444444404'::uuid,
    '9702',
    'Kinematics_1.1',
    'A ball is thrown vertically upward. At the highest point, which statement is true?',
    '["Acceleration is zero", "Velocity is zero and acceleration is g downward", "Velocity and acceleration are both zero", "Velocity is g upward"]'::jsonb,
    'Velocity is zero and acceleration is g downward',
    'At the top, instantaneous velocity is zero; acceleration remains approximately g downward (ignoring air resistance).',
    2
  ),
  (
    '44444444-4444-4444-8444-444444444405'::uuid,
    '9702',
    'Kinematics_1.1',
    'A projectile is launched horizontally from a cliff. Which quantity stays constant horizontally (ideal model, no air resistance)?',
    '["Vertical velocity", "Horizontal velocity", "Vertical acceleration", "Total speed"]'::jsonb,
    'Horizontal velocity',
    'With no horizontal force, horizontal velocity is constant; vertical motion has acceleration g.',
    3
  )
) as k(id, syllabus_code, topic_node, question_text, options, correct_answer, explanation, difficulty_level)
where not exists (select 1 from public.questions where id = k.id);

-- RLS: authenticated users may read questions (MCQ content is shared; no student-specific rows).
alter table public.questions enable row level security;

drop policy if exists "questions_select_authenticated" on public.questions;
create policy "questions_select_authenticated"
  on public.questions for select
  to authenticated
  using (true);

-- RLS: allow each authenticated user to manage only their own `public.users` row
-- (required for client + server inserts after Supabase Auth sign-up / sign-in.)
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Quiz attempts (minimal analytics for drop-out risk; extend later for real telemetry)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users (id) on delete cascade,
  completed_at timestamptz not null default now()
);

create index if not exists quiz_attempts_student_completed_idx
  on public.quiz_attempts (student_id, completed_at desc);

-- SECURITY DEFINER helper so RLS can recognise accountants without recursive policy issues
create or replace function public.is_accountant()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'accountant'
  );
$$;

revoke all on function public.is_accountant() from public;
grant execute on function public.is_accountant() to authenticated;

drop policy if exists "users_select_accountant_all" on public.users;
create policy "users_select_accountant_all"
  on public.users for select
  to authenticated
  using (public.is_accountant());

drop policy if exists "users_select_teacher_students" on public.users;
create policy "users_select_teacher_students"
  on public.users for select
  to authenticated
  using (public.is_teacher() and role = 'student');

-- Payments ledger RLS
alter table public.payments enable row level security;

drop policy if exists "payments_select_accountant" on public.payments;
create policy "payments_select_accountant"
  on public.payments for select
  to authenticated
  using (public.is_accountant());

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "payments_insert_accountant" on public.payments;
create policy "payments_insert_accountant"
  on public.payments for insert
  to authenticated
  with check (public.is_accountant());

-- Quiz attempts: accountants see all; students see own rows
alter table public.quiz_attempts enable row level security;

drop policy if exists "quiz_attempts_select_accountant" on public.quiz_attempts;
create policy "quiz_attempts_select_accountant"
  on public.quiz_attempts for select
  to authenticated
  using (public.is_accountant());

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  to authenticated
  using (student_id = auth.uid());

-- Teacher analytics + course resources
alter table public.quiz_attempts add column if not exists topic_node text;
alter table public.quiz_attempts add column if not exists score_percent smallint;

alter table public.courses add column if not exists syllabus_node_label text;
alter table public.courses add column if not exists resource_notes text;

create or replace function public.is_teacher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'teacher'
  );
$$;

revoke all on function public.is_teacher() from public;
grant execute on function public.is_teacher() to authenticated;

-- Used in RLS policies that must read course ownership without re-entering courses RLS (avoids recursion with enrollments).
create or replace function public.teacher_owns_course(p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and c.teacher_id = auth.uid()
  );
$$;

revoke all on function public.teacher_owns_course(uuid) from public;
grant execute on function public.teacher_owns_course(uuid) to authenticated;

alter table public.courses enable row level security;

drop policy if exists "courses_select_teacher_own" on public.courses;
create policy "courses_select_teacher_own"
  on public.courses for select
  to authenticated
  using (teacher_id = auth.uid());

drop policy if exists "courses_insert_teacher_own" on public.courses;
create policy "courses_insert_teacher_own"
  on public.courses for insert
  to authenticated
  with check (teacher_id = auth.uid());

drop policy if exists "courses_update_teacher_own" on public.courses;
create policy "courses_update_teacher_own"
  on public.courses for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

alter table public.enrollments enable row level security;

drop policy if exists "enrollments_select_student_own" on public.enrollments;
create policy "enrollments_select_student_own"
  on public.enrollments for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "enrollments_select_teacher_course" on public.enrollments;
create policy "enrollments_select_teacher_course"
  on public.enrollments for select
  to authenticated
  using (public.teacher_owns_course(course_id));

drop policy if exists "quiz_attempts_select_teacher_platform" on public.quiz_attempts;
create policy "quiz_attempts_select_teacher_platform"
  on public.quiz_attempts for select
  to authenticated
  using (public.is_teacher());

drop policy if exists "quiz_attempts_insert_own_student" on public.quiz_attempts;
create policy "quiz_attempts_insert_own_student"
  on public.quiz_attempts for insert
  to authenticated
  with check (student_id = auth.uid());

-- Demo scored attempts for teacher analytics (first student alphabetically, if any)
insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555501'::uuid, u.id, 'Kinematics_1.1', 38::smallint, now() - interval '1 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555501'::uuid)
order by u.name
limit 1;

insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555502'::uuid, u.id, 'Kinematics_1.1', 44::smallint, now() - interval '2 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555502'::uuid)
order by u.name
limit 1;

insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555503'::uuid, u.id, 'Kinematics_1.1', 42::smallint, now() - interval '3 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555503'::uuid)
order by u.name
limit 1;

insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555504'::uuid, u.id, '2.3 Linear equations', 35::smallint, now() - interval '4 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555504'::uuid)
order by u.name
limit 1;

insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555505'::uuid, u.id, '2.3 Linear equations', 48::smallint, now() - interval '5 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555505'::uuid)
order by u.name
limit 1;

insert into public.quiz_attempts (id, student_id, topic_node, score_percent, completed_at)
select '55555555-5555-5555-8555-555555555506'::uuid, u.id, '4.2 Sequences', 72::smallint, now() - interval '6 day'
from public.users u
where u.role = 'student'
  and not exists (select 1 from public.quiz_attempts x where x.id = '55555555-5555-5555-8555-555555555506'::uuid)
order by u.name
limit 1;

-- Students can read courses they are enrolled in (resources + joins)
drop policy if exists "courses_select_student_enrolled" on public.courses;
create policy "courses_select_student_enrolled"
  on public.courses for select
  to authenticated
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = id
        and e.student_id = auth.uid()
    )
  );

-- Teacher-uploaded materials (topic + Drive link; not tied to a course row)
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users (id) on delete restrict,
  file_name text not null,
  subject text not null,
  file_url text not null,
  resource_type text not null check (resource_type in ('pdf', 'video')),
  uploaded_at timestamptz not null default now()
);

create index if not exists resources_teacher_id_idx on public.resources (teacher_id);

alter table public.resources enable row level security;

-- Prototype: all authenticated users can read resources (enrollment optional).
drop policy if exists "resources_select_student_enrolled" on public.resources;
drop policy if exists "resources_select_teacher_course" on public.resources;
drop policy if exists "resources_select_authenticated" on public.resources;
create policy "resources_select_authenticated"
  on public.resources for select
  to authenticated
  using (true);

drop policy if exists "resources_insert_teacher_course" on public.resources;
drop policy if exists "resources_insert_teacher_own" on public.resources;
create policy "resources_insert_teacher_own"
  on public.resources for insert
  to authenticated
  with check (teacher_id = auth.uid());

drop policy if exists "resources_update_teacher_course" on public.resources;
drop policy if exists "resources_update_teacher_own" on public.resources;
create policy "resources_update_teacher_own"
  on public.resources for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "resources_delete_teacher_course" on public.resources;
drop policy if exists "resources_delete_teacher_own" on public.resources;
create policy "resources_delete_teacher_own"
  on public.resources for delete
  to authenticated
  using (teacher_id = auth.uid());
