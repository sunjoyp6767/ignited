-- Teacher-authored blog posts for public /blog page
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_teacher_idx
  on public.blog_posts (teacher_id, created_at desc);

create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc);

alter table public.blog_posts enable row level security;

-- Public can read only published posts.
drop policy if exists "blog_posts_public_select_published" on public.blog_posts;
create policy "blog_posts_public_select_published"
  on public.blog_posts for select
  to anon, authenticated
  using (is_published = true);

-- Teachers can read their own posts (draft + published).
drop policy if exists "blog_posts_teacher_select_own" on public.blog_posts;
create policy "blog_posts_teacher_select_own"
  on public.blog_posts for select
  to authenticated
  using (teacher_id = auth.uid());

-- Teachers can insert their own posts.
drop policy if exists "blog_posts_teacher_insert_own" on public.blog_posts;
create policy "blog_posts_teacher_insert_own"
  on public.blog_posts for insert
  to authenticated
  with check (teacher_id = auth.uid());

-- Teachers can update their own posts.
drop policy if exists "blog_posts_teacher_update_own" on public.blog_posts;
create policy "blog_posts_teacher_update_own"
  on public.blog_posts for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
