update public.records
set book_title = coalesce(nullif(btrim(book_title), ''), nullif(btrim(source_title), ''), title)
where source_type = 'book'
  and nullif(btrim(book_title), '') is null;

update public.records
set book_title = null
where source_type = 'article';

update public.records
set published_at = coalesce(published_at, created_at::date)
where published_at is null;

update public.records
set author_name = public.profiles.user_name
from public.profiles
where public.profiles.id = public.records.writer_user_id
  and nullif(btrim(public.profiles.user_name), '') is not null
  and public.records.author_name is distinct from public.profiles.user_name;

alter table if exists public.records
  alter column published_at set default (timezone('utc', now())::date);

alter table if exists public.records
  alter column published_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.records'::regclass
      and conname = 'records_book_title_matches_source_type'
  ) then
    alter table public.records
      add constraint records_book_title_matches_source_type
      check (
        (source_type = 'book' and nullif(btrim(book_title), '') is not null)
        or (source_type = 'article' and nullif(btrim(book_title), '') is null)
      );
  end if;
end
$$;

create index if not exists records_public_updated_at_idx
on public.records (updated_at desc)
where visibility = 'public';
