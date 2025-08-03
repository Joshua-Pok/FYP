package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db       *sql.DB
	validate *validator.Validate
}

// NewUserHandler creates a new UserHandler instance
func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{
		db:       db,
		validate: validator.New(),
	}
}

// GetProfile retrieves the current user's profile
// GET /api/users/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}
	
	// Get user from database
	var user models.User
	err := h.db.QueryRow(`
		SELECT id, username, email, first_name, last_name, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(&user.ID, &user.Username, &user.Email, &user.FirstName, 
		&user.LastName, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "User not found",
			})
			return
		}
		utils.LogError("Database error getting user profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	})
}

// UpdateProfile updates the current user's profile
// PUT /api/users/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}
	
	// Parse request body
	var req struct {
		FirstName string `json:"first_name" validate:"required"`
		LastName  string `json:"last_name" validate:"required"`
		Email     string `json:"email" validate:"required,email"`
	}
	
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
	
	// Check if email is already taken by another user
	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND id != $2)", 
		req.Email, userID).Scan(&exists)
	if err != nil {
		utils.LogError("Database error checking email uniqueness: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	if exists {
		c.JSON(http.StatusConflict, models.APIResponse{
			Success: false,
			Error:   "Email already taken",
		})
		return
	}
	
	// Update user profile
	now := time.Now()
	_, err = h.db.Exec(`
		UPDATE users 
		SET first_name = $1, last_name = $2, email = $3, updated_at = $4
		WHERE id = $5
	`, req.FirstName, req.LastName, req.Email, now, userID)
	
	if err != nil {
		utils.LogError("Database error updating user profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Profile updated successfully",
		Data: gin.H{
			"first_name": req.FirstName,
			"last_name":  req.LastName,
			"email":      req.Email,
			"updated_at": now,
		},
	})
}

// GetUserByID retrieves a user by ID (admin only)
// GET /api/users/:id
func (h *UserHandler) GetUserByID(c *gin.Context) {
	// Parse user ID from URL parameter
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid user ID",
		})
		return
	}
	
	// Get user from database
	var user models.User
	err = h.db.QueryRow(`
		SELECT id, username, email, first_name, last_name, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(&user.ID, &user.Username, &user.Email, &user.FirstName, 
		&user.LastName, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "User not found",
			})
			return
		}
		utils.LogError("Database error getting user by ID: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	})
}

// ListUsers retrieves a list of users with pagination
// GET /api/users
func (h *UserHandler) ListUsers(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	
	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	
	// Calculate offset
	offset := (page - 1) * pageSize
	
	// Get total count
	var totalCount int
	err := h.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalCount)
	if err != nil {
		utils.LogError("Database error counting users: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	
	// Get users with pagination
	rows, err := h.db.Query(`
		SELECT id, username, email, first_name, last_name, created_at, updated_at
		FROM users 
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, pageSize, offset)
	if err != nil {
		utils.LogError("Database error listing users: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}
	defer rows.Close()
	
	// Build response
	var users []models.UserResponse
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.FirstName, 
			&user.LastName, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			utils.LogError("Database error scanning user: %v", err)
			continue
		}
		
		users = append(users, models.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		})
	}
	
	// Calculate total pages
	totalPages := (totalCount + pageSize - 1) / pageSize
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.PaginationResponse{
			Data:       users,
			Page:       page,
			PageSize:   pageSize,
			TotalCount: totalCount,
			TotalPages: totalPages,
		},
	})
} 