package routes

import (
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine) {

	workspaces := r.Group("/workspace")
	workspaces.Use(middleware.ValidateRequest())
	{
		workspaces.POST("", controller_workspace.CreateWorkspace)
		workspaces.PUT("/:workspaceUUID", controller_workspace.UpdateWorkspace)
		workspaces.GET("", controller_workspace.ListWorkspaces)
		workspaces.GET("/default", controller_workspace.GetUserDefaultWorkspace)
		workspaces.POST("/invite-member", controller_workspace.AddWorkspaceMember)
	}

}
