-- Migration: Add discovery / ranking columns to locations
-- Run this in the Supabase SQL Editor or via the CLI:
--   supabase db push  (if using CLI migrations)
--
-- Safe to run multiple times — uses IF NOT EXISTS / DO blocks.

-- 1. city: explicit city name for directory search & grouping
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS city text;

-- 2. category: slug from the fixed taxonomy in src/lib/categories.ts
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS category text;

-- 3. listed: opt-in/out of appearing in the public discover directory
--    NULL is treated as TRUE (listed by default) to avoid breaking existing rows
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS listed boolean DEFAULT true;

-- 4. ranking_score: pre-computed Bayesian average (updated hourly by cron)
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS ranking_score real;

-- 5. avg_rating: denormalised average rating (avoids join on every page load)
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS avg_rating real;

-- 6. review_count: denormalised review count
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Indexes for fast directory queries
CREATE INDEX IF NOT EXISTS idx_locations_city
  ON locations (city);

CREATE INDEX IF NOT EXISTS idx_locations_category
  ON locations (category);

CREATE INDEX IF NOT EXISTS idx_locations_listed
  ON locations (listed);

CREATE INDEX IF NOT EXISTS idx_locations_ranking_score
  ON locations (ranking_score DESC NULLS LAST);
