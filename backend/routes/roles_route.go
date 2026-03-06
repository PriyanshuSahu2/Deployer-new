package routes

import (
	controller_roles "backend/controllers/roles"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func RoleRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, roleController *controller_roles.RoleController, permissionMiddleWare *middleware.PermissionMiddleware) {

	roles := workspaceRoute.Group("/roles")

	roles.Use(middleware.ValidateRequest())
	{
		roles.GET("", permissionMiddleWare.RequirePermission("role:read"), roleController.ListRoles)
		roles.POST("", permissionMiddleWare.RequirePermission("role:create"), roleController.CreateRole)
		roles.PUT("/:uuid", permissionMiddleWare.RequirePermission("role:update"), roleController.UpdateRole)
		roles.DELETE("/:uuid", permissionMiddleWare.RequirePermission("role:delete"), roleController.DeleteRole)

		permissions := roles.Group("/:uuid/permissions")
		{
			permissions.GET("", permissionMiddleWare.RequirePermission("role:read"), roleController.ListRolePermissions)
			permissions.PUT("", roleController.AssignPermission)
		}
	}
}
