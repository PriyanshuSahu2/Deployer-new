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

func (s *InviteService) GetWorkspaceInvites(userID uint, workspaceUUID string) ([]dtos_workspace.WorkspaceInviteResponseDTO, error) {

	workspace, err := s.WorkspaceRepo.GetByUUID(workspaceUUID)
	if err != nil {
		return nil, err
	}

	invites, err := s.InviteRepo.GetByWorkspaceID(workspace.ID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(invites), nil
}

func (s *InviteService) GetInviteDetails(token string) (*dtos_workspace.WorkspaceInviteResponseDTO, error) {

	invite, err := s.InviteRepo.GetByToken(token)
	if err != nil {
		return nil, err
	}

	dto := s.mapSingleToDTO(*invite)
	return &dto, nil
}

func (s *InviteService) AcceptInvite(userID uint, token string) error {

	user, err := s.UserRepo.GetByID(userID)
	if err != nil {
		return err
	}

	return db.DB.Transaction(func(tx *gorm.DB) error {

		invite, err := s.InviteRepo.LockByTokenAndEmail(tx, token, user.Email)
		if err != nil {
			return err
		}

		if invite.Status != models_workspace.InvitePending {
			return errors.New("invite not active")
		}

		if invite.ExpiresAt.Before(time.Now()) {
			return errors.New("invite expired")
		}

		exists, err := s.MemberRepo.Exists(tx, invite.WorkspaceID, userID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("already member")
		}

		if err := s.InviteRepo.UpdateStatus(tx, invite, models_workspace.InviteAccepted); err != nil {
			return err
		}

		return s.MemberRepo.Create(tx, models_workspace.WorkspaceMember{
			WorkspaceID: invite.WorkspaceID,
			UserId:      userID,
			RoleID:      invite.RoleID,
			Status:      "ACTIVE",
			InvitedByID: invite.InvitedByID,
		})
	})
}

func (s *InviteService) DeclineInvite(userID uint, token string) error {

	return db.DB.Transaction(func(tx *gorm.DB) error {

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
	})
}

func (s *InviteService) GetUserInvites(userID uint) ([]dtos_workspace.WorkspaceInviteResponseDTO, error) {

	user, err := s.UserRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	invites, err := s.InviteRepo.GetByEmail(user.Email)
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
		InvitedBy:     invite.Inviter.Username,
		Status:        status,
	}
}
