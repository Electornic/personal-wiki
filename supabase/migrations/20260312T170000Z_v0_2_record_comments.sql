create table if not exists public.record_comments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.record_comments(id) on delete cascade,
  depth integer not null default 0 check (depth >= 0 and depth <= 5),
  contents text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists record_comments_record_id_idx
on public.record_comments (record_id, created_at asc);

create index if not exists record_comments_parent_comment_id_idx
on public.record_comments (parent_comment_id);

alter table public.record_comments enable row level security;

drop policy if exists "public can read comments on visible records" on public.record_comments;
create policy "public can read comments on visible records"
on public.record_comments
for select
using (
  exists (
    select 1
    from public.documents
    where public.documents.id = record_comments.record_id
      and (
        public.documents.visibility = 'public'
        or public.documents.created_by = auth.uid()
      )
  )
);

drop policy if exists "authenticated users can insert comments" on public.record_comments;
create policy "authenticated users can insert comments"
on public.record_comments
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.documents
    where public.documents.id = record_comments.record_id
      and public.documents.visibility = 'public'
  )
);

drop policy if exists "users manage own comments" on public.record_comments;
create policy "users manage own comments"
on public.record_comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own comments" on public.record_comments;
create policy "users delete own comments"
on public.record_comments
for delete
using (auth.uid() = user_id);
