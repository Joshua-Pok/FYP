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
	itineraryRepo   repository.ItineraryRepository
	activityHandler *ActivityHandler
}

type SynthesizeRecommendedItineraryRequest struct {
	UserID      int    `json:"user_id"`
	CategoryID  int    `json:"category_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartDate   string `json:"start_date"`
	NumDays     int    `json:"num_days"`
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

type ActivityResponse struct {
	Activity struct {
		ID        int     `json:"id"`
		Name      string  `json:"name"`
		Title     string  `json:"title"`
		Price     float64 `json:"price"`
		Address   string  `json:"address"`
		ImageURL  string  `json:"imageurl"`
		CountryID int     `json:"country_id"`
	} `json:"activity"`
	DayNumber  int     `json:"day_number"`
	StartTime  *string `json:"start_time"`
	EndTime    *string `json:"end_time"`
	OrderInDay *int    `json:"order_in_day"`
}

type DayResponse struct {
	DayNumber  int                `json:"day_number"`
	Date       string             `json:"date"`
	Activities []ActivityResponse `json:"activities"`
}

type ItineraryResponse struct {
	ID          int           `json:"id"`
	UserID      int           `json:"user_id"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	StartDate   string        `json:"start_date"`
	EndDate     string        `json:"end_date"`
	Days        []DayResponse `json:"days"`
}

func NewItineraryHandler(itineraryRepo repository.ItineraryRepository, activityHandler *ActivityHandler) *ItineraryHandler {

	return &ItineraryHandler{itineraryRepo: itineraryRepo, activityHandler: activityHandler}
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

func formatItineraryResponse(itinerary models.ItineraryWithDays) ItineraryResponse {
	response := ItineraryResponse{
		ID:          itinerary.Id,
		UserID:      itinerary.User_id,
		Title:       itinerary.Title,
		Description: itinerary.Description,
		StartDate:   itinerary.StartDate.Format("2006-01-02"),
		EndDate:     itinerary.EndDate.Format("2006-01-02"),
		Days:        make([]DayResponse, 0),
	}

	currentDate := itinerary.StartDate
	for _, day := range itinerary.Days {
		dayResponse := DayResponse{
			DayNumber:  day.DayNumber,
			Date:       currentDate.Format("2006-01-02"),
			Activities: make([]ActivityResponse, 0),
		}

		for _, awd := range day.Activities {
			actResp := ActivityResponse{
				DayNumber:  awd.DayNumber,
				OrderInDay: awd.OrderInDay,
			}
			actResp.Activity.ID = awd.Activity.ID
			actResp.Activity.Name = awd.Activity.Name
			actResp.Activity.Title = awd.Activity.Title
			actResp.Activity.Price = awd.Activity.Price
			actResp.Activity.Address = awd.Activity.Address
			actResp.Activity.ImageURL = awd.Activity.ImageURL
			actResp.Activity.CountryID = awd.Activity.CountryID

			if awd.StartTime != nil {
				startTimeStr := awd.StartTime.Format("15:04:05")
				actResp.StartTime = &startTimeStr
			}
			if awd.EndTime != nil {
				endTimeStr := awd.EndTime.Format("15:04:05")
				actResp.EndTime = &endTimeStr
			}

			dayResponse.Activities = append(dayResponse.Activities, actResp)
		}

		response.Days = append(response.Days, dayResponse)
		currentDate = currentDate.AddDate(0, 0, 1)
	}

	return response
}

func (h *ItineraryHandler) SynthesizeRecommendedItinerary(w http.ResponseWriter, r *http.Request) {
	var req SynthesizeRecommendedItineraryRequest

	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON format"})
		return
	}

	// Validate required fields
	if req.UserID == 0 || req.StartDate == "" || req.NumDays <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Missing required fields"})
		return
	}

	// Parse start date
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid start_date format"})
		return
	}

	endDate := startDate.AddDate(0, 0, req.NumDays-1)

	// Fetch activity recommendations from ActivityHandler
	totalActivitiesNeeded := req.NumDays * 3
	userIDStr := strconv.Itoa(req.UserID)
	categoryIDStr := strconv.Itoa(req.CategoryID)
	activities, err := h.activityHandler.GetRecommendationsForUser(userIDStr, categoryIDStr, totalActivitiesNeeded)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get recommendations"})
		return
	}

	// Build activities with day and time slots
	var activitiesWithDay []models.ActivityWithDay
	activityIndex := 0
	for day := 1; day <= req.NumDays; day++ {
		for orderInDay := 1; orderInDay <= 3; orderInDay++ {
			if activityIndex >= len(activities) {
				break
			}

			activity := activities[activityIndex]

			// Assign default times: Morning, Afternoon, Evening
			var startTime, endTime time.Time
			switch orderInDay {
			case 1: // Morning
				startTime, _ = time.Parse("15:04", "09:00")
				endTime, _ = time.Parse("15:04", "11:00")
			case 2: // Afternoon
				startTime, _ = time.Parse("15:04", "13:00")
				endTime, _ = time.Parse("15:04", "15:00")
			case 3: // Evening
				startTime, _ = time.Parse("15:04", "17:00")
				endTime, _ = time.Parse("15:04", "19:00")
			}

			awd := models.ActivityWithDay{
				Activity:   activity,
				DayNumber:  day,
				StartTime:  &startTime,
				EndTime:    &endTime,
				OrderInDay: &orderInDay,
			}
			activitiesWithDay = append(activitiesWithDay, awd)
			activityIndex++
		}
	}

	// Default title and description
	if req.Title == "" {
		req.Title = "AI-Generated Itinerary"
	}
	if req.Description == "" {
		req.Description = "Personalized itinerary based on your preferences"
	}

	// Create itinerary in repository
	itinerary, err := h.itineraryRepo.CreateItinerary(
		req.UserID,
		req.Title,
		req.Description,
		startDate,
		endDate,
		activitiesWithDay,
	)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create itinerary"})
		return
	}

	// Return response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Itinerary synthesized successfully",
		"data":    itinerary,
	})
}

// func (h *ItineraryHandler) GetItineraryWithDays(w http.ResponseWriter, r *http.Request) {
// 	itineraryIDstr := r.URL.Query().Get("itinerary_id")
// 	if itineraryIDstr == "" {
// 		http.Error(w, "Missing itinerary_id", http.StatusBadRequest)
// 		return
// 	}
//
// 	itineraryID, err := strconv.Atoi(itineraryIDstr)
// 	if err != nil {
// 		http.Error(w, "Invalid Itinerary_id parameter", http.StatusBadRequest)
// 		return
// 	}
//
// 	itinerary, err := h.itineraryRepo.GetItineraryWithDays(itineraryID)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch itinerary", http.StatusInternalServerError)
// 		return
// 	}
//
// 	response := formatItineraryResponse(itinerary)
//
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"success":   true,
// 		"itinerary": response,
// 	})
// }
