-- Migration: Add claim verification columns to locations
-- Run this in the Supabase SQL Editor.

-- claim_status: 'verified' (auto-verified via domain match), 'pending' (needs manual review), NULL (legacy/manual add)
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS claim_status text;

-- claim_email: the Google email used to claim this business
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS claim_email text;

-- claim_note: human-readable verification note for admin review
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS claim_note text;

-- Index for admin dashboard filtering pending claims
CREATE INDEX IF NOT EXISTS idx_locations_claim_status
  ON locations (claim_status);
