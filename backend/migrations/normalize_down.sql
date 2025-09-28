-- 1. Drop composite PK on itinerary_activity
ALTER TABLE itinerary_activity
DROP CONSTRAINT itinerary_activity_pkey;

-- 2. Drop unique constraint on personality
ALTER TABLE personality
DROP CONSTRAINT unique_user_personality;

-- 3. Revert column types
ALTER TABLE activity
ALTER COLUMN price TYPE FLOAT USING price::FLOAT,
ALTER COLUMN rating TYPE NUMERIC USING rating::NUMERIC;

-- 4. Restore old country column
ALTER TABLE activity
ADD COLUMN country VARCHAR(255);

-- 5. Drop the new foreign key column
ALTER TABLE activity
DROP COLUMN country_id;

-- 6. Drop the country table
DROP TABLE country;
