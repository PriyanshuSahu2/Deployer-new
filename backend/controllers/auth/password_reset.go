package controllers_auth

import (
	"backend/db"
	dtos_auth "backend/dtos/auth"
	models_auth "backend/models/auth"
	"backend/services"
	"backend/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ForgotPassword godoc
// @Summary Request password reset OTP
// @Description Send OTP to email for password reset
// @Tags auth
// @Accept json
// @Produce json
// @Param forgotPassword body dtos_auth.ForgotPasswordDTO true "Email"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/forgot-password [post]
func ForgotPassword(c *gin.Context) {
	var body dtos_auth.ForgotPasswordDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models_auth.User
	result := db.DB.Where("email = ?", body.Email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, gin.H{"message": "If the email exists, an OTP has been sent"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	otp, err := utils.GenerateOTP(6)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	db.DB.Where("email = ? AND purpose = ? AND used = ?", body.Email, "password_reset", false).
		Delete(&models_auth.OTP{})

	otpRecord := models_auth.OTP{
		Email:     body.Email,
		OTPCode:   otp,
		Purpose:   "password_reset",
		ExpiresAt: time.Now().Add(10 * time.Minute),
		Used:      false,
	}

	if err := db.DB.Create(&otpRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save OTP"})
		return
	}

	emailService := services.NewEmailService()
	go emailService.SendPasswordResetOTP(body.Email, user.Username, otp)

	c.JSON(http.StatusOK, gin.H{"message": "OTP has been sent to your email"})
}

// ResetPassword godoc
// @Summary Reset password with OTP
// @Description Reset password using OTP
// @Tags auth
// @Accept json
// @Produce json
// @Param resetPassword body dtos_auth.ResetPasswordDTO true "Reset credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/reset-password [post]
func ResetPassword(c *gin.Context) {
	var body dtos_auth.ResetPasswordDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var otpRecord models_auth.OTP
	result := db.DB.Where("email = ? AND otp_code = ? AND purpose = ? AND used = ? AND expires_at > ?",
		body.Email, body.OTP, "password_reset", false, time.Now()).First(&otpRecord)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired OTP"})
		return
	}

	var user models_auth.User
	if err := db.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	hashedPassword, err := utils.HashPassword(body.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	db.DB.Model(&user).Update("password", hashedPassword)
	db.DB.Model(&otpRecord).Update("used", true)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

// VerifyEmail godoc
// @Summary Verify email address
// @Description Verify user email with token
// @Tags auth
// @Accept json
// @Produce json
// @Param verifyEmail body dtos_auth.VerifyEmailDTO true "Verification token"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/verify-email [post]
func VerifyEmail(c *gin.Context) {
	var body dtos_auth.VerifyEmailDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var otpRecord models_auth.OTP
	result := db.DB.Where("otp_code = ? AND purpose = ? AND used = ? AND expires_at > ?",
		body.Token, "email_verification", false, time.Now()).First(&otpRecord)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}

	var user models_auth.User
	if err := db.DB.Where("email = ?", otpRecord.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	db.DB.Model(&user).Update("email_verified", true)
	db.DB.Model(&otpRecord).Update("used", true)

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

// ResendVerificationEmail godoc
// @Summary Resend verification email
// @Description Resend email verification link
// @Tags auth
// @Accept json
// @Produce json
// @Param email body dtos_auth.ForgotPasswordDTO true "Email"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/resend-verification [post]
func ResendVerificationEmail(c *gin.Context) {
	var body dtos_auth.ForgotPasswordDTO

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models_auth.User
	if err := db.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, verification link has been sent"})
		return
	}

	token, err := utils.GenerateVerificationToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	db.DB.Where("email = ? AND purpose = ? AND used = ?", body.Email, "email_verification", false).
		Delete(&models_auth.OTP{})

	otpRecord := models_auth.OTP{
		Email:     body.Email,
		OTPCode:   token,
		Purpose:   "email_verification",
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Used:      false,
	}

	if err := db.DB.Create(&otpRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save token"})
		return
	}

	verificationLink := "http://localhost:5173/auth/verify-email?token=" + token

	emailService := services.NewEmailService()
	go emailService.SendEmailVerification(body.Email, user.Username, verificationLink)

	c.JSON(http.StatusOK, gin.H{"message": "Verification email has been sent"})
}
