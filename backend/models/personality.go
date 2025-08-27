package models

type Personality struct {
	id                int     `json: "id" db: "id"`
	user_id           int     `json: "user_id" db:"user_id"`
	Openness          float64 `json:"openness" db:"openness"`
	Conscientiousness float64 `json:"conscientiousness" db:"conscientiousness"`
	Extraversion      float64 `json:"extraversion" db:"extraversion"`
	Agreeableness     float64 `json:"agreeableness" db:"agreeableness"`
	Neuroticism       float64 `json:"neuroticism" db:"neuroticism"`
}
