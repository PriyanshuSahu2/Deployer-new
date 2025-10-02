package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Login godoc
// @Summary Login user
// @Description Register
// @Tags auth
// @Accept json
// @Produce json
// @Param Register body dtos_auth.RegisterDTO true "Register credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func Register(c *gin.Context) {
	var userBody dtos_auth.RegisterDTO
	var newUser models_auth.User
	if err := c.ShouldBindJSON(&userBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	existingUser := db.DB.Where("email = ? OR username = ?", userBody.Email, userBody.Username).
		First(&newUser)

	if existingUser.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or Username Already Exists"})
		return
	}

	hashedPassword, err := utils.HashPassword(userBody.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newUser = models_auth.User{Email: userBody.Email, Username: userBody.Username, Password: hashedPassword}

	result := db.DB.Create(&newUser)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User Created Successfully"})
}
