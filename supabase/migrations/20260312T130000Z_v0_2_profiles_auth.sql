do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'author_profiles'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles'
  ) then
    alter table public.author_profiles rename to profiles;
  end if;
end
$$;

alter table if exists public.profiles
  add column if not exists user_name text;

alter table if exists public.profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.profiles
set user_name = lower(
  coalesce(
    nullif(user_name, ''),
    regexp_replace(split_part(email, '@', 1), '[^[:alnum:]_]+', '_', 'g')
      || '_'
      || substring(replace(id::text, '-', '') from 1 for 6)
  )
)
where user_name is null
   or user_name = '';

alter table if exists public.profiles
  alter column user_name set not null;

create unique index if not exists profiles_user_name_key
on public.profiles (user_name);

drop policy if exists "authors can read self" on public.profiles;
drop policy if exists "authors can insert self" on public.profiles;
drop policy if exists "authors can update self" on public.profiles;
drop policy if exists "authors can delete self" on public.profiles;
drop policy if exists "author profiles managed by owner" on public.profiles;
drop policy if exists "public can read public documents" on public.documents;
drop policy if exists "owner manages documents" on public.documents;
drop policy if exists "public can read topics tied to visible docs" on public.topics;
drop policy if exists "owner manages topics" on public.topics;
drop policy if exists "public can read visible document_topics" on public.document_topics;
drop policy if exists "owner manages document_topics" on public.document_topics;
drop policy if exists "public can read visible note cards" on public.document_note_cards;
drop policy if exists "owner manages note cards" on public.document_note_cards;

drop function if exists public.is_owner();

create policy "profiles can read self"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles can insert self"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles can update self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles can delete self"
on public.profiles
for delete
using (id = auth.uid());

create policy "public can read public documents"
on public.documents
for select
using (visibility = 'public' or created_by = auth.uid());

create policy "users manage own documents"
on public.documents
for all
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "public can read topics tied to visible docs"
on public.topics
for select
using (
  exists (
    select 1
    from public.document_topics
    inner join public.documents on public.documents.id = public.document_topics.document_id
    where public.document_topics.topic_id = topics.id
      and (
        public.documents.visibility = 'public'
        or public.documents.created_by = auth.uid()
      )
  )
);

create policy "authenticated users can insert tags"
on public.topics
for insert
with check (auth.role() = 'authenticated');

create policy "authenticated users can update tags"
on public.topics
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "public can read visible document_tags"
on public.document_topics
for select
using (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_topics.document_id
      and (
        public.documents.visibility = 'public'
        or public.documents.created_by = auth.uid()
      )
  )
);

create policy "users manage own document_tags"
on public.document_topics
for all
using (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_topics.document_id
      and public.documents.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_topics.document_id
      and public.documents.created_by = auth.uid()
  )
);

create policy "public can read visible note cards"
on public.document_note_cards
for select
using (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_note_cards.document_id
      and (
        public.documents.visibility = 'public'
        or public.documents.created_by = auth.uid()
      )
  )
);

create policy "users manage own note cards"
on public.document_note_cards
for all
using (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_note_cards.document_id
      and public.documents.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.documents
    where public.documents.id = document_note_cards.document_id
      and public.documents.created_by = auth.uid()
  )
);
