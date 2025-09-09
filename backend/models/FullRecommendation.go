type FullRecommendation struct{
	ActivityID int 'json:"activity_id"'
	Score float64 `json:"score"`
	Name string `json: "name"`
	Description string `json:"description"`
	Location string `json: "location"`
	Images []string `json:"images"`
	Videos []string `json:"videos"`
}
