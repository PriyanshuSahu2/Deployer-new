package routes

import (
	controller_invite "backend/controllers/invite"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func InviteRoutes(r *gin.Engine) {

	invites := r.Group("/invites")

	// Public route
	invites.GET("/token/:token", controller_invite.GetWorkspaceInviteDetails)

	// Protected routes
	invites.Use(middleware.ValidateRequest())
	{
		invites.GET("", controller_invite.GetUserInvites)
		invites.GET("/workspace/:workspaceUUID", controller_invite.GetWorkspaceInvites)

		invites.POST("/:token/accept", controller_invite.AcceptWorkspaceInvite)
		invites.POST("/:token/decline", controller_invite.DeclineWorkspaceInvite)
	}
}
