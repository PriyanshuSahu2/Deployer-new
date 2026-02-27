package routes

import (
	controllers_auth "backend/controllers/auth"
	"backend/middleware"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine, emailService *services.EmailService) {
	authController := controllers_auth.NewAuthController(emailService)

	auth := r.Group("/auth")
	{
		auth.POST("/login", authController.Login)
		auth.POST("/register", authController.Register)
		auth.POST("/refresh-token", authController.RefreshController)
		auth.POST("/forgot-password", authController.ForgotPassword)
		auth.POST("/reset-password", authController.ResetPassword)
		auth.POST("/verify-email", authController.VerifyEmail)
		auth.POST("/resend-verification", authController.ResendVerificationEmail)
		auth.GET("/github/callback", authController.GithubCallback)
		auth.GET("/google/callback", authController.GoogleCallback)
		auth.GET("/me", middleware.ValidateRequest(), authController.GetMe)
		auth.POST("/logout", authController.Logout)
	}
}
