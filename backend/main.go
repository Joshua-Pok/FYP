package main

import (
	"log"
	"os"

	"backend/config"
	"backend/routes"
	"backend/database"
)

func main() {
	// Load environment variables from .env file
	if err := config.LoadEnv(); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Initialize database connection
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize and start the server
	router := routes.SetupRoutes(db)
	
	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
} 