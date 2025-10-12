package repository

import (
	"database/sql"
	"log"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type CountryRepository struct {
	db *sql.DB
}

func NewCountryRepository(db *sql.DB) *CountryRepository {
	return &CountryRepository{db: db}
}

func (r *CountryRepository) CreateCountry(name string) (models.Country, error) {

	var country models.Country
	query := `INSERT into country(name) VALUES ($1) RETURNING id, name`

	err := r.db.QueryRow(query, name).Scan(
		&country.ID,
		&country.Name,
	)
	if err != nil {
		log.Printf("CreateCountryError: %v", err)
		return models.Country{}, err
	}

	return country, nil
}

func (r *CountryRepository) GetAllCountries() ([]models.Country, error) {
	query := `SELECT id, name FROM country ORDER BY name ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Printf("Error retrieving countries: %v", err)
		return nil, err
	}
	defer rows.Close()

	var countries []models.Country
	for rows.Next() {
		var c models.Country
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			log.Printf("error scanning country: %v", err)
			return nil, err
		}
		countries = append(countries, c)
	}
	if err = rows.Err(); err != nil {
		log.Printf("Row iteration error: %v", err)
		return nil, err
	}
	return countries, nil
}
