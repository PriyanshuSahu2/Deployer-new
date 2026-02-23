package repositories

import (
	"backend/db"
	models_role "backend/models/role"
)

type RoleRepository struct{}

func NewRoleRepository() *RoleRepository {
	return &RoleRepository{}
}

func (r *RoleRepository) Create(role *models_role.Role) error {
	return db.DB.Create(role).Error
}

func (r *RoleRepository) Update(role *models_role.Role) error {
	return db.DB.Save(role).Error
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
