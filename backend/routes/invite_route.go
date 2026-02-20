package routes

import (
	controller_workspace "backend/controllers/workspace"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func InviteRoutes(r *gin.Engine) {

	//so this are public routes user without authentication can access these routes to get invite details but to accept or decline the invite user need to be authenticated and have valid token
	invites := r.Group("/invites")
	{
		invites.GET("/:token", controller_workspace.GetWorkspaceInviteDetails)
	}

	invitesAuth := r.Group("/invites")
	invitesAuth.Use(middleware.ValidateRequest())
	{
		invitesAuth.GET("", controller_workspace.GetUserInvites)
		invitesAuth.POST("/:token/accept", controller_workspace.AcceptWorkspaceInvite)
		invitesAuth.POST("/:token/decline", controller_workspace.DeclineWorkspaceInvite)
	}
}
