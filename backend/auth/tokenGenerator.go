package auth

import (
	"fmt"
	"log"
)

func GenerateTestToken(username string) string {
	token, err := CreateToken(username)
	if err != nil {
		log.Fatalf("Failed to create token: %v", err)
	}
	fmt.Println("Generated JWT token:")
	fmt.Println(token)
	return token
}
