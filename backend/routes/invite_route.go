package routes

import (
	controller_invite "backend/controllers/invite"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func InviteRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, inviteController *controller_invite.InviteController, permissionMiddleWare *middleware.PermissionMiddleware) {

	invites := r.Group("/invites")

	invites.GET("/token/:token", inviteController.GetWorkspaceInviteDetails)

	invites.Use(middleware.ValidateRequest())
	{
		invites.GET("", inviteController.GetUserInvites)

		invites.POST("/:token/accept", inviteController.AcceptWorkspaceInvite)
		invites.POST("/:token/decline", inviteController.DeclineWorkspaceInvite)
	}

	workspaceInvites := workspaceRoute.Group("/invites")

	workspaceInvites.Use(middleware.ValidateRequest())
	{
		workspaceInvites.GET("", inviteController.GetWorkspaceInvites)
	}
}
