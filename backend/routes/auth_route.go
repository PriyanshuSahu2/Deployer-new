package routes

import (
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.GET("/login")
	}
}
