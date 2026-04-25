-- =============================================================================
-- One Good Deed — Initial Schema
-- Supabase / PostgreSQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: deeds
-- -----------------------------------------------------------------------------
create table deeds (
  id                uuid        default gen_random_uuid() primary key,
  content           text        not null,
  author            text        default null,
  status            text        not null default 'pending_review',
  moderation_reason text,
  created_at        timestamptz default now(),
  expires_at        timestamptz default now() + interval '12 hours'
);

-- Index for the most frequent query pattern (status + expiry filter)
create index deeds_status_expires_idx on deeds (status, expires_at);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Note: RLS is currently disabled for MVP simplicity.
-- Re-enable as part of security hardening post-launch.
-- See: TODO in README
-- -----------------------------------------------------------------------------
alter table deeds disable row level security;

-- Grants required for Supabase anon key (used by Edge Functions)
grant all on deeds to anon;
grant all on deeds to authenticated;
grant all on deeds to service_role;

-- -----------------------------------------------------------------------------
-- REALTIME
-- Enable postgres_changes broadcast for the deeds table
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table deeds;

-- -----------------------------------------------------------------------------
-- NOTES
-- -----------------------------------------------------------------------------
-- expires_at: deeds expire 12 hours after creation.
-- Frontend queries filter with: WHERE expires_at > now() AND status = 'approved'
-- Expired rows are excluded from display but remain in the DB.
-- A nightly cleanup job (future) will physically remove old rows.
--
-- status values:
--   'pending_review' — default, awaiting AI moderation result
--   'approved'       — visible on the public site
--   'rejected'       — blocked by AI moderation, never shown
--
-- author: optional free-text field, not verified, default null.
-- Displayed on the frontend as-is. No PII collected by design.
