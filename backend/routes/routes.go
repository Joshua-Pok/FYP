package routes

import (
	"database/sql"

	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all routes and middleware for the application
// This function sets up the router with all necessary middleware and route handlers
func SetupRoutes(db *sql.DB) *gin.Engine {
	// Create a new Gin router
	router := gin.New()
	
	// Apply global middleware
	router.Use(middleware.ErrorHandlerMiddleware()) // Catch panics
	router.Use(middleware.LoggerMiddleware())       // Log requests
	router.Use(middleware.CORSMiddleware())         // Handle CORS
	router.Use(middleware.RateLimitMiddleware())    // Rate limiting
	
	// Create handler instances
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)
	
	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})
	
	// API routes group
	api := router.Group("/api")
	{
		// Authentication routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register) // Register new user
			auth.POST("/login", authHandler.Login)       // User login
		}
		
		// Protected routes (require authentication)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware()) // Apply authentication middleware
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/profile", userHandler.GetProfile)     // Get current user profile
				users.PUT("/profile", userHandler.UpdateProfile)  // Update current user profile
				users.GET("/:id", userHandler.GetUserByID)        // Get user by ID
				users.GET("", userHandler.ListUsers)              // List all users (with pagination)
			}
			
			// Add more protected route groups here as needed
			// Example:
			// posts := protected.Group("/posts")
			// {
			//     posts.GET("", postHandler.ListPosts)
			//     posts.POST("", postHandler.CreatePost)
			//     posts.GET("/:id", postHandler.GetPost)
			//     posts.PUT("/:id", postHandler.UpdatePost)
			//     posts.DELETE("/:id", postHandler.DeletePost)
			// }
		}
	}
	
	// Handle 404 errors
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{
			"error": "Route not found",
		})
	})
	
	return router
} 