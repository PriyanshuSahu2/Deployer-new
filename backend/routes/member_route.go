package routes

import (
	controller_member "backend/controllers/member"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func MemberRoutes(r *gin.Engine, workspaceRoute *gin.RouterGroup, memberController *controller_member.MemberController,permissionMiddleWare *middleware.PermissionMiddleware) {

	members := workspaceRoute.Group("/members")
	members.Use(middleware.ValidateRequest())
	{
		members.GET("", memberController.GetMembers)

		members.PUT("/:memberId", nil)
		members.DELETE("/:memberId", nil)
	}
}
