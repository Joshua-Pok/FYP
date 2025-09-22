package models

type User struct {
	ID          int         `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Email       string      `json:"email" db:"email"`
	Password    string      `json:"password" db:"password"`
	Personality Personality `json:"personality" db:"personality"`
}
