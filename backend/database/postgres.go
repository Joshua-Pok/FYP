package database

import (
	"database/sql"
	"fmt"
	"github.com/Joshua-Pok/FYP-backend/config"
	_ "github.com/lib/pq"
)

func connectDB(cfg config.DatabaseConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s", cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName) //Sprintf formats the string to create a new string
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
