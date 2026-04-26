-- Avatars storage bucket: public, 2 MB limit, image types only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage object policies for the avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'avatars_public_read' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "avatars_public_read"
      on storage.objects for select
      using (bucket_id = 'avatars');
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'avatars_owner_upload' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "avatars_owner_upload"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'avatars' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'avatars_owner_update' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "avatars_owner_update"
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'avatars' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'avatars_owner_delete' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "avatars_owner_delete"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'avatars' and
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

notify pgrst, 'reload schema';
