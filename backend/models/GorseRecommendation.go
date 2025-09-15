type GorseRecommendation struct {
	ItemId string  `json:"id" db:"id"`
	Score  float64 `json: "Score"`
}
