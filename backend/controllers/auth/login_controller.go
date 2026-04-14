package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/utils"
	"errors"
	"fmt"
	"net/http"
	"time"

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
func (a *AuthController) Login(c *gin.Context) {
	var userBody dtos_auth.LoginDTO
	var foundUser models_auth.User

	if err := c.ShouldBindJSON(&userBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.DB.Where("LOWER(email) = LOWER(?) OR username = ?", userBody.Identifier, userBody.Identifier).
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
	if !foundUser.EmailVerified {
		token, err := utils.GenerateVerificationToken()
		if err == nil {
			otpRecord := models_auth.OTP{
				Email:     foundUser.Email,
				OTPCode:   token,
				Purpose:   "email_verification",
				ExpiresAt: time.Now().Add(24 * time.Hour),
				Used:      false,
			}
			db.DB.Create(&otpRecord)

			verificationLink := utils.BuildFrontendVerificationLink(token)
			go a.emailService.SendEmailVerification(foundUser.Email, foundUser.Username, verificationLink)
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Account not verified. Please check your email for the verification link.",
		})
		return
	}
	payload := map[string]interface{}{
		"id": foundUser.ID,
	}
	access_token, err := utils.GenerateAccessToken(payload)
	if err != nil {
		fmt.Print("Error Generating Access Token", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
		return
	}

	refresh_token, err := utils.GenerateRefreshToken(payload)
	if err != nil {
		fmt.Print("Error Generating Refresh Token", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something Went Wrong!. Please Try After sometime"})
		return
	}

	c.SetCookie(
		"access_token",
		access_token,
		7*24*60*60,
		"/",
		"",
		false,
		true,
	)

	c.SetCookie(
		"refresh_token",
		refresh_token,
		7*24*60*60,
		"/auth/refresh-token",
		"",
		false,
		true,
	)

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()
	go a.emailService.SendLoginNotification(foundUser.Email, foundUser.Username, ipAddress, userAgent)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    foundUser.ID,
	})
}
