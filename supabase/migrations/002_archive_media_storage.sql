-- Archive media storage bucket and RLS policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'archive-media',
  'archive-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "archive_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'archive-media');

create policy "archive_media_owner_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'archive-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "archive_media_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'archive-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'archive-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "archive_media_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'archive-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
