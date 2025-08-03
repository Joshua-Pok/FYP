package database

import (
	"database/sql"
	"fmt"
	"log"

	"backend/config"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// DB holds the database connection
var DB *sql.DB

// InitDB initializes the database connection
// This function establishes a connection to PostgreSQL using environment variables
func InitDB() (*sql.DB, error) {
	// Get database configuration from environment variables
	host, port, name, user, password := config.GetDatabaseConfig()
	
	// Create connection string
	connStr := fmt.Sprintf(config.DBConnectionString, user, password, host, port, name)
	
	// Open database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}
	
	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	
	// Set connection pool settings
	db.SetMaxOpenConns(25) // Maximum number of open connections
	db.SetMaxIdleConns(5)  // Maximum number of idle connections
	
	// Store the connection globally
	DB = db
	
	log.Println("Database connection established successfully")
	return db, nil
}

// CloseDB closes the database connection
// This should be called when the application shuts down
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// GetDB returns the global database connection
// This function provides access to the database connection throughout the application
func GetDB() *sql.DB {
	return DB
} 