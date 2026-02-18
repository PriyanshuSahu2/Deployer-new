package routes

import (
	controller_roles "backend/controllers/roles"

	"github.com/gin-gonic/gin"
)

func RoleRoutes(r *gin.Engine) {
	role := r.Group("/roles")
	{
		role.GET("/:workspaceUUID", controller_roles.ListRoles)
		role.POST("", controller_roles.CreateRole)
		role.PUT("/:id", controller_roles.UpdateRole)
	}
}
