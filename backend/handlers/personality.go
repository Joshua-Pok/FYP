package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type PersonalityHandler struct {
	personalityRepo *repository.PersonalityRepository
	gorseService    *service.GorseService
}

func NewPersonalityHandler(personalityRepo *repository.PersonalityRepository, gorseService *service.GorseService) *PersonalityHandler {

	return &PersonalityHandler{personalityRepo: personalityRepo, gorseService: gorseService}
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

	labels := map[string]string{
		"openness":          fmt.Sprintf("%.2f", personality.Openness),
		"conscientiousness": fmt.Sprintf("%.2f", personality.Conscientiousness),
		"extraversion":      fmt.Sprintf("%.2f", personality.Extraversion),
		"agreeableness":     fmt.Sprintf("%.2f", personality.Agreeableness),
		"neuroticism":       fmt.Sprintf("%.2f", personality.Neuroticism),
	}

	userIDstr := fmt.Sprintf("%d", personality.User_id)
	if err := h.gorseService.UpdateUserLabels(userIDstr, labels); err != nil {
		log.Printf("Warning: Failed to update labels for user %s: %v", userIDstr, err)
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
