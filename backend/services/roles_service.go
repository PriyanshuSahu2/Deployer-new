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

	workspace, err := s.WorkspaceRepo.GetByUUID(dto.WorkspaceUUID)
	if err != nil {
		return errors.New("workspace not found")
	}

	// 🔐 Future RBAC check here
	// if !s.permissionService.Can(userID, "role.create", workspace.ID) { ... }

	role := models_role.Role{
		RoleName:    dto.RoleName,
		Description: dto.Description,
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
	role.Description = dto.Description
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

func (s *RoleService) DeleteRole(userID uint, roleUUID string) error {
	role, err := s.RoleRepo.GetByUUID(&roleUUID)
	if err != nil {
		return errors.New("role not found")
	}

	if role.IsSystem {
		return errors.New("system roles cannot be deleted")
	}

	return s.RoleRepo.Delete(role)
}

func (s *RoleService) ListRolePermissions(userID uint, roleUUID string) ([]dtos_roles.RolePermissionRowDTO, error) {
	role, err := s.RoleRepo.GetByUUID(&roleUUID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	return s.RoleRepo.ListRolePermissions(role.ID)
}

func (s *RoleService) UpdateRolePermissions(userID uint, roleUUID string, dto dtos_roles.UpdateRolePermissionsDTO) ([]dtos_roles.RolePermissionRowDTO, error) {
	role, err := s.RoleRepo.GetByUUID(&roleUUID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	permissionSet := make(map[uint]struct{})
	for _, id := range dto.PermissionIDs {
		if id > 0 {
			permissionSet[id] = struct{}{}
		}
	}

	for _, item := range dto.Permissions {
		if item.Allowed && item.PermissionID > 0 {
			permissionSet[item.PermissionID] = struct{}{}
		}
	}

	permissionIDs := make([]uint, 0, len(permissionSet))
	for id := range permissionSet {
		permissionIDs = append(permissionIDs, id)
	}

	if err := s.RoleRepo.ReplaceRolePermissions(role.ID, permissionIDs); err != nil {
		return nil, err
	}

	return s.RoleRepo.ListRolePermissions(role.ID)
}

func (s *RoleService) mapToDTO(roles []models_role.Role) []dtos_roles.RoleResponseDTO {
	response := make([]dtos_roles.RoleResponseDTO, len(roles))

	for i, role := range roles {
		response[i] = dtos_roles.RoleResponseDTO{
			UUID:        role.UUID,
			RoleName:    role.RoleName,
			Description: role.Description,
			IsSystem:    role.IsSystem,
			CreatedAt:   role.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return response
}
