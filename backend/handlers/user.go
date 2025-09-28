package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/auth"
	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type UserHandler struct {
	userRepo     repository.UserRepositoryInterface
	gorseService *service.GorseService
}

type CreateUserResponse struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}

func NewUserHandler(userRepo repository.UserRepositoryInterface) *UserHandler {
	return &UserHandler{userRepo: userRepo}
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

	labels := map[string]string{
		"personality": user.Personality,
	}

	if err := h.gorseService.AddUser(strconv.Itoa(user.ID), labels); err != nil {
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
