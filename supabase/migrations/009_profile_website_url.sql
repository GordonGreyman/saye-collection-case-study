alter table profiles
  add column if not exists website_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_website_url_http'
  ) then
    alter table profiles
      add constraint profiles_website_url_http
      check (
        website_url is null
        or website_url ~* '^https?://[^[:space:]]+\.[^[:space:]]+'
      );
  end if;
end $$;
