package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	dtos_workspace "backend/dtos/workspace"
	models_auth "backend/models/auth"
	"backend/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
func (a *AuthController) Register(c *gin.Context) {
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
	// Wrap user creation, workspace creation, and member addition in a transaction
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create User
		newUser = models_auth.User{
			Username: userBody.Username,
			Email:    userBody.Email,
			Password: hashedPassword,
		}
		if err := tx.Create(&newUser).Error; err != nil {
			return err
		}

		// 2. Generate and store OTP
		token, err := utils.GenerateVerificationToken()
		if err == nil {
			otpRecord := models_auth.OTP{
				Email:     newUser.Email,
				OTPCode:   token,
				Purpose:   "email_verification",
				ExpiresAt: time.Now().Add(24 * time.Hour),
				Used:      false,
			}
			if err := tx.Create(&otpRecord).Error; err != nil {
				return err
			}

			verificationLink := utils.BuildFrontendVerificationLink(token)

			go a.emailService.SendEmailVerification(newUser.Email, newUser.Username, verificationLink)
		}

		// 3. Create Workspace
		_, err = a.workspaceService.CreateWorkspace(tx, newUser.ID, dtos_workspace.CreateWorkspaceDTO{
			Name: userBody.Username + "'s Workspace",
		})
		if err != nil {
			return err
		}

		go a.emailService.SendWelcomeEmail(newUser.Email, newUser.Username)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully. Please check your email to verify your account.",
	})
}
