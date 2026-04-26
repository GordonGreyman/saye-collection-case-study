-- Add structured fields so one archive row can hold mixed media (text + image + link)
ALTER TABLE archive_items
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS reference_url text,
  ADD COLUMN IF NOT EXISTS canvas jsonb;

-- Optional lookup index for image-heavy browsing
CREATE INDEX IF NOT EXISTS idx_archive_items_image_url
  ON archive_items (image_url)
  WHERE image_url IS NOT NULL;
