import (
	"database/sql"
	"github.com/Joshua-Pok/FYP-backend/models"
)

type ItineraryRepository struct {
	db *sql.DB


func ItineraryRepository(db *sql.DB) *ItineraryRepository {
	return &ItineraryRepository{db: db}
}

func (r *ItineraryRepository) GetItinerariesByUser(userId int) (*models.Itinerary, err) {
	itineraries := []models.Itinerary{}
	query := `SELECT id, activities FROM Itineraries WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&itinerary.id, itinerary.activities)
	if er != nil {
		return nil, err
	}

	return itineraries, nil
}

func (r *ItineraryRepository) DeleteItinerary(id int) nil {

}

func (r *ItineraryRepository) CreateItinerary(userId int) {
	query := ``
}

func (r *ItineraryRepository) UpdateItinerary(id int) (*models.Itinerary, err) {

}

func (r *ItineraryRepository) GetRecommendedItinerary(userId int)(*models.Itinerary, err){

} //?? dunno how to implement
