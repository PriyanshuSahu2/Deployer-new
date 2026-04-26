package routes

import (
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func DashboardRoutes(r *gin.RouterGroup, dashboardController *controller_workspace.DashboardController, permissionMW *middleware.PermissionMiddleware) {
	dashboard := r.Group("/dashboard")
	{
		dashboard.GET("/overview", permissionMW.RequirePermission("workspace_view"), dashboardController.GetOverview)
		dashboard.GET("/stats", permissionMW.RequirePermission("workspace_view"), dashboardController.GetDashboardStats)
		dashboard.GET("/deployments", permissionMW.RequirePermission("workspace_view"), dashboardController.GetWorkspaceDeployments)
		dashboard.GET("/deployments/:deploymentUUID/logs", permissionMW.RequirePermission("workspace_view"), dashboardController.GetDeploymentLogs)
	}
}
