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
