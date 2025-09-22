package models

type Activity struct {
	ID      int    `json:"id" db:"id"`
	Country string `json:"country" db:"country"`
	Address string `json:"address" db:"address"`
	Price   int    `json:"price" db:"price"`
}
