update public.records
set author_name = coalesce(nullif(btrim(author_name), ''), public.profiles.user_name, 'unknown')
from public.profiles
where public.profiles.id = public.records.writer_user_id
  and (public.records.author_name is null or btrim(public.records.author_name) = '');

alter table if exists public.records
  alter column author_name drop not null;
