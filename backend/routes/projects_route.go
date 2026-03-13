package routes

import (
	controller_project "backend/controllers/project"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, projectController *controller_project.ProjectController, permissionMiddleWare *middleware.PermissionMiddleware) {
	projects := workspaceRoute.Group("/projects")

	projects.Use(middleware.ValidateRequest())
	{
		projects.GET("", permissionMiddleWare.RequirePermission("project:read"), projectController.ListProjects)
		projects.GET("/:uuid", permissionMiddleWare.RequirePermission("project:read"), projectController.GetProjectDetails)
		projects.POST("", permissionMiddleWare.RequirePermission("project:create"), projectController.CreateProject)
		projects.PUT("/:uuid", permissionMiddleWare.RequirePermission("project:update"), projectController.UpdateProject)
		projects.DELETE("/:uuid", permissionMiddleWare.RequirePermission("project:delete"), projectController.DeleteProject)
	}
}
