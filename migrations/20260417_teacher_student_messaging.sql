-- Teacher–student messaging: one conversation per (course, student). Enrollment-scoped RLS.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists conversations_course_id_idx on public.conversations (course_id);
create index if not exists conversations_student_id_idx on public.conversations (student_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);

create table if not exists public.messages (
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

-- Helper: enrollment check without RLS recursion issues
create or replace function public.student_enrolled_in_course(p_student_id uuid, p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id and e.course_id = p_course_id
  );
$$;

revoke all on function public.student_enrolled_in_course(uuid, uuid) from public;
grant execute on function public.student_enrolled_in_course(uuid, uuid) to authenticated;

-- Participant can read/write conversation rows
drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
  on public.conversations for select
  to authenticated
  using (
    (
      public.teacher_owns_course(course_id)
      and public.student_enrolled_in_course(student_id, course_id)
    )
    or (
      student_id = auth.uid()
      and public.student_enrolled_in_course(auth.uid(), course_id)
    )
  );

drop policy if exists "conversations_insert_participants" on public.conversations;
create policy "conversations_insert_participants"
  on public.conversations for insert
  to authenticated
  with check (
    (
      public.teacher_owns_course(course_id)
      and public.student_enrolled_in_course(student_id, course_id)
    )
    or (
      student_id = auth.uid()
      and public.student_enrolled_in_course(auth.uid(), course_id)
    )
  );

-- No user-facing UPDATE on conversations; updated_at is maintained by trigger only.

alter table public.conversations enable row level security;

-- Messages: sender must be conversation participant (teacher or enrolled student)
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (
        (
          public.teacher_owns_course(c.course_id)
          and public.student_enrolled_in_course(c.student_id, c.course_id)
        )
        or (
          c.student_id = auth.uid()
          and public.student_enrolled_in_course(auth.uid(), c.course_id)
        )
      )
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
      and (
        (c.student_id = auth.uid() and public.student_enrolled_in_course(auth.uid(), c.course_id))
        or (
          public.teacher_owns_course(c.course_id)
          and public.student_enrolled_in_course(c.student_id, c.course_id)
        )
      )
    )
  );

alter table public.messages enable row level security;

-- Keep conversations.updated_at in sync for inbox ordering
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

-- Realtime: new messages in active thread (optional UI subscription)
alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
