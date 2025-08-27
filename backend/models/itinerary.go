package models

import "time"

type Itinerary struct {
	id          int        `json:"id" db:"id"`
	user_id     int        `json:"user_id" db:"user_id"`
	title       string     `json: "title" db:"title"`
	description string     `json:"description" db:"description"`
	Activities  []Activity `json:"Activities" db:"Activities"`
	start_date  time.Time  `json: "start_date" db: "start_date"`
	end_date    time.Time  `json:"end_date" db: "end_date"`
	created_by  User       `json:"created_by" db:"created_by"`
}
