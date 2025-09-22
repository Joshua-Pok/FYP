package handlers

import (
	"encoding/json"
	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"net/http"
)

type PersonalityHandler struct {
	personalityRepo repository.PersonalityRepository
}

func NewPersonalityHandler(personalityRepo repository.PersonalityRepository) *PersonalityHandler {
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
