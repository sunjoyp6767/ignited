-- Contact messages submitted from public contact/trial forms
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  email text not null,
  message text not null check (char_length(trim(message)) >= 10),
  source_page text not null default 'contact',
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Public website visitors can submit messages.
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- Accountants can review all messages.
drop policy if exists "contact_messages_select_accountant" on public.contact_messages;
create policy "contact_messages_select_accountant"
  on public.contact_messages for select
  to authenticated
  using (public.is_accountant());
