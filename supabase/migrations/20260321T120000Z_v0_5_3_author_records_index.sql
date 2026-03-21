create index if not exists records_writer_user_id_updated_at_idx
on public.records (writer_user_id, updated_at desc);
