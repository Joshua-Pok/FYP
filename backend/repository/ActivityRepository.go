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

func (r *ActivityRepository) GetActivityByID(id int) (*models.Activity, error) {
	activity := &models.Activity{}
	query := `SELECT ID, country, address, price FROM activity WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&activity.ID, &activity.country, &activity.address, &activity.price)
	if err != nil {
		return nil, err
	}
	return activity, err

}

func (r *ActivityRepository) GetRecommendedActivities(userID int) ([]models.Activity, error) {
	query := ``
}
