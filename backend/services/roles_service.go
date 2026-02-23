package services

import (
	"errors"

	dtos_roles "backend/dtos/roles"
	models_role "backend/models/role"
	"backend/repositories"
)

type RoleService struct {
	RoleRepo      *repositories.RoleRepository
	WorkspaceRepo *repositories.WorkspaceRepository
}

func NewRoleService(
	roleRepo *repositories.RoleRepository,
	workspaceRepo *repositories.WorkspaceRepository,
) *RoleService {
	return &RoleService{
		RoleRepo:      roleRepo,
		WorkspaceRepo: workspaceRepo,
	}
}

func (s *RoleService) CreateRole(userID uint, dto dtos_roles.CreateRoleDTO) error {

	workspace, err := s.WorkspaceRepo.GetByID(dto.WorkspaceID)
	if err != nil {
		return errors.New("workspace not found")
	}

	// 🔐 Future RBAC check here
	// if !s.permissionService.Can(userID, "role.create", workspace.ID) { ... }

	role := models_role.Role{
		RoleName:    dto.RoleName,
		WorkspaceID: &workspace.ID,
		CreatedByID: userID,
	}

	return s.RoleRepo.Create(&role)
}

func (s *RoleService) UpdateRole(userID uint, dto dtos_roles.UpdateRoleDTO) error {

	role, err := s.RoleRepo.GetByUUID(&dto.UUID)
	if err != nil {
		return errors.New("role not found")
	}

	// 🔐 RBAC check later

	role.RoleName = dto.RoleName
	return s.RoleRepo.Update(role)
}

func (s *RoleService) ListRoles(userID uint, workspaceUUID string) ([]dtos_roles.RoleResponseDTO, error) {

	workspace, err := s.WorkspaceRepo.GetByUUID(workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	// 🔐 RBAC check later

	roles, err := s.RoleRepo.GetWorkspaceAndSystemRoles(workspace.ID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(roles), nil
}

func (s *RoleService) mapToDTO(roles []models_role.Role) []dtos_roles.RoleResponseDTO {
	response := make([]dtos_roles.RoleResponseDTO, len(roles))

	for i, role := range roles {
		response[i] = dtos_roles.RoleResponseDTO{
			UUID:      role.UUID,
			RoleName:  role.RoleName,
			CreatedAt: role.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return response
}
