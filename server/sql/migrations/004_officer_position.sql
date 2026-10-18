-- ---------------------------------------------------------------------------
-- 004 — Officer designation ("Position / Designation") on user profiles.
--
-- The officer Settings and Edit Profile pages let the officer record their
-- designation (e.g. "Barangay Secretary"). Those pages write through the
-- Supabase JS client, so the column must exist on public.users.
--
-- Idempotent / safe to re-run.
-- ---------------------------------------------------------------------------

alter table public.users
  add column if not exists position varchar;
