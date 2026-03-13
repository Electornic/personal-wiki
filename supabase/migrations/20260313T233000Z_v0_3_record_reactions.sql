create table if not exists public.record_bookmarks (
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, user_id)
);

create table if not exists public.record_likes (
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, user_id)
);

create index if not exists record_bookmarks_user_id_idx
on public.record_bookmarks (user_id, created_at desc);

create index if not exists record_likes_user_id_idx
on public.record_likes (user_id, created_at desc);

alter table public.record_bookmarks enable row level security;
alter table public.record_likes enable row level security;

drop policy if exists "users read own bookmarks" on public.record_bookmarks;
drop policy if exists "users insert own bookmarks" on public.record_bookmarks;
drop policy if exists "users delete own bookmarks" on public.record_bookmarks;

create policy "users read own bookmarks"
on public.record_bookmarks
for select
using (auth.uid() = user_id);

create policy "users insert own bookmarks"
on public.record_bookmarks
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_bookmarks.record_id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "users delete own bookmarks"
on public.record_bookmarks
for delete
using (auth.uid() = user_id);

drop policy if exists "users read own likes" on public.record_likes;
drop policy if exists "users insert own likes" on public.record_likes;
drop policy if exists "users delete own likes" on public.record_likes;

create policy "users read own likes"
on public.record_likes
for select
using (auth.uid() = user_id);

create policy "users insert own likes"
on public.record_likes
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_likes.record_id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "users delete own likes"
on public.record_likes
for delete
using (auth.uid() = user_id);
