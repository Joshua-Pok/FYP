package main

import (
	"log"

	"github.com/Joshua-Pok/FYP-backend/config"
	"github.com/Joshua-Pok/FYP-backend/database"
	"github.com/Joshua-Pok/FYP-backend/server"
)

func main() {
	cfg := config.Load()

	// Use your database.ConnectDB helper
	db, err := database.ConnectDB(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	defer db.Close()

	srv := server.New(cfg.Server, db)
	log.Fatal(srv.Start())
}
