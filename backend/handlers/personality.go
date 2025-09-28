package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
)

type PersonalityHandler struct {
	personalityRepo *repository.PersonalityRepository
}

func NewPersonalityHandler(personalityRepo *repository.PersonalityRepository) *PersonalityHandler {
	return &PersonalityHandler{personalityRepo: personalityRepo}
}

func (h *PersonalityHandler) CreatePersonality(w http.ResponseWriter, r *http.Request) {
	var personality models.Personality

	if err := json.NewDecoder(r.Body).Decode(&personality); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.personalityRepo.CreatePersonality(&personality); err != nil {
		http.Error(w, "Failed to create personality", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(personality); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}

}

func (h *PersonalityHandler) GetPersonalityByUserId(w http.ResponseWriter, r *http.Request) {
	userIDstr := r.URL.Query().Get("user_id")

	if userIDstr == "" {
		http.Error(w, "Missing user id", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(userIDstr)
	if err != nil {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}
	personality, err := h.personalityRepo.GetPersonalityByUser(userID)
	if err != nil {
		http.Error(w, "Personality not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(personality)
}
