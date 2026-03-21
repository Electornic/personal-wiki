update public.records
set source_title = case
  when source_type = 'book' then coalesce(nullif(btrim(book_title), ''), title)
  else title
end
where source_title is null
   or btrim(source_title) = '';

alter table if exists public.records
  alter column source_title drop not null;
