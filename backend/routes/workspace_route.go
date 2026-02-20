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
		workspaces.PUT("/:workspaceId", controller_workspace.UpdateWorkspace)
		workspaces.GET("", controller_workspace.ListWorkspaces)
		workspaces.GET("/default", controller_workspace.GetUserDefaultWorkspace)
		workspaces.POST("/invite-member", controller_workspace.AddWorkspaceMember)
	}

	//so this are public routes user without authentication can access these routes to get invite details but to accept or decline the invite user need to be authenticated and have valid token
	invites := r.Group("/workspace-invites")
	{
		invites.GET("/:token", controller_workspace.GetWorkspaceInviteDetails)
	}

	invitesAuth := r.Group("/workspace-invites")
	invitesAuth.Use(middleware.ValidateRequest())
	{
		invitesAuth.POST("/:token/accept", controller_workspace.AcceptWorkspaceInvite)
		invitesAuth.POST("/:token/decline", controller_workspace.DeclineWorkspaceInvite)
	}
}
