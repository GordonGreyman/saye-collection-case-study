DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archive_items'
      AND policyname = 'archive_own_update'
  ) THEN
    CREATE POLICY "archive_own_update"
      ON archive_items FOR UPDATE
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;
END $$;
