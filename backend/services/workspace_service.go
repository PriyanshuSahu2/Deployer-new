package services

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"
	"errors"
)

func GetWorkspaceByUUID(uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	err := db.DB.
		Where("uuid = ?", uuid).
		First(&workspace).Error

	if err != nil {
		return nil, err
	}

	return &workspace, nil
}

type WorkspaceService struct {
	WorkspaceRepo *repositories.WorkspaceRepository
	MemberRepo    *repositories.MemberRepository
}

func NewWorkspaceService(
	workspaceRepo *repositories.WorkspaceRepository,
	memberRepo *repositories.MemberRepository,
) *WorkspaceService {
	return &WorkspaceService{
		WorkspaceRepo: workspaceRepo,
		MemberRepo:    memberRepo,
	}
}

func (s *WorkspaceService) CreateWorkspace(userID uint, dto dtos_workspace.CreateWorkspaceDTO) (models_workspace.Workspace, error) {

	workspace := models_workspace.Workspace{
		WorkspaceName: dto.Name,
		OwnerID:       userID,
		CreatedByID:   userID,
	}

	if err := s.WorkspaceRepo.Create(&workspace); err != nil {
		return workspace, err
	}

	// Automatically add owner as member
	_ = s.MemberRepo.Create(nil, models_workspace.WorkspaceMember{
		WorkspaceID: workspace.ID,
		UserId:      userID,
		Status:      "ACTIVE",
	})

	return workspace, nil
}

func (s *WorkspaceService) UpdateWorkspace(userID uint, dto dtos_workspace.UpdateWorkspaceDTO) error {

	workspace, err := s.WorkspaceRepo.GetByUUIDAndOwner(dto.UUID, userID)
	if err != nil {
		return errors.New("workspace not found")
	}

	workspace.WorkspaceName = dto.Name
	return s.WorkspaceRepo.Update(workspace)
}

func (s *WorkspaceService) ListWorkspaces(userID uint) ([]dtos_workspace.ListWorkspaceDTO, error) {

	workspaces, err := s.WorkspaceRepo.GetUserWorkspaces(userID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(workspaces), nil
}

func (s *WorkspaceService) GetUserDefaultWorkspace(userID uint) (*dtos_workspace.ListWorkspaceDTO, error) {

	workspace, err := s.WorkspaceRepo.GetLatestOwnedWorkspace(userID)
	if err != nil {
		return nil, err
	}

	dto := dtos_workspace.ListWorkspaceDTO{
		UUID:      workspace.UUID,
		Name:      workspace.WorkspaceName,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}

	return &dto, nil
}

func (s *WorkspaceService) mapToDTO(workspaces []models_workspace.Workspace) []dtos_workspace.ListWorkspaceDTO {
	response := make([]dtos_workspace.ListWorkspaceDTO, len(workspaces))

	for i, w := range workspaces {
		response[i] = dtos_workspace.ListWorkspaceDTO{
			UUID:      w.UUID,
			Name:      w.WorkspaceName,
			CreatedAt: w.CreatedAt,
			UpdatedAt: w.UpdatedAt,
		}
	}

	return response
}
