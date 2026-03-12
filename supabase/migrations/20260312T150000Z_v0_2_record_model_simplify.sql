alter table if exists public.documents
  add column if not exists contents text;

alter table if exists public.documents
  add column if not exists book_title text;

update public.documents
set book_title = case
  when source_type = 'book' and (book_title is null or book_title = '')
    then source_title
  else book_title
end;

update public.documents d
set contents = coalesce(
  nullif(
    trim(
      concat_ws(
        E'\n\n',
        nullif(d.intro, ''),
        (
          select string_agg(
            case
              when coalesce(n.heading, '') <> ''
                then '## ' || n.heading || E'\n' || n.content
              else n.content
            end,
            E'\n\n'
            order by n.position
          )
          from public.document_note_cards n
          where n.document_id = d.id
        )
      )
    ),
    ''
  ),
  d.title
)
where d.contents is null
   or d.contents = '';
