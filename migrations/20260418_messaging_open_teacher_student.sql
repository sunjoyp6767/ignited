-- Open messaging: any teacher may chat with any student (no course/enrollment). One row per (teacher_id, student_id).

-- Realtime must be dropped before the table
do $$
begin
  alter publication supabase_realtime drop table public.messages;
exception
  when undefined_object then null;
  when undefined_table then null;
end $$;

do $$
begin
  if to_regclass('public.messages') is not null then
    execute 'drop trigger if exists messages_bump_conversation on public.messages';
  end if;
end $$;

drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;

create or replace function public.is_student()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'student'
  );
$$;

revoke all on function public.is_student() from public;
grant execute on function public.is_student() to authenticated;

-- Students can read teacher profiles (for inbox / new chat), mirroring teachers reading students
drop policy if exists "users_select_student_teachers" on public.users;
create policy "users_select_student_teachers"
  on public.users for select
  to authenticated
  using (public.is_student() and role = 'teacher');

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, student_id),
  constraint conversations_distinct_participants check (teacher_id <> student_id)
);

create index if not exists conversations_teacher_id_idx on public.conversations (teacher_id);
create index if not exists conversations_student_id_idx on public.conversations (student_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete restrict,
  body text not null default '',
  image_path text,
  created_at timestamptz not null default now(),
  constraint messages_body_or_image check (
    length(trim(body)) > 0 or image_path is not null
  )
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
  on public.conversations for select
  to authenticated
  using (teacher_id = auth.uid() or student_id = auth.uid());

drop policy if exists "conversations_insert_participants" on public.conversations;
create policy "conversations_insert_participants"
  on public.conversations for insert
  to authenticated
  with check (
    (
      teacher_id = auth.uid()
      and public.is_teacher()
      and exists (select 1 from public.users u where u.id = student_id and u.role = 'student')
    )
    or (
      student_id = auth.uid()
      and public.is_student()
      and exists (select 1 from public.users u where u.id = teacher_id and u.role = 'teacher')
    )
  );

alter table public.conversations enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (c.teacher_id = auth.uid() or c.student_id = auth.uid())
    )
  );

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (c.teacher_id = auth.uid() or c.student_id = auth.uid())
    )
  );

alter table public.messages enable row level security;

create or replace function public.bump_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

revoke all on function public.bump_conversation_on_message() from public;

drop trigger if exists messages_bump_conversation on public.messages;
create trigger messages_bump_conversation
  after insert on public.messages
  for each row execute function public.bump_conversation_on_message();

grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
