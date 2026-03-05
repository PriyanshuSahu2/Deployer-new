package routes

import (
	controller_roles "backend/controllers/roles"
	"backend/middleware"
	"backend/repositories"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func RoleRoutes(r *gin.Engine, emailService *services.EmailService) {

	roleRepo := repositories.NewRoleRepository()
	workspaceRepo := repositories.NewWorkspaceRepository()

	roleService := services.NewRoleService(
		roleRepo,
		workspaceRepo,
	)

	roleController := controller_roles.NewRoleController(roleService)

	role := r.Group("/roles")
	rolePermission := r.Group("/rolepermission")
	rolePermissions := r.Group("/rolepermissions")
	rolePermissionsDash := r.Group("/role-permissions")

	// Temporary: Unprotected for testing
	role.PUT("/:uuid", roleController.UpdateRole)

	role.Use(middleware.ValidateRequest())
	{
		role.GET("/:workspaceUUID", roleController.ListRoles)
		role.POST("", roleController.CreateRole)
		role.DELETE("/:uuid", roleController.DeleteRole)
	}

	rolePermission.Use(middleware.ValidateRequest())
	{
		rolePermission.GET("/:roleUUID", roleController.ListRolePermissions)
		rolePermission.PUT("/:roleUUID", roleController.AssignPermission)
	}

	rolePermissions.Use(middleware.ValidateRequest())
	{
		rolePermissions.GET("/:roleUUID", roleController.ListRolePermissions)
		rolePermissions.PUT("/:roleUUID", roleController.AssignPermission)
	}

	rolePermissionsDash.Use(middleware.ValidateRequest())
	{
		rolePermissionsDash.GET("/:roleUUID", roleController.ListRolePermissions)
		rolePermissionsDash.PUT("/:roleUUID", roleController.AssignPermission)
	}
}
