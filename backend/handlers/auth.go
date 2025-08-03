package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"backend/config"
	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/go-playground/validator/v10"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	db       *sql.DB
	validate *validator.Validate
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{
		db:       db,
		validate: validator.New(),
	}
}

// Register handles user registration
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	
	// Parse and validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}
	
	// Validate request data
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Validation failed: " + err.Error(),
		})
		return
	}
	
	// Check if user already exists
	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2)", 
		req.Username, req.Email).Scan(&exists)
	if err != nil {
		utils.LogError("Database error checking user existence: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	if exists {
		c.JSON(http.StatusConflict, models.APIResponse{
			Success: false,
			Error:   "User already exists",
		})
		return
	}
	
	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.LogError("Password hashing error: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	// Insert new user
	now := time.Now()
	var userID int
	err = h.db.QueryRow(`
		INSERT INTO users (username, email, password, first_name, last_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`, req.Username, req.Email, hashedPassword, req.FirstName, req.LastName, now, now).Scan(&userID)
	
	if err != nil {
		utils.LogError("Database error creating user: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	// Generate JWT token
	token, err := h.generateJWT(userID, req.Username)
	if err != nil {
		utils.LogError("JWT generation error: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "User registered successfully",
		Data: gin.H{
			"token": token,
			"user": models.UserResponse{
				ID:        userID,
				Username:  req.Username,
				Email:     req.Email,
				FirstName: req.FirstName,
				LastName:  req.LastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
		},
	})
}

// Login handles user authentication
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	
	// Parse and validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}
	
	// Validate request data
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Validation failed: " + err.Error(),
		})
		return
	}
	
	// Get user from database
	var user models.User
	err := h.db.QueryRow(`
		SELECT id, username, email, password, first_name, last_name, created_at, updated_at
		FROM users WHERE username = $1 OR email = $1
	`, req.Username).Scan(&user.ID, &user.Username, &user.Email, &user.Password, 
		&user.FirstName, &user.LastName, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Error:   "Invalid credentials",
			})
			return
		}
		utils.LogError("Database error during login: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	// Verify password
	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "Invalid credentials",
		})
		return
	}
	
	// Generate JWT token
	token, err := h.generateJWT(user.ID, user.Username)
	if err != nil {
		utils.LogError("JWT generation error: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Login successful",
		Data: gin.H{
			"token": token,
			"user": models.UserResponse{
				ID:        user.ID,
				Username:  user.Username,
				Email:     user.Email,
				FirstName: user.FirstName,
				LastName:  user.LastName,
				CreatedAt: user.CreatedAt,
				UpdatedAt: user.UpdatedAt,
			},
		},
	})
}

// generateJWT creates a JWT token for the user
func (h *AuthHandler) generateJWT(userID int, username string) (string, error) {
	// Create claims
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":      time.Now().Unix(),
	}
	
	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Sign token with secret
	return token.SignedString([]byte(config.GetJWTSecret()))
} 