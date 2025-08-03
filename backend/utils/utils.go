package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword creates a bcrypt hash of the provided password
// This function should be used to hash passwords before storing them in the database
func HashPassword(password string) (string, error) {
	// Generate hash with cost factor of 12 (good balance between security and performance)
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword compares a password with its hash
// This function verifies if a provided password matches the stored hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateRandomString creates a random string of specified length
// This is useful for generating tokens, API keys, or other random identifiers
func GenerateRandomString(length int) (string, error) {
	bytes := make([]byte, length/2)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// LogError logs error messages with timestamp
// This provides consistent error logging throughout the application
func LogError(format string, args ...interface{}) {
	// In a real application, you might want to use a proper logging library
	// like logrus or zap for better log management
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	message := fmt.Sprintf(format, args...)
	fmt.Printf("[ERROR] %s: %s\n", timestamp, message)
}

// LogInfo logs info messages with timestamp
func LogInfo(format string, args ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	message := fmt.Sprintf(format, args...)
	fmt.Printf("[INFO] %s: %s\n", timestamp, message)
}

// ValidateEmail performs basic email validation
// This is a simple validation - consider using a more robust library for production
func ValidateEmail(email string) bool {
	// Basic email validation regex
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// SanitizeString removes potentially dangerous characters from strings
// This helps prevent injection attacks
func SanitizeString(input string) string {
	// Remove common dangerous characters
	dangerous := []string{"<", ">", "\"", "'", "&", "script", "javascript"}
	result := input
	
	for _, char := range dangerous {
		result = strings.ReplaceAll(result, char, "")
	}
	
	return strings.TrimSpace(result)
}

// FormatTime formats time in a consistent way
// This ensures all timestamps are formatted consistently across the application
func FormatTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// ParseTime parses time strings in the standard format
func ParseTime(timeStr string) (time.Time, error) {
	return time.Parse("2006-01-02 15:04:05", timeStr)
} 