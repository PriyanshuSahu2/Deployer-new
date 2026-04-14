package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/utils"
	"errors"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UpdateProfileDTO = dtos_auth.UpdateProfileDTO
type ChangePasswordDTO = dtos_auth.ChangePasswordDTO

var usernamePattern = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)

type validatedProfileUpdate struct {
	Name     *string
	Username *string
}

func validateProfileUpdateRequest(input UpdateProfileDTO) (*validatedProfileUpdate, error) {
	validated := &validatedProfileUpdate{}

	if input.Name == nil && input.Username == nil {
		return nil, errors.New("at least one field must be provided")
	}

	if input.Name != nil {
		trimmedName := strings.TrimSpace(*input.Name)
		if trimmedName == "" {
			return nil, errors.New("name cannot be empty")
		}
		validated.Name = &trimmedName
	}

	if input.Username != nil {
		trimmedUsername := strings.TrimSpace(*input.Username)
		if trimmedUsername == "" {
			return nil, errors.New("username cannot be empty")
		}
		if !usernamePattern.MatchString(trimmedUsername) {
			return nil, errors.New("username must be 3-30 characters and contain only letters, numbers, or underscores")
		}
		validated.Username = &trimmedUsername
	}

	return validated, nil
}

func validatePasswordChangeRequest(input ChangePasswordDTO, existingHash string) error {
	newPassword := strings.TrimSpace(input.NewPassword)
	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters")
	}

	if existingHash == "" {
		return nil
	}

	if strings.TrimSpace(input.CurrentPassword) == "" {
		return errors.New("current password is required")
	}

	if !utils.CheckPassword(input.CurrentPassword, existingHash) {
		return errors.New("current password is incorrect")
	}

	if utils.CheckPassword(newPassword, existingHash) {
		return errors.New("new password must be different from the current password")
	}

	return nil
}

func getAuthenticatedUser(c *gin.Context) (*models_auth.User, int, error) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		return nil, http.StatusUnauthorized, errors.New("unauthorized")
	}

	userID, ok := userIDRaw.(uint)
	if !ok {
		return nil, http.StatusUnauthorized, errors.New("invalid user id")
	}

	var user models_auth.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, http.StatusNotFound, errors.New("user not found")
		}
		return nil, http.StatusInternalServerError, errors.New("database error")
	}

	return &user, http.StatusOK, nil
}

// UpdateProfile godoc
// @Summary Update current user profile
// @Description Update the authenticated user's name and/or username
// @Tags auth
// @Accept json
// @Produce json
// @Param updateProfile body dtos_auth.UpdateProfileDTO true "Profile update payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/profile [patch]
func (a *AuthController) UpdateProfile(c *gin.Context) {
	var body UpdateProfileDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validated, err := validateProfileUpdateRequest(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, statusCode, err := getAuthenticatedUser(c)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}

	if validated.Name != nil {
		updates["name"] = *validated.Name
	}

	if validated.Username != nil {
		var existingUser models_auth.User
		err := db.DB.Where("LOWER(username) = LOWER(?) AND id <> ?", *validated.Username, user.ID).First(&existingUser).Error
		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "username already exists"})
			return
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		updates["username"] = *validated.Username
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no changes provided"})
		return
	}

	if err := db.DB.Model(user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	if err := db.DB.First(user, user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load updated profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"image":    user.Image,
		},
	})
}

// ChangePassword godoc
// @Summary Change or set current user password
// @Description Change the authenticated user's password. Existing-password accounts must provide their current password.
// @Tags auth
// @Accept json
// @Produce json
// @Param changePassword body dtos_auth.ChangePasswordDTO true "Password change payload"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/password [patch]
func (a *AuthController) ChangePassword(c *gin.Context) {
	var body ChangePasswordDTO
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, statusCode, err := getAuthenticatedUser(c)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	if err := validatePasswordChangeRequest(body, user.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(strings.TrimSpace(body.NewPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	if err := db.DB.Model(user).Update("password", hashedPassword).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
