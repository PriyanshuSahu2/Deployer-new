package routes

import (
	controller_member "backend/controllers/member"
	"backend/middleware"
	"backend/repositories"
	"backend/services"

	"github.com/gin-gonic/gin"
)

func MemberRoutes(r *gin.Engine) {

	memberRepo := repositories.NewMemberRepository()
	workspaceRepo := repositories.NewWorkspaceRepository()

	memberService := services.NewMemberService(
		memberRepo,
		workspaceRepo,
	)

	memberController := controller_member.NewMemberController(memberService)

	members := r.Group("/members")
	members.Use(middleware.ValidateRequest())
	{
		members.GET("/:workspaceUUID", memberController.GetMembers)

		members.PUT("/:memberId", nil)
		members.DELETE("/:memberId", nil)
	}
}
