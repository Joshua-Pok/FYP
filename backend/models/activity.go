package models

type Activity struct {
	ID      int    `json:"id" db:"id"`
	country string `json:"country" db:"country"`
	address string `json:"address" db:"address"`
	price   int    `json:"price" db:"price"`
}
