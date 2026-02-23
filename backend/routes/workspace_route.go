package routes

import (
	controller_workspace "backend/controllers/workspace"
	"backend/db"
	"backend/middleware"
	"backend/repositories"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func WorkspaceRoutes(r *gin.Engine) {

	workspaceRepo := repositories.NewWorkspaceRepository()
	memberRepo := repositories.NewMemberRepository()
	roleRepo := repositories.NewRoleRepository()
	userRepo := repositories.NewUserRepository()
	inviteRepo := repositories.NewInviteRepository()

	workspaceService := services.NewWorkspaceService(
		workspaceRepo,
		memberRepo,
	)

	emailService := services.NewEmailService()

	workspaceMemberService := services.NewWorkspaceMemberService(
		userRepo,
		workspaceRepo,
		roleRepo,
		inviteRepo,
		emailService,
		db.DB,
	)

	workspaceController := controller_workspace.NewWorkspaceController(workspaceService)
	workspaceMemberController := controller_workspace.NewWorkspaceMemberController(workspaceMemberService)

	workspaces := r.Group("/workspace")
	workspaces.Use(middleware.ValidateRequest())
	{
		workspaces.POST("", workspaceController.CreateWorkspace)
		workspaces.PUT("/:workspaceUUID", workspaceController.UpdateWorkspace)
		workspaces.GET("", workspaceController.ListWorkspaces)
		workspaces.GET("/default", workspaceController.GetUserDefaultWorkspace)

		workspaces.POST("/invite-member", workspaceMemberController.AddWorkspaceMember)
	}
}
