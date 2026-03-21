drop policy if exists "authenticated users can insert comments" on public.record_comments;

create policy "authenticated users can insert comments"
on public.record_comments
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.records
    where public.records.id = record_comments.record_id
      and public.records.visibility = 'public'
  )
);
