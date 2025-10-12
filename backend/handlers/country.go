package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Joshua-Pok/FYP-backend/repository"
)

type CountryHandler struct {
	repo *repository.CountryRepository
}

type CreateCountryRequest struct {
	Name string `json:"name"`
}

func NewCountryHandler(repo *repository.CountryRepository) *CountryHandler {
	return &CountryHandler{repo: repo}
}

func (h *CountryHandler) CreateCountry(w http.ResponseWriter, r *http.Request) {

	var req CreateCountryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Country name cannot be blank", http.StatusBadRequest)
		return
	}

	country, err := h.repo.CreateCountry(req.Name)
	if err != nil {
		http.Error(w, "failed to create country", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(country)
}

func (h *CountryHandler) GetAllCountries(w http.ResponseWriter, r *http.Request) {
	countries, err := h.repo.GetAllCountries()

	if err != nil {
		http.Error(w, "Failed to fetch countries", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(countries)
}
