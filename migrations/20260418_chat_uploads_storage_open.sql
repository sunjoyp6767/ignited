-- Storage: participants are conversation teacher_id / student_id (no enrollment)

drop policy if exists "chat_uploads_select_participants" on storage.objects;
create policy "chat_uploads_select_participants"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'chat-uploads'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
      and (c.teacher_id = auth.uid() or c.student_id = auth.uid())
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
      and (c.teacher_id = auth.uid() or c.student_id = auth.uid())
    )
  );
