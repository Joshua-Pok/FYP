-- ============================================
-- UP MIGRATION
-- Add day_number, time tracking, and ordering to itinerary_activity
-- ============================================

-- Add day_number column (defaults to 1 for existing records)
ALTER TABLE itinerary_activity 
ADD COLUMN day_number INTEGER NOT NULL DEFAULT 1;

-- Add time tracking columns
ALTER TABLE itinerary_activity 
ADD COLUMN start_time TIME;

ALTER TABLE itinerary_activity 
ADD COLUMN end_time TIME;

-- Add duration in minutes (optional, can be calculated from start/end time)
ALTER TABLE itinerary_activity 
ADD COLUMN duration_minutes INTEGER;

-- Add order_in_day column for sequencing activities within a day
ALTER TABLE itinerary_activity 
ADD COLUMN order_in_day INTEGER;

-- Add check constraint to ensure day_number is positive
ALTER TABLE itinerary_activity 
ADD CONSTRAINT day_number_positive 
CHECK (day_number > 0);

-- Add check constraint to ensure order_in_day is positive if set
ALTER TABLE itinerary_activity 
ADD CONSTRAINT order_in_day_positive 
CHECK (order_in_day IS NULL OR order_in_day > 0);

-- Add check constraint to ensure end_time is after start_time if both are set
ALTER TABLE itinerary_activity 
ADD CONSTRAINT end_time_after_start_time 
CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time);

-- Add check constraint for duration_minutes
ALTER TABLE itinerary_activity 
ADD CONSTRAINT duration_minutes_positive 
CHECK (duration_minutes IS NULL OR duration_minutes > 0);

-- Create an index for better query performance when filtering by day
CREATE INDEX idx_itinerary_activity_day 
ON itinerary_activity(itinerary_id, day_number);

-- Create an index for time-based queries
CREATE INDEX idx_itinerary_activity_time 
ON itinerary_activity(itinerary_id, day_number, start_time);
