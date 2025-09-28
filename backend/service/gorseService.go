package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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

func (g *GorseService) AddItem(itemID string, labels map[string]string) error {
	data := map[string]interface{}{
		"item_id": itemID,
		"labels":  labels,
	}

	jsonData, err := json.Marshal(data)
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
	payload := map[string]any{
		"labels": labels,
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/user/%s", g.BaseURL, userId)
	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonBody))
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
