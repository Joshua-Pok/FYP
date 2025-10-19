package server

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/Joshua-Pok/FYP-backend/config"
	"github.com/Joshua-Pok/FYP-backend/handlers"
	"github.com/Joshua-Pok/FYP-backend/middleware"
	"github.com/Joshua-Pok/FYP-backend/repository"
	"github.com/Joshua-Pok/FYP-backend/service"
)

type Server struct {
	config *config.Config
	db     *sql.DB
}

func New(cfg config.Config, db *sql.DB) *Server {
	return &Server{
		config: &cfg,
		db:     db,
	}
}

func (s *Server) Start() error {
	minioService := service.NewMinIOService(s.config.MinIO.Endpoint, s.config.MinIO.AccessKey, s.config.MinIO.Secret, s.config.MinIO.BucketName, false)
	gorseService := service.NewGorseService(s.config.Gorse.URL)
	cacheService := service.NewCacheService(s.config.Cache.Addr, s.config.Cache.Password, s.config.Cache.Db)
	userRepo := repository.NewUserRepository(s.db)
	personalityRepo := repository.NewPersonalityRepository(s.db)
	itineraryRepo := repository.NewItineraryRepository(s.db)
	activityRepo := repository.NewActivityRepository(s.db)
	countryRepo := repository.NewCountryRepository(s.db)

	activityHandler := handlers.NewActivityhandler(*activityRepo, minioService, gorseService, cacheService)
	userHandler := handlers.NewUserHandler(userRepo, gorseService)
	itineraryHandler := handlers.NewItineraryHandler(*itineraryRepo)
	personalityHandler := handlers.NewPersonalityHandler(personalityRepo, gorseService)
	countryHandler := handlers.NewCountryHandler(countryRepo)

	mux := http.NewServeMux()
	mux.Handle("/users", middleware.JWTAuth(s.handleUsers(userHandler)))
	mux.HandleFunc("/personality", s.handlePersonality(personalityHandler))
	mux.HandleFunc("/itinerary", s.handleItinerary(itineraryHandler))
	mux.HandleFunc("/activity", s.handleActivity(activityHandler))
	mux.HandleFunc("/country", s.handleCountry(countryHandler))
	mux.HandleFunc("/login", userHandler.Login)
	mux.HandleFunc("/signup", userHandler.CreateUser)

	handler := middleware.CORS(mux)
	addr := ":" + s.config.Server.Port
	log.Println("Server started successfully", s.config.Server.Port)
	return http.ListenAndServe(addr, handler)
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

func (s *Server) handleItinerary(handler *handlers.ItineraryHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handler.CreateItinerary(w, r)
		case http.MethodGet:
			handler.GetItinerariesByUser(w, r)
		case http.MethodPut, http.MethodPatch:
			handler.ModifyItinerary(w, r)
		default:
			http.Error(w, "Method Not available", http.StatusInternalServerError)

		}
	}
}

func (s *Server) handleActivity(handler *handlers.ActivityHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handler.CreateActivity(w, r)
		case http.MethodGet:
			if r.URL.Query().Get("user_id") != "" && r.URL.Query().Get("country_id") != "" {
				handler.GetRecommededAcitivitiesByUserAndCountry(w, r)
				return
			}
			if r.URL.Query().Get("country_id") != "" {
				handler.GetActivitiesByCountry(w, r)
				return
			} else {
				handler.GetActivitiesByItinerary(w, r)
			}
		default:
			http.Error(w, "Method Not available", http.StatusInternalServerError)
		}
	}
}

func (s *Server) handleCountry(handler *handlers.CountryHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handler.CreateCountry(w, r)
		case http.MethodGet:
			handler.GetAllCountries(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
