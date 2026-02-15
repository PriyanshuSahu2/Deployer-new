package routes

import (
	controller_workspace "backend/controllers/workspace"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine) {
	workspace := r.Group("/workspace")
	{
		workspace.POST("/workspaces", controller_workspace.CreateWorkspace)
		workspace.PUT("/workspaces", controller_workspace.UpdateWorkspace)
		workspace.GET("/workspaces", controller_workspace.ListWorkspaces)
	}
}
