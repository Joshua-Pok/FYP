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

type ActivityScheduleInput struct {
	ActivityID int     `json:"activity_id"`
	DayNumber  int     `json:"day_number"`
	StartTime  *string `json:"start_time"`
	EndTime    *string `json:"end_time"`
	OrderInDay *int    `json:"order_in_day"`
}

type CreateItineraryRequest struct {
	UserID      int                     `json:"user_id"`
	Title       string                  `json:"title"`
	Description string                  `json:"description"`
	StartDate   string                  `json:"start_date"`
	EndDate     string                  `json:"end_date"`
	Activities  []ActivityScheduleInput `json:"activities"`
}

type ModifyItineraryRequest struct {
	Id          int                     `json:"id"`
	Title       string                  `json:"title"`
	Description string                  `json:"description"`
	StartDate   string                  `json:"startDate"`
	EndDate     string                  `json:"endDate"`
	Activities  []ActivityScheduleInput `json:"activities"`
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

	var activitiesWithDay []models.ActivityWithDay
	for _, actInput := range req.Activities {
		awd := models.ActivityWithDay{
			Activity: models.Activity{
				ID: actInput.ActivityID,
			},
			DayNumber:  actInput.DayNumber,
			OrderInDay: actInput.OrderInDay,
		}

		if actInput.StartTime != nil && *actInput.StartTime != "" {
			startTime, err := time.Parse("15:04", *actInput.StartTime)
			if err == nil {
				awd.StartTime = &startTime
			}
		}
		if actInput.EndTime != nil && *actInput.EndTime != "" {
			endTime, err := time.Parse("15:04", *actInput.EndTime)
			if err == nil {
				awd.EndTime = &endTime
			}
		}

		activitiesWithDay = append(activitiesWithDay, awd)

	}

	itinerary, err := h.itineraryRepo.CreateItinerary(req.UserID, req.Title, req.Description, startDate, endDate, activitiesWithDay)
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

func (h *ItineraryHandler) ModifyItinerary(w http.ResponseWriter, r *http.Request) {
	var req ModifyItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid json format"})
		return
	}
	itineraryIDstr := r.URL.Query().Get("itinerary_id")
	itineraryID, err := strconv.Atoi(itineraryIDstr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	var activitiesWithDay []models.ActivityWithDay
	for _, actInput := range req.Activities {
		awd := models.ActivityWithDay{
			Activity: models.Activity{
				ID: actInput.ActivityID,
			},
			DayNumber:  actInput.DayNumber,
			OrderInDay: actInput.OrderInDay,
		}
		if actInput.StartTime != nil && *actInput.StartTime != "" {
			startTime, err := time.Parse("15:04", *actInput.StartTime)
			if err == nil {
				awd.StartTime = &startTime
			}
		}
		if actInput.EndTime != nil && *actInput.EndTime != "" {
			endTime, err := time.Parse("15:04", *actInput.EndTime)
			if err == nil {
				awd.EndTime = &endTime
			}
		}
		activitiesWithDay = append(activitiesWithDay, awd)
	}

	itinerary, err := h.itineraryRepo.ModifyItinerary(itineraryID, req.Title, req.Description, req.StartDate, req.EndDate, activitiesWithDay)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "itinerary updated successfully",
		"itinerary": itinerary,
	})
}
