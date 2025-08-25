package models

type Itinerary struct {
	ID         int        `json:"id" db:"id"`
	Activities []Activity `json:"Activities" db:"Activities"`
	created_by User       `json:"created_by" db:"created_by"`
}
