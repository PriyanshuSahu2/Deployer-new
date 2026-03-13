package services

import (
	"errors"
	"time"

	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"

	"gorm.io/gorm"
)

type InviteService struct {
	InviteRepo    *repositories.InviteRepository
	MemberRepo    *repositories.MemberRepository
	UserRepo      *repositories.UserRepository
	WorkspaceRepo *repositories.WorkspaceRepository
}

func NewInviteService(
	inviteRepo *repositories.InviteRepository,
	memberRepo *repositories.MemberRepository,
	userRepo *repositories.UserRepository,
	workspaceRepo *repositories.WorkspaceRepository,
) *InviteService {
	return &InviteService{
		InviteRepo:    inviteRepo,
		MemberRepo:    memberRepo,
		UserRepo:      userRepo,
		WorkspaceRepo: workspaceRepo,
	}
}

func (s *InviteService) GetWorkspaceInvites(tx *gorm.DB, userID uint, workspaceUUID string) ([]dtos_workspace.WorkspaceInviteResponseDTO, error) {

	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, err
	}

	invites, err := s.InviteRepo.GetByWorkspaceID(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(invites), nil
}

func (s *InviteService) GetInviteByToken(tx *gorm.DB, token string) (*models_workspace.WorkspaceInvite, error) {
	return s.InviteRepo.GetByToken(tx, token)
}

func (s *InviteService) GetInviteDetails(tx *gorm.DB, token string) (*dtos_workspace.WorkspaceInviteResponseDTO, error) {

	invite, err := s.InviteRepo.GetByToken(tx, token)
	if err != nil {
		return nil, err
	}

	dto := s.mapSingleToDTO(*invite)
	return &dto, nil
}

func (s *InviteService) RejectInvite(tx *gorm.DB, token string) error {
	invite, err := s.InviteRepo.GetByToken(tx, token)
	if err != nil {
		return errors.New("invite not found")
	}

	return s.InviteRepo.UpdateStatus(tx, invite, models_workspace.InviteDeclined)
}

func (s *InviteService) AcceptInvite(tx *gorm.DB, token string) error {
	invite, err := s.InviteRepo.GetByToken(tx, token)
	if err != nil {
		return errors.New("invite not found")
	}

	query := db.DB
	if tx != nil {
		query = tx
	}

	return query.Transaction(func(tx2 *gorm.DB) error {
		if err := s.InviteRepo.UpdateStatus(tx2, invite, models_workspace.InviteAccepted); err != nil {
			return err
		}

		// Look for user by email to get their ID
		user, err := s.UserRepo.GetByUUIDOrEmail(tx2, nil, invite.Email)
		if err != nil {
			return errors.New("invited user not found in system")
		}

		return s.MemberRepo.Create(tx2, models_workspace.WorkspaceMember{
			WorkspaceID: invite.WorkspaceID,
			UserId:      user.ID,
			RoleID:      invite.RoleID,
			Status:      "ACTIVE",
			InvitedByID: invite.InvitedByID,
		})
	})
}

func (s *InviteService) DeclineInvite(tx *gorm.DB, userID uint, token string) error {

	invite, err := s.InviteRepo.LockByToken(tx, token)
	if err != nil {
		return err
	}

	if invite.Status != models_workspace.InvitePending {
		return errors.New("invite not active")
	}

	if invite.ExpiresAt.Before(time.Now()) {
		return errors.New("invite expired")
	}

	return s.InviteRepo.UpdateStatus(tx, invite, models_workspace.InviteDeclined)
}

func (s *InviteService) GetUserInvites(tx *gorm.DB, userID uint) ([]dtos_workspace.WorkspaceInviteResponseDTO, error) {

	user, err := s.UserRepo.GetByID(tx, userID)
	if err != nil {
		return nil, err
	}

	invites, err := s.InviteRepo.GetByEmail(tx, user.Email)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(invites), nil
}

func (s *InviteService) mapToDTO(invites []models_workspace.WorkspaceInvite) []dtos_workspace.WorkspaceInviteResponseDTO {
	var response []dtos_workspace.WorkspaceInviteResponseDTO

	for _, invite := range invites {
		response = append(response, s.mapSingleToDTO(invite))
	}

	return response
}

func (s *InviteService) mapSingleToDTO(invite models_workspace.WorkspaceInvite) dtos_workspace.WorkspaceInviteResponseDTO {
	status := "active"
	if invite.ExpiresAt.Before(time.Now()) {
		status = "expired"
	}

	return dtos_workspace.WorkspaceInviteResponseDTO{
		Email:         invite.Email,
		WorkspaceName: invite.Workspace.WorkspaceName,
		Role:          invite.Role.RoleName,
		RoleUUID:      invite.Role.UUID.String(),
		Token:         invite.Token,
		InvitedBy:     invite.Inviter.Username,
		Status:        status,
	}
}
