package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Id       int
	Username string
	password string
}
