create extension if not exists "pgcrypto";

create table if not exists public.author_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source_type text not null check (source_type in ('book', 'article')),
  visibility text not null check (visibility in ('public', 'private')),
  author_name text not null,
  source_title text not null,
  source_url text,
  isbn text,
  published_at date,
  intro text,
  created_by uuid references public.author_profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.document_topics (
  document_id uuid not null references public.documents(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (document_id, topic_id)
);

create table if not exists public.document_note_cards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  heading text,
  content text not null,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists documents_visibility_idx on public.documents (visibility);
create index if not exists documents_updated_at_idx on public.documents (updated_at desc);
create index if not exists document_topics_document_idx on public.document_topics (document_id);
create index if not exists document_note_cards_document_idx on public.document_note_cards (document_id, position);

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.author_profiles author_profiles
    where author_profiles.id = auth.uid()
  );
$$;

create or replace function public.touch_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists documents_touch_updated_at on public.documents;

create trigger documents_touch_updated_at
before update on public.documents
for each row
execute function public.touch_documents_updated_at();

alter table public.author_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.topics enable row level security;
alter table public.document_topics enable row level security;
alter table public.document_note_cards enable row level security;

drop policy if exists "authors can read self" on public.author_profiles;
create policy "authors can read self"
on public.author_profiles
for select
using (id = auth.uid());

drop policy if exists "author profiles managed by owner" on public.author_profiles;
create policy "author profiles managed by owner"
on public.author_profiles
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "public can read public documents" on public.documents;
create policy "public can read public documents"
on public.documents
for select
using (visibility = 'public' or public.is_owner());

drop policy if exists "owner manages documents" on public.documents;
create policy "owner manages documents"
on public.documents
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "public can read topics tied to visible docs" on public.topics;
create policy "public can read topics tied to visible docs"
on public.topics
for select
using (
  public.is_owner()
  or exists (
    select 1
    from public.document_topics
    inner join public.documents on public.documents.id = public.document_topics.document_id
    where public.document_topics.topic_id = topics.id
      and public.documents.visibility = 'public'
  )
);

drop policy if exists "owner manages topics" on public.topics;
create policy "owner manages topics"
on public.topics
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "public can read visible document_topics" on public.document_topics;
create policy "public can read visible document_topics"
on public.document_topics
for select
using (
  public.is_owner()
  or exists (
    select 1
    from public.documents
    where public.documents.id = document_topics.document_id
      and public.documents.visibility = 'public'
  )
);

drop policy if exists "owner manages document_topics" on public.document_topics;
create policy "owner manages document_topics"
on public.document_topics
for all
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "public can read visible note cards" on public.document_note_cards;
create policy "public can read visible note cards"
on public.document_note_cards
for select
using (
  public.is_owner()
  or exists (
    select 1
    from public.documents
    where public.documents.id = document_note_cards.document_id
      and public.documents.visibility = 'public'
  )
);

drop policy if exists "owner manages note cards" on public.document_note_cards;
create policy "owner manages note cards"
on public.document_note_cards
for all
using (public.is_owner())
with check (public.is_owner());
