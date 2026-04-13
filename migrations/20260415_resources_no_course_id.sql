-- resources: remove course_id; RLS allows insert/update/delete when teacher_id = auth.uid()

drop policy if exists "resources_select_student_enrolled" on public.resources;
drop policy if exists "resources_select_teacher_course" on public.resources;
drop policy if exists "resources_select_authenticated" on public.resources;
drop policy if exists "resources_insert_teacher_course" on public.resources;
drop policy if exists "resources_insert_teacher_own" on public.resources;
drop policy if exists "resources_update_teacher_course" on public.resources;
drop policy if exists "resources_update_teacher_own" on public.resources;
drop policy if exists "resources_delete_teacher_course" on public.resources;
drop policy if exists "resources_delete_teacher_own" on public.resources;

drop index if exists public.resources_course_id_idx;

alter table public.resources drop column if exists course_id;

create index if not exists resources_teacher_id_idx on public.resources (teacher_id);

create policy "resources_select_authenticated"
  on public.resources for select
  to authenticated
  using (true);

create policy "resources_insert_teacher_own"
  on public.resources for insert
  to authenticated
  with check (teacher_id = auth.uid());

create policy "resources_update_teacher_own"
  on public.resources for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "resources_delete_teacher_own"
  on public.resources for delete
  to authenticated
  using (teacher_id = auth.uid());
