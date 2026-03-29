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

alter table public.records
  add column if not exists excerpt text;

alter table public.records
  add column if not exists search_vector tsvector;

update public.records
set excerpt = public.build_record_excerpt(contents, title),
    search_vector = public.build_record_search_vector(title, book_title, contents, author_name);

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

drop trigger if exists records_sync_search_fields on public.records;
create trigger records_sync_search_fields
before insert or update of title, book_title, contents, author_name
on public.records
for each row
execute function public.sync_record_search_fields();

create index if not exists records_visibility_published_updated_idx
on public.records (visibility, published_at desc, updated_at desc);

create index if not exists records_search_vector_idx
on public.records using gin (search_vector);

create index if not exists record_tags_tag_record_idx
on public.record_tags (tag_id, record_id);

create index if not exists tags_name_idx
on public.tags (name);

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
