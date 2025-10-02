package routes

import (
	controllers_auth "backend/controllers/auth"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", controllers_auth.Login)
		auth.POST("/register", controllers_auth.Register)
		auth.POST("/github/callback", controllers_auth.Register)
	}
}
