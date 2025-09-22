package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
)

type ItineraryHandler struct {
	itineraryRepo repository.ItineraryRepository
}

type CreateItineraryRequest struct {
	UserID     int               `json:"user_id"`
	Activities []models.Activity `json:"activities"`
}

func NewItineraryHandler(itineraryRepo repository.ItineraryRepository) *ItineraryHandler {
	return &ItineraryHandler{itineraryRepo: itineraryRepo}
}

func (h *ItineraryHandler) CreateItinerary(w http.ResponseWriter, r *http.Request) {
	var itinerary models.Itinerary
	var req CreateItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid json format"})
		return
	}

	itinerary, err := h.itineraryRepo.CreateItinerary(req.UserID, req.Activities)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create itinerary"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"messgae": "Itinerary created successfully",
		"data":    itinerary,
	})
}
