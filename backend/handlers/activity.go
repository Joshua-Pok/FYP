package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type ActivityHandler struct {
	activityRepo repository.ActivityRepository
	minioService *service.MinIOService
	gorseService *service.GorseService
	cacheService *service.CacheService
}

type CreateActivityRequest struct {
	Name      string `json:"name"`
	Title     string `json:"Title"`
	Price     int    `json:"price"`
	Address   string `json:"address"`
	ImageURL  string `json:"imageurl"`
	CountryID int    `json:"countryid"`
}

func NewActivityhandler(activityRepo repository.ActivityRepository, minioService *service.MinIOService, gorseService *service.GorseService, cacheService *service.CacheService) *ActivityHandler {
	return &ActivityHandler{activityRepo: activityRepo, minioService: minioService, gorseService: gorseService, cacheService: cacheService}
}

func (h *ActivityHandler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	log.Printf("Received request - Method: %s, Content-Type: %s", r.Method, r.Header.Get("Content-Type"))
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Could not parse multipart form", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	name := r.FormValue("name")
	title := r.FormValue("title")
	pricestr := r.FormValue("price")
	address := r.FormValue("address")
	countryIDStr := r.FormValue("countryid")
	price, _ := strconv.Atoi(pricestr)
	countryID, _ := strconv.Atoi(countryIDStr)

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Image Upload Failed", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	if ext == "" {
		ext = ".png"
	}

	objectName := fmt.Sprintf("activities/%s%s", name, ext)

	imageURL, err := h.minioService.UploadImage(objectName, file, fileHeader)
	if err != nil {
		http.Error(w, "Failed to upload image", http.StatusInternalServerError)
		return
	}
	activity, err := h.activityRepo.CreateActivity(name, title, price, address, countryID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create activity"})
		return
	}
	activity.ImageURL = imageURL
	_ = h.activityRepo.UpdateActivityImage(activity.ID, imageURL)
	labels := map[string]string{
		"name":    activity.Name,
		"title":   activity.Title,
		"price":   fmt.Sprintf("%.2f", activity.Price),
		"country": strconv.Itoa(activity.CountryID),
		"address": activity.Address,
	}
	if err := h.gorseService.AddItem(strconv.Itoa(activity.ID), labels); err != nil {
		log.Printf("warning failed to add activity to gorse: %v", err)
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

	activitiesWithDay, err := h.activityRepo.GetActivitiesByItineraryWSchedule(itineraryID)
	if err != nil {
		http.Error(w, "failed to fetch activities", http.StatusInternalServerError)
		return
	}
	// activities, err := h.activityRepo.GetActivitiesByItinerary(itineraryID)
	// if err != nil {
	// 	http.Error(w, "Failed to fetch activities", http.StatusInternalServerError)
	// 	return
	// }

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"itinerary":  itineraryID,
		"activities": activitiesWithDay,
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

func (h *ActivityHandler) GetRecommendedActivities(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	if userId == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	ids, err := h.gorseService.GetRecommendations(userId, 10)
	if err != nil {
		http.Error(w, "Failed to get recommendations", http.StatusInternalServerError)
		return
	}

	activities, err := h.activityRepo.GetActivitiesByIds(ids)
	if err != nil {
		http.Error(w, "failed to get activities", http.StatusInternalServerError)
		return
	}
	for i := range activities {
		url := h.minioService.GetPublicURL(activities[i].ImageURL)
		activities[i].ImageURL = url
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"user_id":    userId,
		"activities": activities,
	})
}

func (h *ActivityHandler) GetPopularActivities(w http.ResponseWriter, r *http.Request) {
	cacheKey := "popular_activities"
	var activities []models.Activity

	data, err := h.cacheService.Get(cacheKey)
	if err == nil && len(data) > 0 {
		if err := json.Unmarshal(data, &activities); err == nil {
			//cache exists, can return
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":    true,
				"activities": activities,
			})
			return
		}
	}

	ids, err := h.gorseService.GetPopularActivities(10)
	if err != nil {
		http.Error(w, "failed to get popular activities", http.StatusInternalServerError)
		return
	}
	activities, err = h.activityRepo.GetActivitiesByIds(ids)
	if err != nil {
		http.Error(w, "Failed to get activities", http.StatusInternalServerError)
		return
	}

	for i := range activities {
		url := h.minioService.GetPublicURL(activities[i].ImageURL)
		activities[i].ImageURL = url
	}

	cacheData, _ := json.Marshal(activities)
	_ = h.cacheService.Set(cacheKey, cacheData, 5*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"activities": activities,
	})

}

func (h *ActivityHandler) GetRecommededAcitivitiesByUserAndCountry(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")
	countryIdStr := r.URL.Query().Get("country_id")

	if userId == "" {
		http.Error(w, "missing user_id parameter", http.StatusBadRequest)
		return
	}

	if countryIdStr == "" {
		http.Error(w, "Missing country_id parameter", http.StatusBadRequest)
		return
	}

	countryId, err := strconv.Atoi(countryIdStr)
	if err != nil {
		http.Error(w, "invalid country_id parameter", http.StatusBadRequest)
		return
	}

	ids, err := h.gorseService.GetRecommendationsByUserAndCategory(userId, strconv.Itoa(countryId), 10)
	if err != nil {
		http.Error(w, "failed to get recommendations by country", http.StatusInternalServerError)
		return
	}

	activities, err := h.activityRepo.GetActivitiesByIds(ids)
	if err != nil {
		http.Error(w, "failed to get activities", http.StatusInternalServerError)
		return
	}

	for i := range activities {
		activities[i].ImageURL = h.minioService.GetPublicURL(activities[i].ImageURL)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"user_id":    userId,
		"country_id": countryId,
		"activities": activities,
	})

}

func (h *ActivityHandler) GetActivitiesByCountry(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	countryIDs, ok := query["country_id"]
	if !ok || len(countryIDs[0]) < 1 {
		http.Error(w, "country_id parameter is required", http.StatusBadRequest)
		return
	}

	countryID, err := strconv.Atoi(countryIDs[0])
	if err != nil {
		http.Error(w, "Invalid country ID", http.StatusBadRequest)
		return
	}

	activities, err := h.activityRepo.GetActivitiesByCountry(countryID)
	if err != nil {
		http.Error(w, "failed to get activities", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)

}

func (h *ActivityHandler) GetPopularActivities2(w http.ResponseWriter, r http.Request) {
	ids, err := h.gorseService.GetPopularActivities(10)
	if err != nil {
		http.Error(w, "failed to get popular activities from gorse", http.StatusInternalServerError)

	}
	activities, err := h.activityRepo.GetActivitiesByIds(ids)
	if err != nil {
		http.Error(w, "failed to get activities details", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}

func (h *ActivityHandler) ToggleLikeActivity(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	itemID := r.URL.Query().Get("activity_id")

	if userID == "" || itemID == "" {
		http.Error(w, "Missing user_id or Activity_id", http.StatusBadRequest)
		return
	}

	var body struct {
		Liked bool `json:"liked"`
	}

	var err error
	if body.Liked {
		err = h.gorseService.LikeActivity(userID, itemID)
	} else {
		err = h.gorseService.RemoveLikeActivity(userID, itemID)
	}

	if err != nil {
		http.Error(w, "failed to toggle like", http.StatusInternalServerError)
		return
	}

	action := "unliked"
	if body.Liked {
		action = "liked"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("activity successfully %s", action),
	})
}
