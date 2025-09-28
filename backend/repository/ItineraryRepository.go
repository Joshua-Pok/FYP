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

func (r *ItineraryRepository) CreateItinerary(userId int, title, description string, startDate, endDate time.Time, activities []models.Activity) (models.Itinerary, error) {

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
	itinerary.Start_date = startDate
	itinerary.End_date = endDate
	itinerary.Activities = activities

	stmt, err := tx.Prepare(`INSERT INTO itinerary_activity(itinerary_id, activity_id) VALUES ($1, $2)`)
	if err != nil {
		return itinerary, err
	}
	defer stmt.Close()

	for _, activity := range activities {
		if _, err := stmt.Exec(itinerary.Id, activity.ID); err != nil {
			return itinerary, err
		}
	}
	return itinerary, nil

}

func (r *ItineraryRepository) GetItinerariesByUser(userId int) ([]models.Itinerary, error) {
	query := `SELECT id, title, description, start_date, end_date FROM itinerary WHERE user_id = $1`

	rows, err := r.db.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var itineraries []models.Itinerary
	for rows.Next() {
		var itinerary models.Itinerary
		if err := rows.Scan(&itinerary.Activities, &itinerary.Activities); err != nil {
			return nil, err
		}
		itineraries = append(itineraries, itinerary)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return itineraries, nil
}

func (r *ItineraryRepository) ModifyItinerary(id int, title string, description string, startDate string, endDate string, activities []models.Activity) (models.Itinerary, error) {
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

	query := `UPDATE itineraries SET title = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5
RETURNING id, user_id, title, description, start_date, end_date
	`

	err = tx.QueryRow(query, title, description, startDate, endDate, id).Scan(
		&itinerary.Id,
		&itinerary.User_id,
		&itinerary.Title,
		&itinerary.Description,
		&itinerary.Start_date,
		&itinerary.End_date,
	)
	if err != nil {
		return itinerary, err
	}

	// Update itinerary activities (optional: delete old ones first)
	_, err = tx.Exec(`DELETE FROM itinerary_activity WHERE itinerary_id = $1`, id)
	if err != nil {
		return itinerary, err
	}

	stmt, err := tx.Prepare(`INSERT INTO itinerary_activity(itinerary_id, activity_id) VALUES ($1, $2)`)
	if err != nil {
		return itinerary, err
	}
	defer stmt.Close()

	for _, activity := range activities {
		if _, err := stmt.Exec(itinerary.Id, activity.ID); err != nil {
			return itinerary, err
		}
	}
	itinerary.Activities = activities

	return itinerary, nil

}
