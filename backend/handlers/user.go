package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/Joshua-Pok/FYP-backend/auth"
	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type UserHandler struct {
	userRepo     repository.UserRepositoryInterface
	gorseService *service.GorseService
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type LoginResponse struct {
	Success bool         `json:"success"`
	Token   string       `json:"token,omitempty"`
	User    *models.User `json:"user,omitempty"`
	Message string       `json:"message,omitempty"`
}

type CreateUserResponse struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}

func parsePersonalityString(s interface{}) string {
	v := reflect.ValueOf(s)
	t := reflect.TypeOf(s)

	var parts []string

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)

		if !field.CanInterface() {
			continue
		}

		fieldValue := fmt.Sprintf("%v", field.Interface())

		parts = append(parts, fmt.Sprintf("%s:%s", fieldType.Name, fieldValue))
	}
	return strings.Join(parts, " ")
}

func NewUserHandler(userRepo repository.UserRepositoryInterface, gorseService *service.GorseService) *UserHandler {
	return &UserHandler{userRepo: userRepo, gorseService: gorseService}
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID parameter", http.StatusBadRequest)
		return
	}

	user, err := h.userRepo.GetUserById(id)
	if err != nil {
		http.Error(w, "User with that ID does not exist", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user) //converts user to json and writes it to response writer
}
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalide JSON", http.StatusBadRequest)
		return
	}

	hashedPassword, err := auth.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Failed to hash user password", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	token, err := auth.CreateToken(user.Email)
	if err != nil {
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	if err := h.userRepo.CreateUser(&user); err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	if err := h.gorseService.AddUser(user.UserName); err != nil {
		log.Printf("warning: failed to add user to gorse: %v", err)
	}

	response := CreateUserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Token: token,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.GetAllUsers()
	if err != nil {
		http.Error(w, "failed to get users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid JSON",
		})
		return
	}
	user, err := h.userRepo.GetUserByUsername(loginReq.Username)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid Credentials: repo fail",
		})
		return
	}
	// Verify password
	if !auth.VerifyPassword(loginReq.Password, user.Password) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid credentials: verify fail",
		})
		return
	}

	// Create token (you can still use email or switch to username)
	token, err := auth.CreateToken(user.UserName) // Changed to use username
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Failed to create token",
		})
		return
	}

	user.Password = ""

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(LoginResponse{
		Success: true,
		Token:   token,
		User:    user,
	})
}
