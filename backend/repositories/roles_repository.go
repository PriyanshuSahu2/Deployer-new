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

func (r *RoleRepository) Create(role *models_role.Role) error {
	return db.DB.Create(role).Error
}

func (r *RoleRepository) Update(role *models_role.Role) error {
	return db.DB.Model(&models_role.Role{}).
		Where("id = ?", role.ID).
		Updates(map[string]interface{}{
			"role_name":   role.RoleName,
			"description": role.Description,
		}).Error
}

func (r *RoleRepository) GetByUUID(uuid *string) (*models_role.Role, error) {
	var role models_role.Role
	err := db.DB.Where("uuid = ?", uuid).First(&role).Error
	return &role, err
}

func (r *RoleRepository) GetWorkspaceAndSystemRoles(workspaceID uint) ([]models_role.Role, error) {
	var roles []models_role.Role
	err := db.DB.
		Where("workspace_id = ? OR is_system = ?", workspaceID, true).
		Find(&roles).Error

	return roles, err
}

func (r *RoleRepository) Delete(role *models_role.Role) error {
	return db.DB.Delete(role).Error
}

func (r *RoleRepository) ListRolePermissions(roleID uint) ([]dtos_roles.RolePermissionRowDTO, error) {
	var rows []dtos_roles.RolePermissionRowDTO

	err := db.DB.
		Table("permissions AS p").
		Select(`
			p.id AS permission_id,
			p.key AS key,
			p.module AS module,
			p.description AS description,
			rp.permission_id AS role_permission_id,
			CASE WHEN rp.permission_id IS NULL THEN false ELSE true END AS allowed
		`).
		Joins(`
			LEFT JOIN role_permissions AS rp
			ON rp.permission_id = p.id
			AND rp.role_id = ?
			AND rp.deleted_at IS NULL
		`, roleID).
		Where("p.deleted_at IS NULL").
		Order("p.id ASC").
		Scan(&rows).Error

	return rows, err
}

func (r *RoleRepository) ReplaceRolePermissions(roleID uint, permissionIDs []uint) error {
	return db.DB.Transaction(func(tx *gorm.DB) error {
		// Hard-delete existing role-permission rows so the same composite PK
		// can be inserted again without unique conflicts.
		if err := tx.Unscoped().Where("role_id = ?", roleID).Delete(&models_role_permission.RolePermission{}).Error; err != nil {
			return err
		}

		if len(permissionIDs) == 0 {
			return nil
		}

		records := make([]models_role_permission.RolePermission, 0, len(permissionIDs))
		for _, permissionID := range permissionIDs {
			records = append(records, models_role_permission.RolePermission{
				RoleID:       roleID,
				PermissionID: permissionID,
			})
		}

		if err := tx.Create(&records).Error; err != nil {
			return err
		}

		return nil
	})
}
