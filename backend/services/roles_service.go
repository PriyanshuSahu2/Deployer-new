package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"strconv"
	"strings"

	dtos_roles "backend/dtos/roles"
	models_role "backend/models/role"
	"backend/repositories"

	"github.com/go-redis/redis/v8"
)

type RoleService struct {
	RoleRepo      *repositories.RoleRepository
	WorkspaceRepo *repositories.WorkspaceRepository
	RedisRepo     *repositories.RedisRepository
}

func NewRoleService(
	roleRepo *repositories.RoleRepository,
	workspaceRepo *repositories.WorkspaceRepository,
	redisRepo *repositories.RedisRepository,
) *RoleService {
	return &RoleService{
		RoleRepo:      roleRepo,
		WorkspaceRepo: workspaceRepo,
		RedisRepo:     redisRepo,
	}
}
func (s *RoleService) GetUserRoleID(workspaceUUID string, userID int) (string, error) {

	key := fmt.Sprintf("workspace:role:%s:%d", workspaceUUID, userID)

	role, err := s.RedisRepo.Get(key)
	if err == nil {
		return role, nil
	}

	if err != redis.Nil {
		return "", err
	}

	workspaceIdKey := fmt.Sprintf("workspace:uuid:%s", workspaceUUID)

	workspaceIdStr, err := s.RedisRepo.Get(workspaceIdKey)
	if err != nil {
		return "", err
	}

	workspaceID, err := strconv.Atoi(workspaceIdStr)
	if err != nil {
		return "", err
	}

	roleID, err := s.RoleRepo.GetUserRoleID(workspaceID, userID)
	if err != nil {
		return "", err
	}

	_ = s.RedisRepo.Set(key, strconv.Itoa(roleID), 0)

	return strconv.Itoa(roleID), nil
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

func (s *RoleService) RoleHasPermission(roleID uint, permissionKey string) bool {

	key := fmt.Sprintf("role:permission:%d", roleID)

	cachedPermissions, err := s.RedisRepo.Get(key)
	if err == nil {

		var permissions []string
		json.Unmarshal([]byte(cachedPermissions), &permissions)

		for _, p := range permissions {
			if strings.TrimSpace(permissionKey) == p {
				return true
			}
		}

		return false
	}

	permissions, err := s.RoleRepo.GetRolePermissions(int(roleID))
	if err != nil {
		return false
	}

	data, _ := json.Marshal(permissions)
	_ = s.RedisRepo.Set(key, string(data), 0)

	return slices.Contains(permissions, strings.TrimSpace(permissionKey))
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
