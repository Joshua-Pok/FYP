package auth

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

// generates a hash for password, 14 refers to the hash factor
func HashPassword(password string) (string error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// verifies if given password matches stored hash
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Errorf("Error comparing passwords")
	}

	return true
}
