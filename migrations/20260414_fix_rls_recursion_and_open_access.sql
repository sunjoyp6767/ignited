-- Fix "infinite recursion detected in policy for relation enrollments":
-- Teacher enrollments policy queried public.courses under RLS; combined with
-- courses_select_student_enrolled (which queries enrollments) caused recursion.
-- Use SECURITY DEFINER to read course ownership without RLS re-entry.

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

drop policy if exists "enrollments_select_teacher_course" on public.enrollments;
create policy "enrollments_select_teacher_course"
  on public.enrollments for select
  to authenticated
  using (public.teacher_owns_course(course_id));

-- Prototype: teachers can read student profiles (name) for dashboards.
drop policy if exists "users_select_teacher_students" on public.users;
create policy "users_select_teacher_students"
  on public.users for select
  to authenticated
  using (public.is_teacher() and role = 'student');

-- Prototype: any signed-in user can list all resources (no enrollment required).
drop policy if exists "resources_select_student_enrolled" on public.resources;
drop policy if exists "resources_select_teacher_course" on public.resources;
create policy "resources_select_authenticated"
  on public.resources for select
  to authenticated
  using (true);

drop policy if exists "resources_insert_teacher_course" on public.resources;
create policy "resources_insert_teacher_course"
  on public.resources for insert
  to authenticated
  with check (
    teacher_id = auth.uid()
    and public.teacher_owns_course(course_id)
  );

drop policy if exists "resources_update_teacher_course" on public.resources;
create policy "resources_update_teacher_course"
  on public.resources for update
  to authenticated
  using (teacher_id = auth.uid() and public.teacher_owns_course(course_id))
  with check (teacher_id = auth.uid() and public.teacher_owns_course(course_id));

drop policy if exists "resources_delete_teacher_course" on public.resources;
create policy "resources_delete_teacher_course"
  on public.resources for delete
  to authenticated
  using (teacher_id = auth.uid() and public.teacher_owns_course(course_id));

-- Mock exams: published papers visible to all students (no enrollment).
-- Safe if mock_exams tables were not created yet (run migrations/20260413_mock_exams.sql first).
DO $$
BEGIN
  IF to_regclass('public.mock_exams') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "mock_exams_student_select_enrolled" on public.mock_exams';
    EXECUTE $p$
      create policy "mock_exams_student_select_published"
        on public.mock_exams for select
        to authenticated
        using (is_published = true)
    $p$;
  END IF;
  IF to_regclass('public.mock_exam_items') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "mock_exam_items_student_select_enrolled" on public.mock_exam_items';
    EXECUTE $p$
      create policy "mock_exam_items_student_select_published"
        on public.mock_exam_items for select
        to authenticated
        using (
          exists (
            select 1 from public.mock_exams me
            where me.id = mock_exam_id and me.is_published = true
          )
        )
    $p$;
  END IF;
END $$;
