package models

import (
	"time"
)

// User represents a user in the system
// This model contains all user-related information
type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username" validate:"required,min=3,max=50"`
	Email     string    `json:"email" db:"email" validate:"required,email"`
	Password  string    `json:"-" db:"password" validate:"required,min=6"` // "-" means this field won't be included in JSON responses
	FirstName string    `json:"first_name" db:"first_name" validate:"required"`
	LastName  string    `json:"last_name" db:"last_name" validate:"required"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// UserResponse represents the user data sent in API responses
// This excludes sensitive information like passwords
type UserResponse struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest represents the registration request payload
type RegisterRequest struct {
	Username  string `json:"username" validate:"required,min=3,max=50"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
}

// APIResponse represents a standard API response structure
// This provides consistent response formatting across all endpoints
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// PaginationRequest represents pagination parameters
type PaginationRequest struct {
	Page     int `json:"page" form:"page" validate:"min=1"`
	PageSize int `json:"page_size" form:"page_size" validate:"min=1,max=100"`
}

// PaginationResponse represents paginated response data
type PaginationResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalCount int         `json:"total_count"`
	TotalPages int         `json:"total_pages"`
} 