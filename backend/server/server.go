package server

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/Joshua-Pok/FYP-backend/config"
	"github.com/Joshua-Pok/FYP-backend/handlers"
	"github.com/Joshua-Pok/FYP-backend/repository"
)

type Server struct {
	config *config.ServerConfig
	db     *sql.DB
}

func New(cfg config.ServerConfig, db *sql.DB) *Server {
	return &Server{
		config: &cfg,
		db:     db,
	}
}

func (s *Server) Start() error {
	userRepo := repository.NewUserRepository(s.db)
	personalityRepo := repository.NewPersonalityRepository(s.db)
	userHandler := handlers.NewUserHandler(userRepo)

	personalityHandler := handlers.NewPersonalityHandler(personalityRepo)
	http.HandleFunc("/users", s.handleUsers(userHandler))
	http.HandleFunc("/personality", s.handlePersonality(personalityHandler))

	addr := ":" + s.config.Port
	log.Println("Server started successfully", s.config.Port)
	return http.ListenAndServe(addr, nil)
}

func (s *Server) handleUsers(handler *handlers.UserHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handler.GetUser(w, r)
		case http.MethodPost:
			handler.CreateUser(w, r)
		default:
			http.Error(w, "Method not available", http.StatusMethodNotAllowed)
		}
	}
}

func (s *Server) handlePersonality(handler *handlers.PersonalityHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handler.CreatePersonality(w, r)
		case http.MethodGet:
			handler.GetPersonalityByUserId(w, r)
		default:
			http.Error(w, "Method Not available", http.StatusInternalServerError)
		}
	}
}
