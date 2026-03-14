package services

import (
	"backend/db"
	dtos_workspace "backend/dtos/workspace"
	models_workspace "backend/models/workspace"
	"backend/repositories"
	"errors"

	"gorm.io/gorm"
)

func GetWorkspaceByUUID(tx *gorm.DB, uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
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
	RoleService   *RoleService
}

func NewWorkspaceService(
	workspaceRepo *repositories.WorkspaceRepository,
	memberRepo *repositories.MemberRepository,
	roleService *RoleService,
) *WorkspaceService {
	return &WorkspaceService{
		WorkspaceRepo: workspaceRepo,
		MemberRepo:    memberRepo,
		RoleService:   roleService,
	}
}

func (s *WorkspaceService) CreateWorkspace(tx *gorm.DB, userID uint, dto dtos_workspace.CreateWorkspaceDTO) (models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Transaction(func(tx2 *gorm.DB) error {
		workspace = models_workspace.Workspace{
			WorkspaceName: dto.Name,
			OwnerID:       userID,
			CreatedByID:   userID,
		}

		if err := s.WorkspaceRepo.Create(tx2, &workspace); err != nil {
			return err
		}

		// Automatically add owner as member
		if err := s.MemberRepo.Create(tx2, models_workspace.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserId:      userID,
			Status:      "ACTIVE",
		}); err != nil {
			return err
		}

		return nil
	})

	return workspace, err
}

func (s *WorkspaceService) UpdateWorkspace(tx *gorm.DB, userID uint, dto dtos_workspace.UpdateWorkspaceDTO) error {

	workspace, err := s.WorkspaceRepo.GetByUUIDAndOwner(tx, dto.UUID, userID)
	if err != nil {
		return errors.New("workspace not found")
	}

	workspace.WorkspaceName = dto.Name
	return s.WorkspaceRepo.Update(tx, workspace)
}

func (s *WorkspaceService) ListWorkspaces(tx *gorm.DB, userID uint) ([]dtos_workspace.ListWorkspaceDTO, error) {

	workspaces, err := s.WorkspaceRepo.GetUserWorkspaces(tx, userID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(workspaces), nil
}

func (s *WorkspaceService) GetUserDefaultWorkspace(tx *gorm.DB, userID uint) (*dtos_workspace.ListWorkspaceDTO, error) {

	workspace, err := s.WorkspaceRepo.GetFirstAccessibleWorkspace(tx, userID)
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

func (s *WorkspaceService) GetUserPermissions(tx *gorm.DB, workspaceUUID string, userID int) ([]string, error) {

	roleID, err := s.RoleService.GetUserRoleID(tx, workspaceUUID, userID)
	if err != nil {
		return nil, err
	}

	permissions, err := s.RoleService.GetRolePermissions(tx, uint(roleID))
	if err != nil {
		return nil, err
	}

	return permissions, nil
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
