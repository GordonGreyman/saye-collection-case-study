-- Mutual profile connections stored as one canonical pair.

create table if not exists profile_connections (
  id uuid primary key default gen_random_uuid(),
  profile_a_id uuid not null references profiles(id) on delete cascade,
  profile_b_id uuid not null references profiles(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  constraint profile_connections_distinct_profiles check (profile_a_id <> profile_b_id),
  constraint profile_connections_canonical_pair check (profile_a_id < profile_b_id),
  constraint profile_connections_unique_pair unique (profile_a_id, profile_b_id)
);

create index if not exists idx_profile_connections_a on profile_connections(profile_a_id);
create index if not exists idx_profile_connections_b on profile_connections(profile_b_id);

alter table profile_connections enable row level security;

drop policy if exists "profile_connections_member_read" on profile_connections;
create policy "profile_connections_member_read"
  on profile_connections for select
  using (auth.uid() = profile_a_id or auth.uid() = profile_b_id);

drop policy if exists "profile_connections_member_insert" on profile_connections;
create policy "profile_connections_member_insert"
  on profile_connections for insert
  with check (
    auth.uid() = created_by
    and (auth.uid() = profile_a_id or auth.uid() = profile_b_id)
  );

notify pgrst, 'reload schema';
