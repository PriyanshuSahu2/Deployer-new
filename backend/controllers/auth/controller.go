package controllers_auth

import "backend/services"

type AuthController struct {
	emailService *services.EmailService
}

func NewAuthController(emailService *services.EmailService) *AuthController {
	return &AuthController{
		emailService: emailService,
	}
}
