package service

import (
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
