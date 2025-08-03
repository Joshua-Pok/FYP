package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"backend/config"
	"backend/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates JWT tokens and extracts user information
// This middleware should be applied to protected routes
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Check if the header starts with "Bearer "
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Parse and validate the JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(config.GetJWTSecret()), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract claims from the token
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Set user ID in the context for use in handlers
			if userID, exists := claims["user_id"]; exists {
				c.Set("user_id", int(userID.(float64)))
			}
			if username, exists := claims["username"]; exists {
				c.Set("username", username.(string))
			}
		}

		c.Next()
	}
}

// CORSMiddleware configures CORS settings for the API
// This allows frontend applications to make requests to the backend
func CORSMiddleware() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"}, // Add your frontend URLs
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	})
}

// LoggerMiddleware logs HTTP requests
// This middleware provides request logging for debugging and monitoring
func LoggerMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Custom log format
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format("2006-01-02 15:04:05"),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// RateLimitMiddleware implements basic rate limiting
// This prevents abuse by limiting requests per IP address
func RateLimitMiddleware() gin.HandlerFunc {
	// Simple in-memory rate limiter (use Redis for production)
	rateLimit := make(map[string]int)
	
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		
		// Check if client has exceeded rate limit
		if rateLimit[clientIP] > 100 { // 100 requests per minute
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}
		
		// Increment request count
		rateLimit[clientIP]++
		
		c.Next()
	}
}

// ErrorHandlerMiddleware catches panics and returns proper error responses
// This ensures the application doesn't crash on unexpected errors
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error
				utils.LogError("Panic recovered: %v", err)
				
				// Return internal server error
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
				c.Abort()
			}
		}()
		
		c.Next()
	}
} 