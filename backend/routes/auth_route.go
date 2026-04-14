package routes

import (
	controllers_auth "backend/controllers/auth"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine, authController *controllers_auth.AuthController) {

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
		auth.PATCH("/profile", middleware.ValidateRequest(), authController.UpdateProfile)
		auth.PATCH("/password", middleware.ValidateRequest(), authController.ChangePassword)
		auth.POST("/ws-ticket", middleware.ValidateRequest(), authController.GenerateWSTicket)
		auth.POST("/logout", authController.Logout)
	}
}
