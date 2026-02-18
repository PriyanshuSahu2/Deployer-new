package routes

import (
	controller_workspace "backend/controllers/workspace"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine) {
	workspace := r.Group("/workspace")
	{
		workspace.POST("/invite-member", controller_workspace.AddWorkspaceMember)
		workspace.POST("/", controller_workspace.CreateWorkspace)
		workspace.PUT("/workspaces", controller_workspace.UpdateWorkspace)
		workspace.GET("/get-user-workspaces", controller_workspace.ListWorkspaces)

		workspace.GET("/default", controller_workspace.GetUserDefaultWorkspace)

	}
}
