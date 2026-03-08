package controllers_auth

import (
	"backend/services"
)

type AuthController struct {
	emailService     *services.EmailService
	workspaceService *services.WorkspaceService
	memberService    *services.MemberService
}

func NewAuthController(emailService *services.EmailService, workspaceService *services.WorkspaceService, memberService *services.MemberService) *AuthController {

	return &AuthController{
		emailService:     emailService,
		workspaceService: workspaceService,
		memberService:    memberService,
	}
}
