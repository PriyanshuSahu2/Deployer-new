package routes

import (
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine, workspaceController *controller_workspace.WorkspaceController, workspaceMemberController *controller_workspace.WorkspaceMemberController, permissionMiddleWare *middleware.PermissionMiddleware) *gin.RouterGroup {

	workspaces := r.Group("/workspaces")
	workspaces.Use(middleware.ValidateRequest())
	{
		workspaces.POST("", workspaceController.CreateWorkspace)
		workspaces.GET("", workspaceController.ListWorkspaces)
		workspaces.GET("/default", workspaceController.GetUserDefaultWorkspace)
	}

	workspace := r.Group("/workspaces/:workspaceUUID")
	workspace.Use(middleware.ValidateRequest())
	{
		workspace.PUT("", workspaceController.UpdateWorkspace)

		workspace.POST("/invite-member", workspaceMemberController.AddWorkspaceMember)
	}
	return workspace
}
