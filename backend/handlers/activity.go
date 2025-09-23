package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type ActivityHandler struct {
	activityRepo repository.ActivityRepository
	minioService *service.MinIOService
}

type CreateActivityRequest struct {
	Name      string `json:"name"`
	Title     string `json:"Title"`
	Price     int    `json:"price"`
	Address   string `json:"address"`
	ImageURL  string `json:"imageurl"`
	CountryID int    `json:"countryid"`
}

func NewActivityhandler(activityRepo repository.ActivityRepository, minioService *service.MinIOService) *ActivityHandler {
	return &ActivityHandler{activityRepo: activityRepo, minioService: minioService}
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

func (h *ActivityHandler) GetActivityById(w http.ResponseWriter, r *http.Request) {
	activityIDstr := r.URL.Query().Get("activity_id")
	if activityIDstr == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}
	activityID, err := strconv.Atoi(activityIDstr)
	if err != nil {
		http.Error(w, "failed to fetch activity", http.StatusInternalServerError)
		return
	}

	activity, err := h.activityRepo.GetActivityById(activityID)
	if err != nil {
		http.Error(w, "Activity with that id does not exist", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activity)
}
