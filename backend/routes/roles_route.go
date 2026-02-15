package routes

import (
	controller_roles "backend/controllers/roles"

	"github.com/gin-gonic/gin"
)

func RoleRoutes(r *gin.Engine) {
	role := r.Group("/role")
	{
		role.POST("/roles", controller_roles.CreateRole)
		role.PUT("/roles", controller_roles.UpdateRole)
		role.GET("/roles", controller_roles.ListRoles)
	}
}
