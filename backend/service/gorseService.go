package service

import (
	"net/http"
	"time"
)

func getRecommendedItems(userId, limit, category, offset string) (activities []Activity, error) {
	url := fmt.Sprintf("%s/api/recommend/%s", gorseBaseURL, userId)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("gorse request failed: %v", err)
	}

	client := http.Client{Timeout: 10 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gorse request failed %v", err)
	}

	defer response.Body.Close()

	if response.StatusCode == http.StatusNotFound {
		return []Activity{}, nil
	}
}
