create table if not exists public.curation_shelves (
  id uuid primary key default gen_random_uuid(),
  writer_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  placement text not null check (placement in ('home', 'topic')),
  topic_tag text,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (placement = 'home' and topic_tag is null)
    or (
      placement = 'topic'
      and topic_tag is not null
      and length(trim(topic_tag)) > 0
    )
  )
);

create table if not exists public.curation_shelf_records (
  shelf_id uuid not null references public.curation_shelves(id) on delete cascade,
  record_id uuid not null references public.records(id) on delete cascade,
  position integer not null default 0,
  primary key (shelf_id, record_id)
);

create index if not exists curation_shelves_writer_user_id_idx
on public.curation_shelves (writer_user_id, position asc, created_at asc);

create index if not exists curation_shelves_placement_idx
on public.curation_shelves (placement, topic_tag);

create index if not exists curation_shelf_records_shelf_id_idx
on public.curation_shelf_records (shelf_id, position asc);

create or replace function public.touch_curation_shelves_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists curation_shelves_touch_updated_at on public.curation_shelves;

create trigger curation_shelves_touch_updated_at
before update on public.curation_shelves
for each row
execute function public.touch_curation_shelves_updated_at();

alter table public.curation_shelves enable row level security;
alter table public.curation_shelf_records enable row level security;

drop policy if exists "public can read shelves with public records" on public.curation_shelves;
drop policy if exists "users manage own curation shelves" on public.curation_shelves;

create policy "public can read shelves with public records"
on public.curation_shelves
for select
using (
  exists (
    select 1
    from public.curation_shelf_records
    join public.records on public.records.id = public.curation_shelf_records.record_id
    where public.curation_shelf_records.shelf_id = curation_shelves.id
      and public.records.visibility = 'public'
  )
);

create policy "users manage own curation shelves"
on public.curation_shelves
for all
using (writer_user_id = auth.uid())
with check (writer_user_id = auth.uid());

drop policy if exists "public can read shelf records for public records" on public.curation_shelf_records;
drop policy if exists "users manage own shelf records" on public.curation_shelf_records;

create policy "public can read shelf records for public records"
on public.curation_shelf_records
for select
using (
  exists (
    select 1
    from public.records
    where public.records.id = curation_shelf_records.record_id
      and public.records.visibility = 'public'
  )
);

create policy "users manage own shelf records"
on public.curation_shelf_records
for all
using (
  exists (
    select 1
    from public.curation_shelves
    where public.curation_shelves.id = curation_shelf_records.shelf_id
      and public.curation_shelves.writer_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.curation_shelves
    where public.curation_shelves.id = curation_shelf_records.shelf_id
      and public.curation_shelves.writer_user_id = auth.uid()
  )
);
