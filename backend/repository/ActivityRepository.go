package repository

import (
	"database/sql"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type ActivityRepository struct {
	db *sql.DB
}

func NewActivityRepository(db *sql.DB) *ActivityRepository {
	return &ActivityRepository{db: db}

}

func (r *ActivityRepository) CreateActivity(name, title string, price int, address string, image_url string, country_id int) (models.Activity, error) {
	var activity models.Activity

	query := `
	INSERT INTO activity (name, title, price, address, image_url, country_id) VALUES ($1, $2, $3, $4, $5) RETURNING id
	`
	err := r.db.QueryRow(query, name, title, price, address, image_url, country_id).Scan(
		&activity.ID,
		&activity.Name,
		&activity.Title,
		&activity.Price,
		&activity.ImageURL,
		&activity.CountryID,
	)
	if err != nil {
		return models.Activity{}, err
	}
	return activity, nil

}

func (r *ActivityRepository) GetActivitiesByItinerary(itineraryID int) ([]models.Activity, error) {

	query := `

	SELECT a.id, a.name, a.title, a.price, a.address, a.rating, a.imageurl, a.country_id
	FROM activity a
	JOIN itinerary_activity ia ON a.id = ia.activity_id
	WHERE ia.itinerary_id = $1
	`

	rows, err := r.db.Query(query, itineraryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var activities []models.Activity
	for rows.Next() {
		var a models.Activity
		if err := rows.Scan(
			&a.ID,
			&a.Name,
			&a.Title,
			&a.Price,
			&a.Address,
			&a.ImageURL,
			&a.CountryID,
		); err != nil {
			return nil, err

		}
		activities = append(activities, a)

	}
	return activities, rows.Err()
}
