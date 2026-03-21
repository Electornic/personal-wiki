do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'curation_shelves'
  ) then
    drop policy if exists "public can read shelves with public records" on public.curation_shelves;
    drop policy if exists "users manage own curation shelves" on public.curation_shelves;
    drop trigger if exists curation_shelves_touch_updated_at on public.curation_shelves;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'curation_shelf_records'
  ) then
    drop policy if exists "public can read shelf records for public records" on public.curation_shelf_records;
    drop policy if exists "users manage own shelf records" on public.curation_shelf_records;
  end if;
end
$$;

drop function if exists public.touch_curation_shelves_updated_at();

drop table if exists public.curation_shelf_records;
drop table if exists public.curation_shelves;
