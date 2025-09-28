package models

type Activity struct {
	ID        int     `json:"id" db:"id"`
	Name      string  `json:"name" db:"name"`
	Title     string  `json:"title" db:"title"`
	ImageURL  string  `json:"imageurl" db:"imageurl"`
	CountryID int     `json:"countryid" db:"countryid"`
	Address   string  `json:"address" db:"address"`
	Price     float64 `json:"price" db:"price"`
}
