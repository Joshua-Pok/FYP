package repository

import "github.com/Joshua-Pok/FYP-backend/models"

type UserRepositoryInterface interface {
	GetUserById(id int) (*models.User, error)
	CreateUser(user *models.User) error
	GetAllUsers() ([]models.User, error)
	GetUserByUsername(username string) (*models.User, error)
}
