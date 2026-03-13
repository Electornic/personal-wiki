drop policy if exists "authenticated users can update tags for records" on public.tags;

drop policy if exists "users manage own comments" on public.record_comments;

drop trigger if exists record_comments_touch_updated_at on public.record_comments;

create or replace function public.touch_record_comments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger record_comments_touch_updated_at
before update on public.record_comments
for each row
execute function public.touch_record_comments_updated_at();
