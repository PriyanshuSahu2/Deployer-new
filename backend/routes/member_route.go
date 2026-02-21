package routes

import (
	controller_member "backend/controllers/member"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func MemberRoutes(r *gin.Engine) {

	members := r.Group("/members")
	members.Use(middleware.ValidateRequest())
	{
		members.GET("/:workspaceUUID", controller_member.GetMembers)
		members.PUT("/:memberId", nil)
		members.DELETE("/:memberId", nil)
	}
}
