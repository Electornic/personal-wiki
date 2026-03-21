drop trigger if exists curation_shelves_touch_updated_at on public.curation_shelves;

drop function if exists public.touch_curation_shelves_updated_at();

drop table if exists public.curation_shelf_records;
drop table if exists public.curation_shelves;
