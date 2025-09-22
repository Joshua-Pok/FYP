package repository

import (
	"database/sql"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type ItineraryRepository struct {
	db *sql.DB
}

func NewItineraryRepository(db *sql.DB) *ItineraryRepository {
	return &ItineraryRepository{db: db}
}

// TODO : create itinerary need fixing
func (r *ItineraryRepository) CreateItinerary(userId int, activities []models.Activity) (models.Itinerary, error) {

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

	query := `INSERT INTO itinerary (user_id) VALUES ($1) RETURNING id`
	err = tx.QueryRow(query, userId).Scan(&itinerary.ID)
	if err != nil {
		return itinerary, err
	}
	itinerary.UserID = userId
	itinerary.ACtivities = activities

	stmt, err := tx.Prepare(`INSERT INTO itinerary_activity(itinerary_id, activity_id) VALUES ($1, $2)`)
	if err != nil {
		return itinerary, err
	}
	defer stmt.Close()

	for _, activity := range activities {
		if _, err := stmt.Exec(itinerary.ID, activity.ID); err != nil {
			return itinerary, err
		}
	}
	return itinerary, nil

}

func (r *ItineraryRepository) GetItinerariesByUser(userId int) ([]models.Itinerary, error) {
	query := `SELECT id, activities FROM itineraries WHERE user_id = $1`

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
