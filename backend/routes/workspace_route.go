package routes

import (
	controller_integration "backend/controllers/integration"
	controller_workspace "backend/controllers/workspace"
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
		workspace.GET("/settings", permissionMiddleWare.RequirePermission("workspace_view"), workspaceController.GetWorkspaceSettings)
		workspace.PUT("/settings", workspaceController.UpdateWorkspaceSettings)
		workspace.POST("/settings/api-keys", workspaceController.CreateWorkspaceAPIKey)
		workspace.DELETE("/settings/api-keys/:keyUUID", workspaceController.RevokeWorkspaceAPIKey)
		workspace.POST("/transfer-ownership", workspaceController.TransferOwnership)

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
