-- 003_public_track_rls.sql
-- Row Level Security for public complaint tracking + anonymous flag support.
--
-- Flows covered:
--   Flow A (guest submission):  resident_id = NULL, is_anonymous = false
--   Flow B (anonymous toggle):  resident_id = NULL, is_anonymous = true
--   Regular submission:         resident_id = auth.uid(), is_anonymous = false
--
-- The public track endpoint (GET /api/complaints/track/:trackingId) reads through
-- the Express service-role client, which bypasses RLS. These policies are the
-- defense-in-depth layer for any direct Supabase (anon key) access.

-- 1. Add the is_anonymous flag to complaints.
alter table public.complaints
  add column if not exists is_anonymous boolean not null default false;

-- Backfill: any complaint that was never linked to a resident account is
-- treated as anonymous (safe, privacy-preserving default).
update public.complaints
   set is_anonymous = true
 where resident_id is null;

-- 2. Enable Row Level Security.
alter table public.complaints enable row level security;

-- 3. Residents: can only SELECT their own complaints.
drop policy if exists "Residents can view own complaints" on public.complaints;
create policy "Residents can view own complaints"
  on public.complaints
  for select
  to authenticated
  using (resident_id = auth.uid());

-- 4. Officers: can SELECT all complaints.
drop policy if exists "Officers can view all complaints" on public.complaints;
create policy "Officers can view all complaints"
  on public.complaints
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role_type = 'officer'
    )
  );

-- 5. Public tracking: anyone may look a complaint up by tracking_id.
--    Column-level protection below ensures resident_id is never readable.
drop policy if exists "Public tracking by tracking id" on public.complaints;
create policy "Public tracking by tracking id"
  on public.complaints
  for select
  to anon
  using (true);

-- 6. Column-level protection: revoke the broad anon grant, then re-grant
--    SELECT on every column EXCEPT resident_id (PII never leaves the DB).
revoke select on public.complaints from anon;
grant select (
  id,
  tracking_id,
  category_id,
  referred_target_id,
  description,
  latitude,
  longitude,
  location_text,
  photo_path,
  status,
  rejection_reason,
  resolution_remarks,
  resolution_photo_path,
  is_anonymous,
  created_at,
  updated_at
) on public.complaints to anon;
