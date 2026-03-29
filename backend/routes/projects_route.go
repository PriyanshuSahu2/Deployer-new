package routes

import (
	controller_project "backend/controllers/project"
	controller_service "backend/controllers/service"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ProjectRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, projectController *controller_project.ProjectController, serviceController *controller_service.ServiceController, permissionMiddleWare *middleware.PermissionMiddleware) {
	projects := workspaceRoute.Group("/projects")

	projects.Use(middleware.ValidateRequest())
	{
		projects.GET("", permissionMiddleWare.RequirePermission("project:read"), projectController.ListProjects)
		projects.GET("/:uuid", permissionMiddleWare.RequirePermission("project:read"), projectController.GetProjectDetails)
		projects.POST("", permissionMiddleWare.RequirePermission("project:create"), projectController.CreateProject)
		projects.PUT("/:uuid", permissionMiddleWare.RequirePermission("project:update"), projectController.UpdateProject)
		projects.DELETE("/:uuid", permissionMiddleWare.RequirePermission("project:delete"), projectController.DeleteProject)

		// Service routes
		projects.POST("/:uuid/services", permissionMiddleWare.RequirePermission("service:create"), serviceController.CreateService)
		projects.GET("/:uuid/services", permissionMiddleWare.RequirePermission("service:read"), serviceController.GetServicesByProject)
		projects.POST("/:uuid/services/:serviceUUID/trigger-deploy", permissionMiddleWare.RequirePermission("service:update"), serviceController.TriggerDeployment)
		projects.GET("/:uuid/services/:serviceUUID", permissionMiddleWare.RequirePermission("service:read"), serviceController.GetServiceDetails)
		projects.PUT("/:uuid/services/:serviceUUID", permissionMiddleWare.RequirePermission("service:update"), serviceController.UpdateService)
		projects.GET("/:uuid/services/:serviceUUID/logs", permissionMiddleWare.RequirePermission("service:read"), serviceController.GetServiceLogs)
		projects.PATCH("/:uuid/services/:serviceUUID/auto-deploy", permissionMiddleWare.RequirePermission("service:update"), serviceController.ToggleAutoDeploy)
	}
}
