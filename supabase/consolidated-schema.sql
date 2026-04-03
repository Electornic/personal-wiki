-- =============================================================================
-- Personal Wiki — Consolidated Schema (after all 20 migrations)
-- Supabase SQL Editor에서 한번에 실행하면 전체 테이블 세팅 완료
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  user_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_user_name_key
on public.profiles (user_name);

-- records
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source_type text not null check (source_type in ('book', 'article')),
  visibility text not null check (visibility in ('public', 'private')),
  author_name text,
  book_title text,
  contents text,
  excerpt text,
  search_vector tsvector,
  reaction_count integer not null default 0,
  published_at date not null default (timezone('utc', now())::date),
  writer_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint records_book_title_matches_source_type check (
    (source_type = 'book' and nullif(btrim(book_title), '') is not null)
    or (source_type = 'article' and nullif(btrim(book_title), '') is null)
  )
);

-- tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

-- record_tags
create table if not exists public.record_tags (
  record_id uuid not null references public.records(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, tag_id)
);

-- document_note_cards (legacy, data migrated into records.contents)
create table if not exists public.document_note_cards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.records(id) on delete cascade,
  heading text,
  content text not null,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- record_comments
create table if not exists public.record_comments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.record_comments(id) on delete cascade,
  depth integer not null default 0 check (depth >= 0 and depth <= 5),
  contents text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- record_bookmarks
create table if not exists public.record_bookmarks (
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, user_id)
);

-- record_likes
create table if not exists public.record_likes (
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, user_id)
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------

-- records
create index if not exists records_visibility_idx
on public.records (visibility);

create index if not exists records_updated_at_idx
on public.records (updated_at desc);

create index if not exists records_writer_user_id_idx
on public.records (writer_user_id);

create index if not exists records_writer_user_id_updated_at_idx
on public.records (writer_user_id, updated_at desc);

create index if not exists records_public_updated_at_idx
on public.records (updated_at desc)
where visibility = 'public';

create index if not exists records_visibility_reaction_count_idx
on public.records (visibility, reaction_count desc, published_at desc, updated_at desc);

create index if not exists records_visibility_published_updated_idx
on public.records (visibility, published_at desc, updated_at desc);

create index if not exists records_search_vector_idx
on public.records using gin (search_vector);

-- record_tags
create index if not exists record_tags_record_idx
on public.record_tags (record_id);

create index if not exists record_tags_tag_idx
on public.record_tags (tag_id);

create index if not exists record_tags_tag_record_idx
on public.record_tags (tag_id, record_id);

-- tags
create index if not exists tags_name_idx
on public.tags (name);

-- document_note_cards
create index if not exists document_note_cards_document_idx
on public.document_note_cards (document_id, position);

-- record_comments
create index if not exists record_comments_record_id_idx
on public.record_comments (record_id, created_at asc);

create index if not exists record_comments_parent_comment_id_idx
on public.record_comments (parent_comment_id);

-- record_bookmarks
create index if not exists record_bookmarks_user_id_idx
on public.record_bookmarks (user_id, created_at desc);

-- record_likes
create index if not exists record_likes_user_id_idx
on public.record_likes (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- FUNCTIONS
-- ---------------------------------------------------------------------------

create or replace function public.touch_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.touch_record_comments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_record_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.records
    set reaction_count = reaction_count + 1
    where id = new.record_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.records
    set reaction_count = greatest(reaction_count - 1, 0)
    where id = old.record_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.build_record_excerpt(
  input_text text,
  fallback_text text default null
)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(
      left(
        trim(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                coalesce(input_text, fallback_text, ''),
                '^#+\s+',
                '',
                'gm'
              ),
              '[*_`>\-\[\]\(\)]',
              '',
              'g'
            ),
            '\s+',
            ' ',
            'g'
          )
        ),
        140
      ),
      ''
    ),
    coalesce(fallback_text, '')
  );
$$;

