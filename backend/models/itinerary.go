package models

import "time"

type Itinerary struct {
	Id          int        `json:"id" db:"id"`
	User_id     int        `json:"user_id" db:"user_id"`
	Title       string     `json:"title" db:"Title"`
	Description string     `json:"description" db:"description"`
	Activities  []Activity `json:"Activities" db:"Activities"`
	Start_date  time.Time  `json:"start_date" db:"start_date"`
	End_date    time.Time  `json:"end_date" db:"end_date"`
	Created_by  User       `json:"created_by" db:"created_by"`
}
