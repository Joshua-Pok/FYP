package repository

import (
	"database/sql"
	"log"
	"sort"

	"github.com/Joshua-Pok/FYP-backend/models"
	"github.com/lib/pq"
)

type ActivityRepository struct {
	db *sql.DB
}

func NewActivityRepository(db *sql.DB) *ActivityRepository {
	return &ActivityRepository{db: db}

}

func (r *ActivityRepository) CreateActivity(name, title string, price int, address string, country_id int) (models.Activity, error) {
	var activity models.Activity

	query := `
	INSERT INTO activity (name, title, price, address, imageurl, country_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, title, price, address, imageurl, country_id
	`
	err := r.db.QueryRow(query, name, title, price, address, "", country_id).Scan(
		&activity.ID,
		&activity.Name,
		&activity.Title,
		&activity.Price,
		&activity.Address,
		&activity.ImageURL,
		&activity.CountryID,
	)
	if err != nil {
		log.Printf("CreateActivityerror : %v", err)
		return models.Activity{}, err
	}
	return activity, nil

}

func (r *ActivityRepository) GetActivityById(activityID int) (*models.Activity, error) {
	activity := &models.Activity{}
	query := `SELECT name, title, price, address, imageurl, country_id FROM activity WHERE id = $1`

	err := r.db.QueryRow(query, activityID).Scan(
		&activity.ID,
		&activity.Name,
		&activity.Title,
		&activity.Price,
		&activity.Address,
		&activity.ImageURL,
		&activity.CountryID,
	)
	if err != nil {
		return nil, err

	}
	return activity, nil
}

func (r *ActivityRepository) GetActivitiesByIds(ids []string) ([]models.Activity, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	query := `SELECT id, name, title, price, address, imageurl, country_id FROM activity WHERE id = ANY($1)`
	rows, err := r.db.Query(query, pq.Array(ids))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []models.Activity
	for rows.Next() {
		var a models.Activity
		if err := rows.Scan(&a.ID, &a.Name, &a.Title, &a.Price, &a.Address, &a.ImageURL, &a.CountryID); err != nil {
			return nil, err
		}
		activities = append(activities, a)
	}
	return activities, nil
}

func (r *ActivityRepository) GetActivitiesByItinerary(itineraryID int) ([]models.ItineraryDay, error) {
	query := `
		SELECT 
			a.id, a.name, a.title, a.price, a.address, a.imageurl, a.country_id,
			ia.day_number, ia.start_time, ia.end_time, ia.order_in_day
		FROM activity a
		JOIN itinerary_activity ia ON a.id = ia.activity_id
		WHERE ia.itinerary_id = $1
		ORDER BY ia.day_number, ia.start_time NULLS LAST, ia.order_in_day NULLS LAST
	`

	rows, err := r.db.Query(query, itineraryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	dayMap := make(map[int][]models.ActivityWithDay)

	for rows.Next() {
		var awd models.ActivityWithDay
		if err := rows.Scan(
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
			return nil, err
		}

		dayMap[awd.DayNumber] = append(dayMap[awd.DayNumber], awd)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Convert map to a sorted slice
	var itineraryDays []models.ItineraryDay
	for day, activities := range dayMap {
		itineraryDays = append(itineraryDays, models.ItineraryDay{
			DayNumber:  day,
			Activities: activities,
		})
	}

	// Sort by day number (in case map iteration order varies)
	sort.Slice(itineraryDays, func(i, j int) bool {
		return itineraryDays[i].DayNumber < itineraryDays[j].DayNumber
	})

	return itineraryDays, nil
}

func (r *ActivityRepository) UpdateActivityImage(activityID int, imageURL string) error {
	query := `UPDATE activity SET imageurl = $1 WHERE id = $2`
	_, err := r.db.Exec(query, imageURL, activityID)
	return err
}

func (r *ActivityRepository) GetActivitiesByCountry(countryID int) ([]models.Activity, error) {
	query := `SELECT id, name, title, price, address, imageurl, country_id FROM activity WHERE country_id = $1`

	rows, err := r.db.Query(query, countryID)
	if err != nil {
		log.Printf("Error getting activities by country : %v", err)
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
			log.Printf("Error scanning activity: %v", err)
			return nil, err
		}
		activities = append(activities, a)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Row Iteration error: %v", err)
		return nil, err
	}

	return activities, nil
}

func (r *ActivityRepository) GetActivitiesByItineraryWSchedule(itineraryID int) ([]models.ActivityWithDay, error) {
	query := `SELECT 
        a.id, a.name, a.title, a.price, a.address, a.imageurl, a.country_id,
        ia.day_number, ia.start_time, ia.end_time, ia.order_in_day
    FROM activity a
    JOIN itinerary_activity ia ON a.id = ia.activity_id
    WHERE ia.itinerary_id = $1
    ORDER BY ia.day_number, ia.order_in_day NULLS LAST, ia.start_time NULLS LAST`

	rows, err := r.db.Query(query, itineraryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activitiesWithDay []models.ActivityWithDay
	for rows.Next() {
		var awd models.ActivityWithDay
		err := rows.Scan(
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
		)
		if err != nil {
			return nil, err
		}
		activitiesWithDay = append(activitiesWithDay, awd)
	}
	return activitiesWithDay, rows.Err()
}
