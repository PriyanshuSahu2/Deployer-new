package routes

import (
	controller_workspace "backend/controllers/workspace"
	controller_integration "backend/controllers/integration"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine, workspaceController *controller_workspace.WorkspaceController, workspaceMemberController *controller_workspace.WorkspaceMemberController, integrationController *controller_integration.IntegrationController, permissionMiddleWare *middleware.PermissionMiddleware) *gin.RouterGroup {

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

		workspace.GET("/me/permissions", workspaceController.GetMyWorkspacePermissions)

		// Integration Routes
		workspace.GET("/integrations", integrationController.GetWorkspaceIntegrations)
		workspace.DELETE("/integrations/:provider", integrationController.DisconnectIntegration)
		
		workspace.GET("/integrations/github/auth", integrationController.GithubAuthInitiate)
		workspace.GET("/integrations/github/callback", integrationController.GithubAuthCallback)

		workspace.GET("/integrations/github/repos", integrationController.GetGithubRepos)
		workspace.GET("/integrations/github/branches", integrationController.GetGithubBranches)
	}
	return workspace
}
