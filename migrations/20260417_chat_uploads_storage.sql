-- Private bucket for message images; path layout: {conversation_id}/{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-uploads',
  'chat-uploads',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat_uploads_select_participants" on storage.objects;
create policy "chat_uploads_select_participants"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-uploads'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
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

drop policy if exists "chat_uploads_insert_participants" on storage.objects;
create policy "chat_uploads_insert_participants"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-uploads'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
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
