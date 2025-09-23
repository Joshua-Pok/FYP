package handlers

import (
	"encoding/json"
	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"net/http"
	"strconv"
	"time"
)

type ItineraryHandler struct {
	itineraryRepo repository.ItineraryRepository
}

type CreateItineraryRequest struct {
	UserID      int               `json:"user_id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	StartDate   string            `json:"start_date"`
	EndDate     string            `json:"end_date"`
	Activities  []models.Activity `json:"activities"`
}

func NewItineraryHandler(itineraryRepo repository.ItineraryRepository) *ItineraryHandler {
	return &ItineraryHandler{itineraryRepo: itineraryRepo}
}

func (h *ItineraryHandler) CreateItinerary(w http.ResponseWriter, r *http.Request) {
	var req CreateItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid json format"})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid start_date format"})
		return
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid end_date format"})
		return
	}

	itinerary, err := h.itineraryRepo.CreateItinerary(req.UserID, req.Title, req.Description, startDate, endDate, req.Activities)
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

func (h *ItineraryHandler) GetItinerariesByUser(w http.ResponseWriter, r *http.Request) {
	userIDstr := r.URL.Query().Get("user_id")
	userID, err := strconv.Atoi(userIDstr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}
	itineraries, err := h.itineraryRepo.GetItinerariesByUser(userID)
	if err != nil {
		http.Error(w, "failed to get itineraries", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(itineraries)
}
