package repository

import (
	"database/sql"

	"github.com/Joshua-Pok/FYP-backend/models"
)

type PersonalityRepository struct {
	db *sql.DB
}

func NewPersonalityRepository(db *sql.DB) *PersonalityRepository {
	return &PersonalityRepository{db: db}
}

func (r *PersonalityRepository) CreatePersonality(p *models.Personality) error {
	query :=
		`INSERT INTO personality (user_id, openness, conscientiousness, extraversion, agreeableness, neuroticism) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	return r.db.QueryRow(
		query,
		p.User_id,
		p.Openness,
		p.Conscientiousness,
		p.Extraversion,
		p.Agreeableness,
		p.Neuroticism,
	).Scan(&p.Id)
}

func (r *PersonalityRepository) GetPersonalityByUser(userID int) (*models.Personality, error) {
	p := &models.Personality{}

	query := `
	SELECT id, user_id, openness, extraversion, conscientiousness, neuroticism, agreeableness FROM personality WHERE user_id = $1
	`

	err := r.db.QueryRow(query, userID).Scan(
		&p.Id,
		&p.User_id,
		&p.Openness,
		&p.Conscientiousness,
		&p.Extraversion,
		&p.Agreeableness,
		&p.Neuroticism,
	)
	if err != nil {
		return nil, err
	}
	return p, nil
}
