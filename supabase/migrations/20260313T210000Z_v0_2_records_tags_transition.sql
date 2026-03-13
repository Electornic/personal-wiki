do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'documents'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'records'
  ) then
    alter table public.documents rename to records;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'topics'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'tags'
  ) then
    alter table public.topics rename to tags;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'document_topics'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'record_tags'
  ) then
    alter table public.document_topics rename to record_tags;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'records'
      and column_name = 'created_by'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'records'
      and column_name = 'writer_user_id'
  ) then
    alter table public.records rename column created_by to writer_user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'record_tags'
      and column_name = 'document_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'record_tags'
      and column_name = 'record_id'
  ) then
    alter table public.record_tags rename column document_id to record_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'record_tags'
      and column_name = 'topic_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'record_tags'
      and column_name = 'tag_id'
  ) then
    alter table public.record_tags rename column topic_id to tag_id;
  end if;
end
$$;

alter table if exists public.records
  add column if not exists contents text;

alter table if exists public.records
  add column if not exists book_title text;

update public.records
set book_title = case
  when source_type = 'book' and (book_title is null or book_title = '')
    then source_title
  else book_title
end;

update public.records r
set contents = coalesce(
  nullif(
    trim(
      concat_ws(
        E'\n\n',
        nullif(r.intro, ''),
        (
          select string_agg(
            case
              when coalesce(n.heading, '') <> ''
                then '## ' || n.heading || E'\n' || n.content
              else n.content
            end,
            E'\n\n'
            order by n.position
          )
          from public.document_note_cards n
          where n.document_id = r.id
        )
      )
    ),
    ''
  ),
  r.title
)
where r.contents is null
   or r.contents = '';

create index if not exists records_visibility_idx
on public.records (visibility);

create index if not exists records_updated_at_idx
on public.records (updated_at desc);

create index if not exists records_writer_user_id_idx
on public.records (writer_user_id);

create index if not exists record_tags_record_idx
on public.record_tags (record_id);

create index if not exists record_tags_tag_idx
on public.record_tags (tag_id);

alter table if exists public.records enable row level security;
alter table if exists public.tags enable row level security;
alter table if exists public.record_tags enable row level security;

drop policy if exists "public can read public documents" on public.records;
drop policy if exists "users manage own documents" on public.records;
drop policy if exists "public can read public records" on public.records;
drop policy if exists "users manage own records" on public.records;

create policy "public can read public records"
on public.records
for select
using (visibility = 'public' or writer_user_id = auth.uid());

create policy "users manage own records"
on public.records
for all
using (writer_user_id = auth.uid())
with check (writer_user_id = auth.uid());

drop policy if exists "public can read topics tied to visible docs" on public.tags;
drop policy if exists "authenticated users can insert tags" on public.tags;
drop policy if exists "authenticated users can update tags" on public.tags;
drop policy if exists "public can read tags tied to visible records" on public.tags;
drop policy if exists "authenticated users can insert tags for records" on public.tags;
drop policy if exists "authenticated users can update tags for records" on public.tags;

create policy "public can read tags tied to visible records"
on public.tags
for select
using (
  exists (
    select 1
    from public.record_tags
    inner join public.records on public.records.id = public.record_tags.record_id
    where public.record_tags.tag_id = tags.id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "authenticated users can insert tags for records"
on public.tags
for insert
with check (auth.role() = 'authenticated');

create policy "authenticated users can update tags for records"
on public.tags
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "public can read visible document_tags" on public.record_tags;
drop policy if exists "users manage own document_tags" on public.record_tags;
drop policy if exists "public can read visible record_tags" on public.record_tags;
drop policy if exists "users manage own record_tags" on public.record_tags;

create policy "public can read visible record_tags"
on public.record_tags
for select
using (
  exists (
    select 1
    from public.records
    where public.records.id = record_tags.record_id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "users manage own record_tags"
on public.record_tags
for all
using (
  exists (
    select 1
    from public.records
    where public.records.id = record_tags.record_id
      and public.records.writer_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.records
    where public.records.id = record_tags.record_id
      and public.records.writer_user_id = auth.uid()
  )
);

drop policy if exists "public can read comments on visible records" on public.record_comments;
drop policy if exists "authenticated users can insert comments" on public.record_comments;
drop policy if exists "users manage own comments" on public.record_comments;
drop policy if exists "users delete own comments" on public.record_comments;

create policy "public can read comments on visible records"
on public.record_comments
for select
using (
  exists (
    select 1
    from public.records
    where public.records.id = record_comments.record_id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "authenticated users can insert comments"
on public.record_comments
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_comments.record_id
      and (
        public.records.visibility = 'public'
        or public.records.writer_user_id = auth.uid()
      )
  )
);

create policy "users manage own comments"
on public.record_comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users delete own comments"
on public.record_comments
for delete
using (auth.uid() = user_id);
