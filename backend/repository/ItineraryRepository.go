package repository

import (
	"database/sql"
	"time"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type ItineraryRepository struct {
	db *sql.DB
}

func NewItineraryRepository(db *sql.DB) *ItineraryRepository {
	return &ItineraryRepository{db: db}
}

func (r *ItineraryRepository) CreateItinerary(userId int, title, description string, startDate, endDate time.Time, activities []models.ActivityWithDay) (models.Itinerary, error) {

	var itinerary models.Itinerary

	tx, err := r.db.Begin()
	if err != nil {
		return itinerary, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	query := `INSERT INTO itinerary (user_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	err = tx.QueryRow(query, userId, title, description, startDate, endDate).Scan(&itinerary.Id)
	if err != nil {
		return itinerary, err
	}
	itinerary.User_id = userId
	itinerary.Title = title
	itinerary.Description = description
	itinerary.StartDate = startDate
	itinerary.EndDate = endDate

	stmt, err := tx.Prepare(`INSERT INTO itinerary_activity(itinerary_id, activity_id, day_number, start_time, end_time, order_in_day) VALUES ($1, $2, $3, $4, $5, $6)`)
	if err != nil {
		return itinerary, err
	}
	defer stmt.Close()

	for _, activityWithDay := range activities {
		if _, err := stmt.Exec(
			itinerary.Id,
			activityWithDay.Activity.ID,
			activityWithDay.DayNumber,
			activityWithDay.StartTime,
			activityWithDay.EndTime,
			activityWithDay.OrderInDay,
		); err != nil {
			return itinerary, err
		}
	}
	itinerary.ActivitiesWithDay = activities
	return itinerary, nil

}

func (r *ItineraryRepository) GetItinerariesByUser(userId int) ([]models.Itinerary, error) {
	query := `SELECT id, user_id, title, description, start_date, end_date FROM itinerary WHERE user_id = $1`

	rows, err := r.db.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var itineraries []models.Itinerary
	for rows.Next() {
		var itinerary models.Itinerary
		if err := rows.Scan(&itinerary.Id, &itinerary.User_id, &itinerary.Title, &itinerary.Description, &itinerary.StartDate, &itinerary.EndDate); err != nil {
			return nil, err
		}

		activityQuery := `SELECT 
                a.id, a.name, a.title, a.price, a.address, a.imageurl, a.country_id,
                ia.day_number, ia.start_time, ia.end_time, ia.order_in_day
            FROM activity a 
            JOIN itinerary_activity ia ON a.id = ia.activity_id 
            WHERE ia.itinerary_id = $1
            ORDER BY ia.day_number, ia.order_in_day NULLS LAST, ia.start_time NULLS LAST`
		actRows, err := r.db.Query(activityQuery, itinerary.Id)
		if err != nil {
			return nil, err
		}
		var activitiesWithDay []models.ActivityWithDay
		for actRows.Next() {
			var awd models.ActivityWithDay
			if err := actRows.Scan(
				&awd.Activity.ID,
				&awd.Activity.Name,
				&awd.Activity.Title,
				&awd.Activity.Price,
				&awd.Activity.Address,
				&awd.Activity.ImageURL,
				&awd.Activity.CountryID,
				&awd.DayNumber,
				&awd.StartTime,
				&awd.EndTime,
				&awd.OrderInDay,
			); err != nil {
				actRows.Close()
				return nil, err
			}
			activitiesWithDay = append(activitiesWithDay, awd)
		}
		actRows.Close()
		itinerary.ActivitiesWithDay = activitiesWithDay
		itineraries = append(itineraries, itinerary)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return itineraries, nil
}

func (r *ItineraryRepository) ModifyItinerary(id int, title string, description string, startDate string, endDate string, activities []models.ActivityWithDay) (models.Itinerary, error) {
	var itinerary models.Itinerary

	tx, err := r.db.Begin()
	if err != nil {
		return itinerary, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	query := `UPDATE itinerary SET title = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5
RETURNING id, user_id, title, description, start_date, end_date
	`

	err = tx.QueryRow(query, title, description, startDate, endDate, id).Scan(
		&itinerary.Id,
		&itinerary.User_id,
		&itinerary.Title,
		&itinerary.Description,
		&itinerary.StartDate,
		&itinerary.EndDate,
	)
	if err != nil {
		return itinerary, err
	}

	// Update itinerary activities (optional: delete old ones first)
	_, err = tx.Exec(`DELETE FROM itinerary_activity WHERE itinerary_id = $1`, id)
	if err != nil {
		return itinerary, err
	}

	stmt, err := tx.Prepare(`INSERT INTO itinerary_activity(itinerary_id, activity_id, day_number, start_time, end_time, order_in_day) VALUES ($1, $2, $3, $4, $5,$6)`)
	if err != nil {
		return itinerary, err
	}
	defer stmt.Close()

	for _, activityWithDay := range activities {
		if _, err := stmt.Exec(itinerary.Id, activityWithDay.Activity.ID, activityWithDay.DayNumber, activityWithDay.StartTime, activityWithDay.EndTime, activityWithDay.OrderInDay); err != nil {
			return itinerary, err
		}
	}
	itinerary.ActivitiesWithDay = activities

	return itinerary, nil

}
