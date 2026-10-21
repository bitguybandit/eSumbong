-- ---------------------------------------------------------------------------
-- 005 — Categories can require photo evidence.
--
-- Physical issues (potholes, streetlights, drainage, dumping, stray animals)
-- cannot be verified from a text description alone, so the complaint form and
-- API require an attached photo for those categories. Everything else stays
-- optional.
--
-- Idempotent / safe to re-run.
-- ---------------------------------------------------------------------------

alter table public.categories
  add column if not exists requires_photo boolean not null default false;

update public.categories
set requires_photo = true
where name in (
  'Pothole / Road Damage',
  'Broken Streetlight',
  'Clogged Drainage',
  'Illegal Dumping / Garbage',
  'Stray Animal'
);

update public.categories
set requires_photo = false
where name = 'Noise Complaint';
