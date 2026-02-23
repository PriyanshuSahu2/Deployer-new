package routes

import (
	controller_invite "backend/controllers/invite"
	"backend/middleware"
	"backend/repositories"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func InviteRoutes(r *gin.Engine) {

	inviteRepo := repositories.NewInviteRepository()
	memberRepo := repositories.NewMemberRepository()
	userRepo := repositories.NewUserRepository()
	workspaceRepo := repositories.NewWorkspaceRepository()

	inviteService := services.NewInviteService(
		inviteRepo,
		memberRepo,
		userRepo,
		workspaceRepo,
	)

	inviteController := controller_invite.NewInviteController(inviteService)

	invites := r.Group("/invites")

	invites.GET("/token/:token", inviteController.GetWorkspaceInviteDetails)

	invites.Use(middleware.ValidateRequest())
	{
		invites.GET("", inviteController.GetUserInvites)
		invites.GET("/workspace/:workspaceUUID", inviteController.GetWorkspaceInvites)

		invites.POST("/:token/accept", inviteController.AcceptWorkspaceInvite)
		invites.POST("/:token/decline", inviteController.DeclineWorkspaceInvite)
	}
}
