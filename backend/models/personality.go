package models

type Personality struct {
	Openness          float64 `json:"openness" db:"openness"`
	Conscientiousness float64 `json:"conscientiousness" db:"conscientiousness"`
	Extraversion      float64 `json:"extraversion" db:"extraversion"`
	Agreeableness     float64 `json:"agreeableness" db:"agreeableness"`
	Neuroticism       float64 `json:"neuroticism" db:"neuroticism"`
}
