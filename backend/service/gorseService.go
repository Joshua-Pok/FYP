package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type GorseService struct {
	BaseURL string
	Client  *http.Client
}

func NewGorseService(baseURL string) *GorseService {
	return &GorseService{
		BaseURL: baseURL,
		Client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

func (g *GorseService) GetRecommendations(userId string, limit int) ([]string, error) {
	url := fmt.Sprintf("%s/api/recommend/user/%s?number=%d", g.BaseURL, userId, limit)

	resp, err := g.Client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Error connecting to Gorse: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gorse returned %d", resp.StatusCode)
	}

	var ids []string
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, fmt.Errorf("failed to decode Gorse reponse %w", err)
	}
	return ids, nil
}

func (g *GorseService) GetPopularActivities(limit int) ([]string, error) {
	url := fmt.Sprintf("%s/api/item/popular?number=%d", g.BaseURL, limit)

	resp, err := g.Client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Error retrieving popular items from gorse %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gorse returned status %d", resp.StatusCode)
	}

	var ids []string
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, fmt.Errorf("failed to decode popular items from response")
	}

	return ids, nil
}

func (g *GorseService) AddUser(username string) error {
	payload := map[string]any{
		"UserId": username,
	}
	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/user", g.BaseURL)
	resp, err := g.Client.Post(url, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to add user to gorse: %w", err)

	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse Returned status %d", resp.StatusCode)
	}

	return nil
}

func (g *GorseService) AddPersonality(UserId string, Personality models.Personality) error {
	labels := []string{
		fmt.Sprintf("Openness:%.2f", Personality.Openness),
		fmt.Sprintf("Conscientiousness:%.2f", Personality.Conscientiousness),
		fmt.Sprintf("Extraversion:%.2f", Personality.Extraversion),
		fmt.Sprintf("Agreeableness:%.2f", Personality.Agreeableness),
		fmt.Sprintf("Neuroticism:%.2f", Personality.Neuroticism),
	}

	body := map[string]interface{}{
		"Labels": labels,
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}
	url := fmt.Sprintf("%s/api/user/%s", g.BaseURL, UserId)
	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		fmt.Errorf("Failed to create personality update request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to update user personality in Gorse: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse returned status %d", resp.StatusCode)

	}

	return nil
}

func (g *GorseService) AddItem(itemID string, labels map[string]string) error {
	var categories []string

	flatLabels := make([]string, 0, len(labels))
	for k, v := range labels {
		if k == "country" {
			categories = append(categories, v)
			continue
		}
		flatLabels = append(flatLabels, fmt.Sprintf("%s:%s", k, v))
	}

	data := map[string]interface{}{
		"ItemId":     itemID,
		"Categories": categories,
		"Labels":     flatLabels,
	}

	// 🔍 Add full debug logs
	log.Printf("[Gorse Debug] Preparing to send item to Gorse")
	log.Printf("[Gorse Debug] ItemId: %s", itemID)
	log.Printf("[Gorse Debug] Categories: %+v", categories)
	log.Printf("[Gorse Debug] Labels: %+v", flatLabels)
	jsonData, err := json.Marshal(data)
	log.Printf("sending to gorse: %s", string(jsonData))
	if err != nil {
		return fmt.Errorf("failed to marshal item data: %w", err)
	}

	url := fmt.Sprintf("%s/api/item", g.BaseURL)
	resp, err := g.Client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to add item: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse return status %d", resp.StatusCode)
	}
	return nil
}

func (g *GorseService) UpdateUserLabels(userId string, labels map[string]string) error {

	flatLabels := make([]string, 0, len(labels))

	for k, v := range labels {
		flatLabels = append(flatLabels, fmt.Sprintf("%s:%s", k, v))
	}
	payload := map[string]any{
		"Comment":   "",
		"labels":    flatLabels,
		"Subscribe": []string{},
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/user/%s", g.BaseURL, userId)
	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to update user labels in Gorse: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse returned status %d", resp.StatusCode)
	}
	return nil
}

func (g *GorseService) GetRecommendationsByUserAndCategory(userId string, category string, limit int) ([]string, error) {
	url := fmt.Sprintf("%s/api/recommend/%s/%s?number=%d", g.BaseURL, userId, category, limit)

	resp, err := g.Client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("error connecting to gorse %w", err)

	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gorse Returning status %d", resp.StatusCode)
	}

	var ids []string

	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, fmt.Errorf("failed to decode Gorse response: %w", err)
	}

	return ids, nil
}

func (g *GorseService) LikeActivity(userID string, itemID string) error {
	payload := []map[string]interface{}{
		{
			"Comment":      "",
			"FeedbackType": "like",
			"ItemId":       itemID,
			"UserId":       userID,
		},
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("Failed to marshal feedback payload: %w", err)
	}

	url := fmt.Sprintf("%s/api/feedback", g.BaseURL)

	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("Failed to create feedback requst : %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := g.Client.Do(req)

	if err != nil {
		return fmt.Errorf("Failed to send feedback to gorse: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse Returned status %d", resp.StatusCode)
	}

	return nil
}

func (g *GorseService) RemoveLikeActivity(userID string, itemID string) error {
	url := fmt.Sprintf("%s/api/feedback/%s/%s", g.BaseURL, userID, itemID)
	req, err := http.NewRequest(http.MethodDelete, url, nil)

	if err != nil {
		return fmt.Errorf("failed to create delete request: %w", err)
	}

	resp, err := g.Client.Do(req)
	if err != nil {
		return fmt.Errorf("Failed to send delete request to Gorse: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Gorse returned status %d", resp.StatusCode)
	}
	return nil
}
