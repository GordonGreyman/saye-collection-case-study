-- Optional profile banners: color swatches or uploaded photos with saved focal point.

alter table profiles
  add column if not exists banner_color text,
  add column if not exists banner_image_url text,
  add column if not exists banner_position_x numeric,
  add column if not exists banner_position_y numeric;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_banner_position_x_range'
  ) then
    alter table profiles
      add constraint profiles_banner_position_x_range
      check (banner_position_x is null or (banner_position_x >= 0 and banner_position_x <= 100)) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_banner_position_y_range'
  ) then
    alter table profiles
      add constraint profiles_banner_position_y_range
      check (banner_position_y is null or (banner_position_y >= 0 and banner_position_y <= 100)) not valid;
  end if;
end $$;

notify pgrst, 'reload schema';
