alter table if exists public.records
  drop column if exists source_title,
  drop column if exists source_url,
  drop column if exists isbn,
  drop column if exists intro;
