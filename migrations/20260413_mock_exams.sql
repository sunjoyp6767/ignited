-- Mock exam schema + policies for teacher builder and student attempts

create table if not exists public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  topic_node text not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 240),
  starts_at timestamptz,
  ends_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_exam_items (
  id uuid primary key default gen_random_uuid(),
  mock_exam_id uuid not null references public.mock_exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  order_no integer not null check (order_no > 0),
  marks integer not null default 1 check (marks > 0),
  unique (mock_exam_id, order_no),
  unique (mock_exam_id, question_id)
);

create table if not exists public.mock_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  mock_exam_id uuid not null references public.mock_exams(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  score_percent smallint not null check (score_percent between 0 and 100),
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now()
);

create table if not exists public.mock_exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.mock_exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  chosen_answer text,
  is_correct boolean not null default false,
  marks_awarded integer not null default 0 check (marks_awarded >= 0),
  unique (attempt_id, question_id)
);

create index if not exists mock_exams_course_published_idx on public.mock_exams(course_id, is_published);
create index if not exists mock_exam_attempts_student_idx on public.mock_exam_attempts(student_id, submitted_at desc);

alter table public.mock_exams enable row level security;
alter table public.mock_exam_items enable row level security;
alter table public.mock_exam_attempts enable row level security;
alter table public.mock_exam_answers enable row level security;

drop policy if exists "mock_exams_teacher_manage_own" on public.mock_exams;
create policy "mock_exams_teacher_manage_own"
  on public.mock_exams
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "mock_exams_student_select_enrolled" on public.mock_exams;
drop policy if exists "mock_exams_student_select_published" on public.mock_exams;
create policy "mock_exams_student_select_published"
  on public.mock_exams for select
  to authenticated
  using (is_published = true);

drop policy if exists "mock_exam_items_teacher_select_own" on public.mock_exam_items;
create policy "mock_exam_items_teacher_select_own"
  on public.mock_exam_items for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_exams me
      where me.id = mock_exam_id and me.teacher_id = auth.uid()
    )
  );

drop policy if exists "mock_exam_items_student_select_enrolled" on public.mock_exam_items;
drop policy if exists "mock_exam_items_student_select_published" on public.mock_exam_items;
create policy "mock_exam_items_student_select_published"
  on public.mock_exam_items for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_exams me
      where me.id = mock_exam_id and me.is_published = true
    )
  );

drop policy if exists "mock_exam_items_teacher_insert_own" on public.mock_exam_items;
create policy "mock_exam_items_teacher_insert_own"
  on public.mock_exam_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.mock_exams me
      where me.id = mock_exam_id and me.teacher_id = auth.uid()
    )
  );

drop policy if exists "mock_exam_attempts_student_own" on public.mock_exam_attempts;
create policy "mock_exam_attempts_student_own"
  on public.mock_exam_attempts
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "mock_exam_attempts_teacher_select_course" on public.mock_exam_attempts;
create policy "mock_exam_attempts_teacher_select_course"
  on public.mock_exam_attempts for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_exams me
      where me.id = mock_exam_id and me.teacher_id = auth.uid()
    )
  );

drop policy if exists "mock_exam_answers_student_select_own" on public.mock_exam_answers;
create policy "mock_exam_answers_student_select_own"
  on public.mock_exam_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_exam_attempts ma
      where ma.id = attempt_id and ma.student_id = auth.uid()
    )
  );

drop policy if exists "mock_exam_answers_student_insert_own" on public.mock_exam_answers;
create policy "mock_exam_answers_student_insert_own"
  on public.mock_exam_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.mock_exam_attempts ma
      where ma.id = attempt_id and ma.student_id = auth.uid()
    )
  );

drop policy if exists "mock_exam_answers_teacher_select_course" on public.mock_exam_answers;
create policy "mock_exam_answers_teacher_select_course"
  on public.mock_exam_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_exam_attempts ma
      join public.mock_exams me on me.id = ma.mock_exam_id
      where ma.id = attempt_id and me.teacher_id = auth.uid()
    )
  );

drop policy if exists "resources_update_teacher_course" on public.resources;
create policy "resources_update_teacher_course"
  on public.resources for update
  to authenticated
  using (
    teacher_id = auth.uid() and exists (
      select 1 from public.courses c
      where c.id = resources.course_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    teacher_id = auth.uid() and exists (
      select 1 from public.courses c
      where c.id = resources.course_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "resources_delete_teacher_course" on public.resources;
create policy "resources_delete_teacher_course"
  on public.resources for delete
  to authenticated
  using (
    teacher_id = auth.uid() and exists (
      select 1 from public.courses c
      where c.id = resources.course_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "questions_teacher_insert" on public.questions;
create policy "questions_teacher_insert"
  on public.questions for insert
  to authenticated
  with check (public.is_teacher());

