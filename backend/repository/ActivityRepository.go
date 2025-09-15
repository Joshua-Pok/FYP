package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type ActivityRepository struct {
	db *sql.DB
}

func NewActivityRepository(db *sql.DB) *ActivityRepository {
	return &ActivityRepository{db: db}
}

func (r *ActivityRepository) GetActivityByID(id int) (*models.Activity, error) {
	activity := &models.Activity{}
	query := `SELECT ID, country, address, price FROM activity WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&activity.ID, &activity.country, &activity.address, &activity.price)
	if err != nil {
		return nil, err
	}
	return activity, err

}

func (r *ActivityRepository) GetRecommendedActivities(Activities []string) ([]models.Activity, error) {
	if len(Activities) == 0 {
		return []models.Activity{}, nil
	}

	placeholders := make([]string, len(Activities)) //create array of placeholders
	args := make([]interface{}, len(Activities))    //create arra

	for i, id := range Activities {
		placeholders[i] = fmt.Sprintf("%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(
		`SELECT id, country, address, price
                 FROM activity
		 WHERE id IN (%s)
		`, strings.Join(placeholders, ","),
	)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	activities := []models.Activity{}
	for rows.Next() {
		var a models.Activity
		if err := rows.Scan(&a.ID, &a.Country, &a.address, &a.price); err != nil {
			return nil, err
		}

		return activities, nil
	}

}
