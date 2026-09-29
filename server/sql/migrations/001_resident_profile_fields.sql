-- =============================================================================
-- Migration: resident profile fields
-- Run this in the Supabase SQL Editor if your database was created before
-- these columns existed (idempotent — safe to run multiple times).
-- =============================================================================

alter table public.users add column if not exists first_name  varchar;
alter table public.users add column if not exists middle_name varchar;
alter table public.users add column if not exists last_name   varchar;
alter table public.users add column if not exists phone       varchar;
alter table public.users add column if not exists avatar_url  varchar;
