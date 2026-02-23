package routes

import (
	controllers_auth "backend/controllers/auth"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", controllers_auth.Login)
		auth.POST("/register", controllers_auth.Register)
		auth.POST("/refresh-token", controllers_auth.RefreshController)
		auth.POST("/forgot-password", controllers_auth.ForgotPassword)
		auth.POST("/reset-password", controllers_auth.ResetPassword)
		auth.POST("/verify-email", controllers_auth.VerifyEmail)
		auth.POST("/resend-verification", controllers_auth.ResendVerificationEmail)
		auth.GET("/github/callback", controllers_auth.GithubCallback)
		auth.GET("/google/callback", controllers_auth.GoogleCallback)
		auth.GET("/me", middleware.ValidateRequest(), controllers_auth.GetMe)
	}
}
