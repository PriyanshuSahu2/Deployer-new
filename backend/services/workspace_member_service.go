package services

import (
	"errors"
	"os"
	"time"

	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"
	"backend/utils"

	"gorm.io/gorm"
)

type WorkspaceMemberService struct {
	UserRepo      *repositories.UserRepository
	WorkspaceRepo *repositories.WorkspaceRepository
	RoleRepo      *repositories.RoleRepository
	InviteRepo    *repositories.InviteRepository
	EmailService  *EmailService
	DB            *gorm.DB
}

func NewWorkspaceMemberService(
	userRepo *repositories.UserRepository,
	workspaceRepo *repositories.WorkspaceRepository,
	roleRepo *repositories.RoleRepository,
	inviteRepo *repositories.InviteRepository,
	emailService *EmailService,
	db *gorm.DB,
) *WorkspaceMemberService {
	return &WorkspaceMemberService{
		UserRepo:      userRepo,
		WorkspaceRepo: workspaceRepo,
		RoleRepo:      roleRepo,
		InviteRepo:    inviteRepo,
		EmailService:  emailService,
		DB:            db,
	}
}

func (s *WorkspaceMemberService) InviteMember(invitedByID uint, dto dtos_workspace.AddMemberDTO) error {

	// 1️⃣ Find user
	user, err := s.UserRepo.GetByUUIDOrEmail(dto.UserUUID, dto.UserEmail)
	if err != nil {
		return errors.New("user not found")
	}

	// 2️⃣ Find workspace
	workspace, err := s.WorkspaceRepo.GetByUUID(dto.WorkspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	// 🔐 RBAC check should go here later

	// 3️⃣ Find role
	role, err := s.RoleRepo.GetByUUID(dto.RoleUUID)
	if err != nil {
		return errors.New("role not found")
	}

	// 4️⃣ Generate token
	token, err := utils.GenerateSecureToken()
	if err != nil {
		return errors.New("failed to generate secure token")
	}

	// 5️⃣ Create invite
	invite := models_workspace.WorkspaceInvite{
		WorkspaceID: workspace.ID,
		Email:       user.Email,
		RoleID:      role.ID,
		Token:       token,
		Status:      "PENDING",
		ExpiresAt:   time.Now().Add(24 * time.Hour),
		InvitedByID: invitedByID,
	}

	if err := s.InviteRepo.Create(&invite); err != nil {
		return err
	}

	// 6️⃣ Send email async
	currentUser, _ := s.UserRepo.GetByID(invitedByID)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	inviteLink := frontendURL + "/workspace/invite?token=" + token

	go s.EmailService.SendWorkspaceInvitation(
		user.Email,
		currentUser.Name,
		workspace.WorkspaceName,
		inviteLink,
	)

	return nil
}
