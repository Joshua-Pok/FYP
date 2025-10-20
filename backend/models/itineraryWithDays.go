package models

import "time"

type ItineraryWithDays struct {
	Id          int
	User_id     int
	Title       string
	Description string
	StartDate   time.Time
	EndDate     time.Time
	Days        []ItineraryDay
}
