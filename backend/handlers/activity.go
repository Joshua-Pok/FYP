package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/repository"
)

type ActivityHandler struct {
	activityRepo repository.ActivityRepository
}

type CreateActivityRequest struct {
	Name      string `json:"name"`
	Title     string `json:"Title"`
	Price     int    `json:"price"`
	Address   string `json:"address"`
	ImageURL  string `json:"imageurl"`
	CountryID int    `json:"countryid"`
}

func NewActivityhandler(activityRepo repository.ActivityRepository) *ActivityHandler {
	return &ActivityHandler{activityRepo: activityRepo}
}

func (h *ActivityHandler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	var req CreateActivityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid activity format"})
		return
	}
	activity, err := h.activityRepo.CreateActivity(req.Name, req.Title, req.Price, req.Address, req.ImageURL, req.CountryID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create activity"})
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Activity created",
		"data":    activity,
	})
}

func (h *ActivityHandler) GetActivitiesByItinerary(w http.ResponseWriter, r *http.Request) {
	itineraryIDstr := r.URL.Query().Get("itinerary_id")
	if itineraryIDstr == "" {
		http.Error(w, "Missingitinerary", http.StatusBadRequest)
		return
	}
	itineraryID, err := strconv.Atoi(itineraryIDstr)
	if err != nil {
		http.Error(w, "Invalid itinerary_id parameter", http.StatusBadRequest)
		return
	}
	activities, err := h.activityRepo.GetActivitiesByItinerary(itineraryID)
	if err != nil {
		http.Error(w, "Failed to fetch activities", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"itinerary":  itineraryID,
		"activities": activities,
	})
}
