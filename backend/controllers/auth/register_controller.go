package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/services"
	"backend/utils"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary Register user
// @Description Register new user
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
	newUser = models_auth.User{
		Email:         userBody.Email,
		Username:      userBody.Username,
		Password:      hashedPassword,
		EmailVerified: false,
	}

	result := db.DB.Create(&newUser)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}

	// Generate verification token
	token, err := utils.GenerateVerificationToken()
	if err == nil {
		otpRecord := models_auth.OTP{
			Email:     newUser.Email,
			OTPCode:   token,
			Purpose:   "email_verification",
			ExpiresAt: time.Now().Add(24 * time.Hour),
			Used:      false,
		}
		db.DB.Create(&otpRecord)

		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:5173"
		}
		verificationLink := frontendURL + "/verify-email?token=" + token
		emailService := services.NewEmailService()
		go emailService.SendEmailVerification(newUser.Email, newUser.Username, verificationLink)
	}

	emailService := services.NewEmailService()
	go emailService.SendWelcomeEmail(newUser.Email, newUser.Username)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully. Please check your email to verify your account.",
	})
}
