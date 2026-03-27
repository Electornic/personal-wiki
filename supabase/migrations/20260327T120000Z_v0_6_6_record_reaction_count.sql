alter table public.records
add column if not exists reaction_count integer not null default 0;

update public.records
set reaction_count = 0;

update public.records
set reaction_count = like_totals.like_count
from (
  select record_id, count(*)::integer as like_count
  from public.record_likes
  group by record_id
) as like_totals
where like_totals.record_id = public.records.id;

create index if not exists records_visibility_reaction_count_idx
on public.records (visibility, reaction_count desc, published_at desc, updated_at desc);

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
