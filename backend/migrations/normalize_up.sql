CREATE TABLE country(
id SERIAL PRIMARY KEY,
name VARCHAR(255) UNIQUE NOT NULL
);


ALTER TABLE activity
ADD COLUMN country_id INT REFERENCES country(id);

ALTER TABLE activity
DROP COLUMN country;



ALTER TABLE personality
ADD CONSTRAINT unique_user_personality UNIQUE (user_id);


ALTER TABLE itinerary_activity
ADD PRIMARY KEY (itinerary_id, activity_id);


ALTER TABLE activity
ALTER COLUMN price TYPE NUMERIC(10,2) USING price::NUMERIC,
ALTER COLUMN rating TYPE NUMERIC(3,2) USING rating::NUMERIC;

