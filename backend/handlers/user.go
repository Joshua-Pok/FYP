package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/repository"
)

type UserHandler struct {
	userRepo repository.UserRepositoryInterface
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
