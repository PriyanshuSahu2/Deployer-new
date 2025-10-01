package routes

import (
	controllers_auth "backend/controllers/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthRoutes(r *gin.Engine, db *gorm.DB) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", func(c *gin.Context) {
			controllers_auth.Login(c, db)
		})
		auth.POST("/register", func(c *gin.Context) {
			controllers_auth.Register(c, db)
		})
	}
}
