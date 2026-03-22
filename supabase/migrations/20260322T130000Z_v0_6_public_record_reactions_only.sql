delete from public.record_bookmarks
using public.records
where public.records.id = public.record_bookmarks.record_id
  and public.records.visibility = 'private';

delete from public.record_likes
using public.records
where public.records.id = public.record_likes.record_id
  and public.records.visibility = 'private';

drop policy if exists "users insert own bookmarks" on public.record_bookmarks;
create policy "users insert own bookmarks"
on public.record_bookmarks
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_bookmarks.record_id
      and public.records.visibility = 'public'
  )
);

drop policy if exists "users insert own likes" on public.record_likes;
create policy "users insert own likes"
on public.record_likes
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_likes.record_id
      and public.records.visibility = 'public'
  )
);
