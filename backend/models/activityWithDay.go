package models

import "time"

type ActivityWithDay struct {
	Activity   Activity
	DayNumber  int
	StartTime  *time.Time
	EndTime    *time.Time
	OrderInDay *int
}