create or replace function public.build_record_search_vector(
  record_title text,
  record_book_title text,
  record_contents text,
  record_author_name text
)
returns tsvector
language sql
immutable
as $$
  select
    setweight(to_tsvector('simple', coalesce(record_title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(record_book_title, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(record_author_name, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(record_contents, '')), 'C');
$$;

create or replace function public.sync_record_search_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.excerpt := public.build_record_excerpt(new.contents, new.title);
  new.search_vector := public.build_record_search_vector(
    new.title,
    new.book_title,
    new.contents,
    new.author_name
  );
  return new;
end;
$$;

create or replace function public.search_public_records(search_query text)
returns table (
  id uuid,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  with query_input as (
    select nullif(btrim(search_query), '') as raw_query
  ),
  parsed_query as (
    select
      raw_query,
      websearch_to_tsquery('simple', raw_query) as ts_query
    from query_input
    where raw_query is not null
  ),
  tag_matches as (
    select distinct rt.record_id
    from parsed_query pq
    join public.tags t
      on t.name ilike '%' || pq.raw_query || '%'
    join public.record_tags rt
      on rt.tag_id = t.id
  )
  select
    r.id,
    (
      case
        when pq.ts_query is not null and r.search_vector @@ pq.ts_query
          then ts_rank(r.search_vector, pq.ts_query)
        else 0
      end
      + case
        when r.author_name ilike '%' || pq.raw_query || '%'
          then 0.2
        else 0
      end
      + case
        when exists (
          select 1
          from tag_matches tm
          where tm.record_id = r.id
        )
          then 0.2
        else 0
      end
    )::real as rank
  from parsed_query pq
  join public.records r
    on r.visibility = 'public'
  where (
    (pq.ts_query is not null and r.search_vector @@ pq.ts_query)
    or r.author_name ilike '%' || pq.raw_query || '%'
    or exists (
      select 1
      from tag_matches tm
      where tm.record_id = r.id
    )
  )
  order by rank desc, r.published_at desc, r.updated_at desc;
$$;

-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------

drop trigger if exists documents_touch_updated_at on public.records;
create trigger documents_touch_updated_at
before update on public.records
for each row
execute function public.touch_documents_updated_at();

drop trigger if exists record_comments_touch_updated_at on public.record_comments;
create trigger record_comments_touch_updated_at
before update on public.record_comments
for each row
execute function public.touch_record_comments_updated_at();

drop trigger if exists record_likes_reaction_count_insert on public.record_likes;
create trigger record_likes_reaction_count_insert
after insert on public.record_likes
for each row
execute function public.sync_record_reaction_count();

drop trigger if exists record_likes_reaction_count_delete on public.record_likes;
create trigger record_likes_reaction_count_delete
after delete on public.record_likes
for each row
execute function public.sync_record_reaction_count();

drop trigger if exists records_sync_search_fields on public.records;
create trigger records_sync_search_fields
before insert or update of title, book_title, contents, author_name
on public.records
for each row
execute function public.sync_record_search_fields();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — enable
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.tags enable row level security;
alter table public.record_tags enable row level security;
alter table public.document_note_cards enable row level security;
alter table public.record_comments enable row level security;
alter table public.record_bookmarks enable row level security;
alter table public.record_likes enable row level security;

-- ---------------------------------------------------------------------------
-- RLS POLICIES — profiles
-- ---------------------------------------------------------------------------

create policy "profiles can read self"
on public.profiles for select
using (id = auth.uid());

create policy "profiles can insert self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles can update self"
on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles can delete self"
on public.profiles for delete
using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS POLICIES — records
-- ---------------------------------------------------------------------------

create policy "public can read public records"
on public.records for select
using (visibility = 'public' or writer_user_id = auth.uid());

create policy "users manage own records"
on public.records for all
using (writer_user_id = auth.uid())
with check (writer_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS POLICIES — tags
-- ---------------------------------------------------------------------------

create policy "public can read tags tied to visible records"
on public.tags for select
using (
  exists (
    select 1 from public.record_tags
    inner join public.records on public.records.id = public.record_tags.record_id
    where public.record_tags.tag_id = tags.id
      and (public.records.visibility = 'public' or public.records.writer_user_id = auth.uid())
  )
);

create policy "authenticated users can insert tags for records"
on public.tags for insert
with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- RLS POLICIES — record_tags
-- ---------------------------------------------------------------------------

create policy "public can read visible record_tags"
on public.record_tags for select
using (
  exists (
    select 1 from public.records
    where public.records.id = record_tags.record_id
      and (public.records.visibility = 'public' or public.records.writer_user_id = auth.uid())
  )
);

create policy "users manage own record_tags"
on public.record_tags for all
using (
  exists (
    select 1 from public.records
    where public.records.id = record_tags.record_id
      and public.records.writer_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.records
    where public.records.id = record_tags.record_id
      and public.records.writer_user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- RLS POLICIES — document_note_cards
-- ---------------------------------------------------------------------------

create policy "public can read visible note cards"
on public.document_note_cards for select
using (
  exists (
    select 1 from public.records
    where public.records.id = document_note_cards.document_id
      and (public.records.visibility = 'public' or public.records.writer_user_id = auth.uid())
  )
);

create policy "users manage own note cards"
on public.document_note_cards for all
using (
  exists (
    select 1 from public.records
    where public.records.id = document_note_cards.document_id
      and public.records.writer_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.records
    where public.records.id = document_note_cards.document_id
      and public.records.writer_user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- RLS POLICIES — record_comments
-- ---------------------------------------------------------------------------

create policy "public can read comments on visible records"
on public.record_comments for select
using (
  exists (
    select 1 from public.records
    where public.records.id = record_comments.record_id
      and (public.records.visibility = 'public' or public.records.writer_user_id = auth.uid())
  )
);

create policy "authenticated users can insert comments"
on public.record_comments for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.records
    where public.records.id = record_comments.record_id
      and public.records.visibility = 'public'
  )
);

create policy "users delete own comments"
on public.record_comments for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS POLICIES — record_bookmarks
-- ---------------------------------------------------------------------------

create policy "users read own bookmarks"
on public.record_bookmarks for select
using (auth.uid() = user_id);

create policy "users insert own bookmarks"
on public.record_bookmarks for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.records
    where public.records.id = record_bookmarks.record_id
      and public.records.visibility = 'public'
  )
);

create policy "users delete own bookmarks"
on public.record_bookmarks for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS POLICIES — record_likes
-- ---------------------------------------------------------------------------

create policy "users read own likes"
on public.record_likes for select
using (auth.uid() = user_id);

create policy "users insert own likes"
on public.record_likes for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.records
    where public.records.id = record_likes.record_id
      and public.records.visibility = 'public'
  )
);

create policy "users delete own likes"
on public.record_likes for delete
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- STORAGE — record-images bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'record-images',
  'record-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "users insert own record images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'record-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update own record images"
on storage.objects for update to authenticated
using (
  bucket_id = 'record-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'record-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete own record images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'record-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users read own record images"
on storage.objects for select to authenticated
using (
  bucket_id = 'record-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
