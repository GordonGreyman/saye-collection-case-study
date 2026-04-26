-- Allow either member of a connection to remove it.

drop policy if exists "profile_connections_member_delete" on profile_connections;
create policy "profile_connections_member_delete"
  on profile_connections for delete
  using (auth.uid() = profile_a_id or auth.uid() = profile_b_id);

notify pgrst, 'reload schema';
