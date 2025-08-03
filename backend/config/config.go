package config

import (
	"os"

	"github.com/joho/godotenv"
)

// LoadEnv loads environment variables from .env file
// This function will load variables from a .env file in the current directory
func LoadEnv() error {
	return godotenv.Load()
}

// GetEnv retrieves an environment variable with a fallback default value
// This is useful for providing default values when environment variables are not set
func GetEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// Database configuration constants
const (
	// Database connection string format
	DBConnectionString = "postgres://%s:%s@%s:%s/%s?sslmode=disable"
	
	// Default database values
	DefaultDBHost     = "localhost"
	DefaultDBPort     = "5432"
	DefaultDBName     = "fyp_db"
	DefaultDBUser     = "postgres"
	DefaultDBPassword = "password"
)

// GetDatabaseConfig returns database configuration from environment variables
// This function centralizes all database-related configuration
func GetDatabaseConfig() (host, port, name, user, password string) {
	host = GetEnv("DB_HOST", DefaultDBHost)
	port = GetEnv("DB_PORT", DefaultDBPort)
	name = GetEnv("DB_NAME", DefaultDBName)
	user = GetEnv("DB_USER", DefaultDBUser)
	password = GetEnv("DB_PASSWORD", DefaultDBPassword)
	return
}

// JWT configuration
const (
	// JWT secret key for token signing
	JWTSecretKey = "JWT_SECRET"
	
	// Default JWT secret (should be overridden in production)
	DefaultJWTSecret = "your-secret-key-change-in-production"
)

// GetJWTSecret returns the JWT secret from environment variables
func GetJWTSecret() string {
	return GetEnv(JWTSecretKey, DefaultJWTSecret)
} 