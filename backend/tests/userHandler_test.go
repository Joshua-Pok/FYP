package tests

import (
	"errors"
	"testing"

	"github.com/Joshua-Pok/FYP-backend/handlers"
	"github.com/Joshua-Pok/FYP-backend/models"
)

type MockUserRepository struct {
	users map[int]*models.User
	err   error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users: make(map[int]*models.User),
	}
}

func (m *MockUserRepository) CreateUser(user models.User) error {
	m.users[user.ID] = &user
	return nil
}

func (m *MockUserRepository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	for _, user := range m.users {
		users = append(users, *user)
	}

	return users, nil
}

func (m *MockUserRepository) GetUserById(id int) (*models.User, error) {
	if m.err != nil {
		return nil, m.err
	}

	user, exists := m.users[id]
	if !exists {
		return nil, errors.New("user not found")
	}

	return user, nil
}

func (m *MockUserRepository) AddUser(user *models.User) {
	m.users[user.ID] = user
}

func TestUserHandler_GetUser(t *testing.T) {
	mockRepo := NewMockUserRepository()
	expectedUser := &models.User{
		ID:    1,
		Name:  "Joshua Pok",
		Email: "official.joshuapok@gmail.com",
	}

	mockRepo.AddUser(expectedUser)

	handler := handlers.NewUserHandler(mockRepo)
}
