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
	"gorm.io/gorm"
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
func (s *RoleService) GetUserRoleID(tx *gorm.DB, workspaceUUID string, userID int) (int, error) {

	key := fmt.Sprintf("workspace:role:%s:%d", workspaceUUID, userID)

	roleStr, err := s.RedisRepo.Get(key)
	if err == nil {

		roleID, err := strconv.Atoi(roleStr)
		if err != nil {
			return 0, err
		}

		return roleID, nil
	}

	if err != redis.Nil {
		return 0, err
	}

	workspaceIdKey := fmt.Sprintf("workspace:uuid:%s", workspaceUUID)

	workspaceIdStr, err := s.RedisRepo.Get(workspaceIdKey)
	if err != redis.Nil {
		return 0, err
	}

	var workspaceID int
	if err == redis.Nil {
		workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)

		if err != nil {
			return 0, err
		}
		workspaceID = int(workspace.ID)
	}
	if err == nil {
		workspaceID, err = strconv.Atoi(workspaceIdStr)
		if err != nil {
			return 0, err
		}

	}
	roleID, err := s.RoleRepo.GetUserRoleID(tx, workspaceID, userID)
	if err != nil || roleID == 0 {
		return 0, err
	}
	_ = s.RedisRepo.Set(key, strconv.Itoa(roleID), 0)

	return roleID, nil
}

func (s *RoleService) CreateRole(tx *gorm.DB, userID uint, dto dtos_roles.CreateRoleDTO) error {

	workspace, err := s.WorkspaceRepo.GetByUUID(tx, dto.WorkspaceUUID)
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

	return s.RoleRepo.Create(tx, &role)
}

func (s *RoleService) UpdateRole(tx *gorm.DB, userID uint, dto dtos_roles.UpdateRoleDTO) error {

	role, err := s.RoleRepo.GetByUUID(tx, &dto.UUID)
	if err != nil {
		return errors.New("role not found")
	}

	// 🔐 RBAC check later

	role.RoleName = dto.RoleName
	role.Description = dto.Description
	return s.RoleRepo.Update(tx, role)
}

func (s *RoleService) ListRoles(tx *gorm.DB, userID uint, workspaceUUID string) ([]dtos_roles.RoleResponseDTO, error) {

	workspace, err := s.WorkspaceRepo.GetByUUID(tx, workspaceUUID)
	if err != nil {
		return nil, errors.New("workspace not found")
	}

	// 🔐 RBAC check later

	roles, err := s.RoleRepo.GetWorkspaceAndSystemRoles(tx, workspace.ID)
	if err != nil {
		return nil, err
	}

	return s.mapToDTO(roles), nil
}

func (s *RoleService) DeleteRole(tx *gorm.DB, userID uint, roleUUID string) error {
	role, err := s.RoleRepo.GetByUUID(tx, &roleUUID)
	if err != nil {
		return errors.New("role not found")
	}

	if role.IsSystem {
		return errors.New("system roles cannot be deleted")
	}

	return s.RoleRepo.Delete(tx, role)
}

func (s *RoleService) ListRolePermissions(tx *gorm.DB, userID uint, roleUUID string) ([]dtos_roles.RolePermissionRowDTO, error) {
	role, err := s.RoleRepo.GetByUUID(tx, &roleUUID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	return s.RoleRepo.ListRolePermissions(nil, role.ID)
}

func (s *RoleService) UpdateRolePermissions(tx *gorm.DB, userID uint, roleUUID string, dto dtos_roles.UpdateRolePermissionsDTO) ([]dtos_roles.RolePermissionRowDTO, error) {
	role, err := s.RoleRepo.GetByUUID(tx, &roleUUID)
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

	if err := s.RoleRepo.ReplaceRolePermissions(tx, role.ID, permissionIDs); err != nil {
		return nil, err
	}

	return s.RoleRepo.ListRolePermissions(tx, role.ID)
}

func (s *RoleService) GetRolePermissions(tx *gorm.DB, roleID uint) ([]string, error) {

	key := fmt.Sprintf("role:permissions:%d", roleID)

	cachedPermissions, err := s.RedisRepo.Get(key)
	if err == nil {

		var permissions []string
		err = json.Unmarshal([]byte(cachedPermissions), &permissions)
		if err == nil {
			return permissions, nil
		}
	}

	permissions, err := s.RoleRepo.GetRolePermissions(tx, int(roleID))
	if err != nil {
		return nil, err
	}

	data, _ := json.Marshal(permissions)
	_ = s.RedisRepo.Set(key, string(data), 0)

	return permissions, nil
}

func (s *RoleService) RoleHasPermission(tx *gorm.DB, roleID uint, permissionKey string) bool {

	permissions, err := s.GetRolePermissions(tx, roleID)
	if err != nil {
		return false
	}

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
