-- ============================================
-- DOWN MIGRATION
-- Remove day support and time tracking from itinerary_activity
-- ============================================

-- Drop the indexes
DROP INDEX IF EXISTS idx_itinerary_activity_time;
DROP INDEX IF EXISTS idx_itinerary_activity_day;

-- Drop the check constraints
ALTER TABLE itinerary_activity 
DROP CONSTRAINT IF EXISTS duration_minutes_positive;

ALTER TABLE itinerary_activity 
DROP CONSTRAINT IF EXISTS end_time_after_start_time;

ALTER TABLE itinerary_activity 
DROP CONSTRAINT IF EXISTS order_in_day_positive;

ALTER TABLE itinerary_activity 
DROP CONSTRAINT IF EXISTS day_number_positive;

-- Drop the columns
ALTER TABLE itinerary_activity 
DROP COLUMN IF EXISTS order_in_day;

ALTER TABLE itinerary_activity 
DROP COLUMN IF EXISTS duration_minutes;

ALTER TABLE itinerary_activity 
DROP COLUMN IF EXISTS end_time;

ALTER TABLE itinerary_activity 
DROP COLUMN IF EXISTS start_time;

ALTER TABLE itinerary_activity 
DROP COLUMN IF EXISTS day_number;
