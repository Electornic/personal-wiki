update public.records
set author_name = coalesce(
  nullif(btrim(public.profiles.user_name), ''),
  nullif(split_part(lower(btrim(public.profiles.email)), '@', 1), ''),
  'unknown'
)
from public.profiles
where public.profiles.id = public.records.writer_user_id
  and (public.records.author_name is null or btrim(public.records.author_name) = '');
