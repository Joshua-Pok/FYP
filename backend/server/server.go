package server

import "github.com/Joshua-Pok/FYP-backend/config"

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

func (s *Server) Start() error
