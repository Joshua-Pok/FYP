package main

import (
	"database/sql"
	"github.com/Joshua-Pok/FYP-backend/config"
	"github.com/Joshua-Pok/FYP-backend/server"
	"log"
)

func main() {
	cfg := config.Load()

	db, err := sql.Open("postgres", cfg.Database.DBURL)
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	defer db.Close() //only close db when main exits

	server := server.New(cfg.Server, db)
	log.Fatal(server.Start())

}
