package repositories

import (
	"backend/db"
	dtos_roles "backend/dtos/roles"
	models_role "backend/models/role"
	models_role_permission "backend/models/role_permission"

	"gorm.io/gorm"
)

type RoleRepository struct{}

func NewRoleRepository() *RoleRepository {
	return &RoleRepository{}
}

func (r *RoleRepository) Create(tx *gorm.DB, role *models_role.Role) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(role).Error
}

func (r *RoleRepository) Update(tx *gorm.DB, role *models_role.Role) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Model(&models_role.Role{}).
		Where("id = ?", role.ID).
		Updates(map[string]interface{}{
			"role_name":   role.RoleName,
			"description": role.Description,
		}).Error
}

func (r *RoleRepository) GetByUUID(tx *gorm.DB, uuid *string) (*models_role.Role, error) {
	var role models_role.Role
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("uuid = ?", uuid).First(&role).Error
	return &role, err
}

func (r *RoleRepository) GetWorkspaceAndSystemRoles(tx *gorm.DB, workspaceID uint) ([]models_role.Role, error) {
	var roles []models_role.Role
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.
		Where("workspace_id = ? OR is_system = ?", workspaceID, true).
		Find(&roles).Error

	return roles, err
}

func (r *RoleRepository) GetSystemRoleByName(tx *gorm.DB, roleName string) (*models_role.Role, error) {
	var role models_role.Role
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Where("LOWER(TRIM(role_name)) = LOWER(TRIM(?)) AND is_system = ? AND workspace_id IS NULL", roleName, true).
		First(&role).Error

	return &role, err
}

func (r *RoleRepository) Delete(tx *gorm.DB, role *models_role.Role) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Delete(role).Error
}

func (r *RoleRepository) ListRolePermissions(tx *gorm.DB, roleID uint) ([]dtos_roles.RolePermissionRowDTO, error) {
	var results []dtos_roles.RolePermissionRowDTO
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Table("permissions").
		Select("permissions.id as permission_id, permissions.name as permission_name, permissions.key as permission_key, roles.role_name, (role_permissions.role_id IS NOT NULL) as allowed").
		Joins("CROSS JOIN roles").
		Joins("LEFT JOIN role_permissions ON role_permissions.permission_id = permissions.id AND role_permissions.role_id = roles.id").
		Where("roles.id = ?", roleID).
		Scan(&results).Error

	return results, err
}

func (r *RoleRepository) ReplaceRolePermissions(tx *gorm.DB, roleID uint, permissionIDs []uint) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	return query.Transaction(func(tx2 *gorm.DB) error {
		// Remove old
		if err := tx2.Where("role_id = ?", roleID).Delete(&models_role_permission.RolePermission{}).Error; err != nil {
			return err
		}

		// Add new
		for _, pID := range permissionIDs {
			rp := models_role_permission.RolePermission{
				RoleID:       roleID,
				PermissionID: pID,
			}
			if err := tx2.Create(&rp).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *RoleRepository) GetUserRoleID(tx *gorm.DB, workspaceID int, userID int) (int, error) {
	var roleID int
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Table("workspace_members").
		Select("role_id").
		Where("workspace_id = ? AND user_id = ?", workspaceID, userID).
		Scan(&roleID).Error

	if err != nil {
		return 0, err
	}

	return roleID, nil
}

func (r *RoleRepository) RoleHasPermission(tx *gorm.DB, roleID int, permissionKey string) (bool, error) {
	var exists int
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Table("role_permissions AS rp").
		Select("1").
		Joins("JOIN permissions AS p ON rp.permission_id = p.id").
		Where("rp.role_id = ? AND p.key = ?", roleID, permissionKey).
		Limit(1).
		Scan(&exists).Error

	if err != nil {
		return false, err
	}

	return exists == 1, nil
}
func (r *RoleRepository) GetRolePermissions(tx *gorm.DB, roleID int) ([]string, error) {
	var permissions []string
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Table("permissions").
		Select("permissions.key").
		Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
		Where("role_permissions.role_id = ?", roleID).
		Pluck("key", &permissions).Error

	return permissions, err
}
