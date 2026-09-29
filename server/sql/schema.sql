-- =============================================================================
-- eSumbong — Supabase PostgreSQL schema
-- Run this entire script in the Supabase SQL Editor.
--
--  • Supabase Auth manages authentication users in `auth.users`.
--  • The `on_auth_user_created` trigger mirrors each auth user into `users`.
--  • The Express backend uses the service-role key (which bypasses RLS),
--    so Row Level Security is optional for the MVP. Enable RLS and add
--    permissive policies before any public deployment.
-- ============================================================================= 

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('resident', 'officer');

create type complaint_status as enum (
  'submitted',     -- awaiting initial review (Complaint Queue)
  'under_review',  -- accepted for barangay action (UI: "Accepted")
  'referred',      -- referred to a target (UI: "In Progress")
  'resolved',      -- resolved
  'closed',        -- closed
  'rejected'       -- rejected
);

create type action_entry_type as enum (
  'submitted',
  'accepted',
  'rejected',
  'referred',
  'action',
  'resolved',
  'closed'
);

-- ---------------------------------------------------------------------------
-- referral_targets
-- ---------------------------------------------------------------------------

create table if not exists public.referral_targets (
  id           uuid primary key default gen_random_uuid(),
  name         varchar not null,
  description  text,
  contact_info varchar,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id                          uuid primary key default gen_random_uuid(),
  name                        varchar not null,
  description                 text,
  default_referral_target_id  uuid references public.referral_targets (id) on delete set null,
  created_at                  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- users (application profiles; 1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   varchar not null,
  role_type   user_role not null default 'resident',
  first_name  varchar,
  middle_name varchar,
  last_name   varchar,
  phone       varchar,
  avatar_url  varchar,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- complaints
-- ---------------------------------------------------------------------------

create table if not exists public.complaints (
  id                     uuid primary key default gen_random_uuid(),
  tracking_id            varchar not null unique,
  -- Nullable to support anonymous reporting (unlinked from any account).
  resident_id            uuid references public.users (id) on delete set null,
  category_id            uuid references public.categories (id) on delete set null,
  referred_target_id     uuid references public.referral_targets (id) on delete set null,
  description            text not null,
  latitude               decimal not null,
  longitude              decimal not null,
  location_text          varchar,
  photo_path             varchar,
  status                 complaint_status not null default 'submitted',
  rejection_reason       text,
  resolution_remarks     text,
  resolution_photo_path  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists complaints_status_idx   on public.complaints (status);
create index if not exists complaints_resident_idx on public.complaints (resident_id);
create index if not exists complaints_created_idx  on public.complaints (created_at desc);

-- ---------------------------------------------------------------------------
-- action_log_entries (status/action history per complaint)
-- ---------------------------------------------------------------------------

create table if not exists public.action_log_entries (
  id           uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  officer_id   uuid references public.users (id) on delete set null,
  entry_type   action_entry_type not null,
  description  text,
  created_at   timestamptz not null default now()
);

create index if not exists action_log_complaint_idx on public.action_log_entries (complaint_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints (id) on delete cascade,
  user_id      uuid references public.users (id) on delete cascade,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for complaints
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
  before update on public.complaints
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile row on signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, role_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role_type')::public.user_role, 'resident')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Seed: referral targets
-- ---------------------------------------------------------------------------

insert into public.referral_targets (name, description, contact_info) values
  ('Engineering / Public Works',              'Roads, drainage, signage, and public infrastructure maintenance', 'City Engineering Office / DPWH'),
  ('Utility Provider / Electrical Maintenance','Streetlight and electrical line maintenance',                    'Local electric utility provider'),
  ('Barangay Peace & Order Unit',             'Noise, disturbances, and peace-and-order concerns',                'Barangay Tanod / PNP'),
  ('Barangay Sanitation Unit',                'Garbage collection, illegal dumping, and sanitation concerns',     'Barangay Sanitation Office'),
  ('Animal Control Office',                   'Stray animal concerns and animal control',                          'City Veterinary Office');

-- ---------------------------------------------------------------------------
-- Seed: categories (with rule-based default referral target)
-- ---------------------------------------------------------------------------

insert into public.categories (name, description, default_referral_target_id) values
  ('Pothole / Road Damage',       'Potholes, cracks, and road surface damage',
    (select id from public.referral_targets where name = 'Engineering / Public Works')),
  ('Broken Streetlight',          'Non-functional or damaged streetlights',
    (select id from public.referral_targets where name = 'Utility Provider / Electrical Maintenance')),
  ('Clogged Drainage',            'Blocked drainage, flooding, and water accumulation',
    (select id from public.referral_targets where name = 'Engineering / Public Works')),
  ('Illegal Dumping / Garbage',   'Illegal waste dumping and unsanitary garbage accumulation',
    (select id from public.referral_targets where name = 'Barangay Sanitation Unit')),
  ('Noise Complaint',             'Loud disturbances and noise-related complaints',
    (select id from public.referral_targets where name = 'Barangay Peace & Order Unit')),
  ('Stray Animal',                'Stray animals and animal-related concerns',
    (select id from public.referral_targets where name = 'Animal Control Office'));
