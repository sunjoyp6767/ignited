-- Fix "new row violates row-level security policy" on public.resources:
-- Old policies (e.g. resources_insert_teacher_course) required course_id / teacher_owns_course(course_id).
-- If course_id was dropped without replacing policies, INSERT has no valid WITH CHECK or it always fails.
-- This script drops every policy on public.resources and recreates the intended set.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'resources'
  loop
    execute format('drop policy if exists %I on public.resources', pol.policyname);
  end loop;
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.resources to authenticated, service_role;

alter table public.resources enable row level security;

-- Read: any signed-in user (prototype)
create policy "resources_select_authenticated"
  on public.resources for select
  to authenticated
  using (true);

-- Write: row owner only (no course_id)
create policy "resources_insert_teacher_own"
  on public.resources for insert
  to authenticated
  with check (
    auth.uid() is not null
    and teacher_id = auth.uid()
  );

create policy "resources_update_teacher_own"
  on public.resources for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "resources_delete_teacher_own"
  on public.resources for delete
  to authenticated
  using (teacher_id = auth.uid());
