package controllers

import (
	"github.com/Joshua-Pok/backendfyp/initializers"
	"github.com/Joshua-Pok/backendfyp/models"
	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
	var body struct {
		username string
		password string
	}

	c.Bind(body)

	User := models.User{Username: body.username, Password: body.password}
	result := initializers.DB.Create(&User)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(200, gin.H{
		"User": User,
	})
}
