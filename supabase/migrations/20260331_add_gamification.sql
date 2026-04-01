-- ReviewHype Gamification Schema
-- Adds reputation levels, achievements, and response streaks

-- 1. achievements: JSONB array of earned badge slugs per location
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb;

-- 2. reputation_level: computed tier stored for quick display
--    Values: 'bronze' | 'silver' | 'gold' | 'elite'
ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS reputation_level text;

-- 3. response_streak: consecutive days with at least one review response
--    Stored on profiles (per user, not per location)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS response_streak integer DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_last_date date;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_responses integer DEFAULT 0;

-- 4. level_xp: experience points for the business owner (profile level)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_locations_reputation_level
  ON locations (reputation_level);

CREATE INDEX IF NOT EXISTS idx_profiles_xp
  ON profiles (xp DESC NULLS LAST);

-- 5. Function: compute reputation level from avg_rating + review_count
CREATE OR REPLACE FUNCTION compute_reputation_level(
  avg_rating real,
  review_count integer
) RETURNS text AS $$
DECLARE
  score real;
BEGIN
  IF avg_rating IS NULL OR review_count < 5 THEN
    RETURN NULL;
  END IF;
  score := avg_rating * ln(review_count + 1);
  IF score >= 9.7 THEN RETURN 'elite';
  ELSIF score >= 6.9 THEN RETURN 'gold';
  ELSIF score >= 4.1 THEN RETURN 'silver';
  ELSIF score >= 2.1 THEN RETURN 'bronze';
  ELSE RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Backfill existing locations with their reputation level
--    (only runs if avg_rating column exists — from the discovery migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'avg_rating'
  ) THEN
    UPDATE locations
    SET reputation_level = compute_reputation_level(avg_rating, review_count)
    WHERE avg_rating IS NOT NULL AND review_count IS NOT NULL;
  END IF;
END;
$$;

-- 7. RPC: award XP + update streak when user responds to a review
--    Called as: supabase.rpc('award_response_xp', { xp_amount: 10 })
CREATE OR REPLACE FUNCTION award_response_xp(xp_amount integer DEFAULT 10)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today date := CURRENT_DATE;
  last_date date;
  current_streak integer;
BEGIN
  SELECT streak_last_date, response_streak
  INTO last_date, current_streak
  FROM profiles
  WHERE id = auth.uid();

  -- Update streak: increment if responded yesterday, reset if gap, keep if same day
  IF last_date = today - 1 THEN
    -- Continued streak
    UPDATE profiles
    SET
      xp = xp + xp_amount,
      total_responses = total_responses + 1,
      response_streak = current_streak + 1,
      streak_last_date = today
    WHERE id = auth.uid();
  ELSIF last_date = today THEN
    -- Already responded today — just add XP, no streak bump
    UPDATE profiles
    SET
      xp = xp + xp_amount,
      total_responses = total_responses + 1
    WHERE id = auth.uid();
  ELSE
    -- Streak broken (or first response ever) — reset to 1
    UPDATE profiles
    SET
      xp = xp + xp_amount,
      total_responses = total_responses + 1,
      response_streak = 1,
      streak_last_date = today
    WHERE id = auth.uid();
  END IF;
END;
$$;
