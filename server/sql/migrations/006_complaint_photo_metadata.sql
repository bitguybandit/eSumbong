-- ---------------------------------------------------------------------------
-- 006 — Store EXIF metadata captured for complaint photos.
--
-- The upload endpoint reads DateTimeOriginal / Make / Model before the bytes
-- reach storage. Keeping the snapshot on the complaint lets officers see
-- whether a report's photo came from a camera or is likely a screenshot,
-- a downloaded image, or AI output.
--
-- NULL = no camera metadata found.
--
-- Idempotent / safe to re-run.
-- ---------------------------------------------------------------------------

alter table public.complaints
  add column if not exists photo_metadata jsonb;
