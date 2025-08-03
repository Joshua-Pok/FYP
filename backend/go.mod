module backend

go 1.21

require (
	// Web framework for building APIs
	github.com/gin-gonic/gin v1.9.1
	
	// Database driver for PostgreSQL
	github.com/lib/pq v1.10.9
	
	// Environment variable management
	github.com/joho/godotenv v1.4.0
	
	// JWT token handling
	github.com/golang-jwt/jwt/v5 v5.0.0
	
	// Password hashing
	golang.org/x/crypto v0.14.0
	
	// CORS middleware
	github.com/gin-contrib/cors v1.4.0
	
	// Input validation
	github.com/go-playground/validator/v10 v10.15.5
	
	// Logging
	github.com/sirupsen/logrus v1.9.3
) 