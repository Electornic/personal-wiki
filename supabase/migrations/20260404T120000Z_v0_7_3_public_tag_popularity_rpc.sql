-- v0.7.3: RPC function to get public document tags sorted by popularity
-- Replaces client-side full table scan with server-side aggregation

create or replace function get_public_tags_by_popularity()
returns table (name text, doc_count bigint)
language sql
stable
security invoker
as $$
  select t.name, count(rt.record_id) as doc_count
  from tags t
  join record_tags rt on t.id = rt.tag_id
  join records r on rt.record_id = r.id
  where r.visibility = 'public'
  group by t.name
  order by doc_count desc, t.name asc;
$$;
