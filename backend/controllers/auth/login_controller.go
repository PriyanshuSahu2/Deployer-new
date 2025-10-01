package controllers_auth

import (
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Login godoc
// @Summary Login user
// @Description Login with username/email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param login body dtos_auth.LoginDTO true "Login credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/login [post]
func Login(c *gin.Context, db *gorm.DB) {
	var userBody dtos_auth.LoginDTO
	var foundUser models_auth.User

	if err := c.ShouldBindJSON(&userBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Where("LOWER(email) = LOWER(?) OR username = ?", userBody.Identifier, userBody.Identifier).
		First(&foundUser)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong credentials"})
		return
	}

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if !utils.CheckPassword(userBody.Password, foundUser.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    foundUser.Email,
	})
}
