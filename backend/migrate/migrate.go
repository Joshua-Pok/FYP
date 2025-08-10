package main

import (
	"github.com/Joshua-Pok/backendfyp/initializers"
	"github.com/Joshua-Pok/backendfyp/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectDB()
}

func main() {
	initializers.DB.AutoMigrate(&models.User{})
}
