CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(255) UNIQUE NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	
)

CREATE TABLE IF NOT EXISTS activities(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	price


	)

INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com')
('Jane Smith', 'jane@example.com')
