package models_workspace

import (
	models_permission "backend/models/permission"
	models_role "backend/models/role"
)

type WorkspacePermission struct {
	RoleID       uint                         `gorm:"primaryKey;type:bigint"`
	Role         models_role.Role             `gorm:"foreignKey:RoleID" json:"-"`
	PermissionID uint                         `gorm:"primaryKey;type:bigint"`
	Permission   models_permission.Permission `gorm:"foreignKey:PermissionID" json:"-"`
}

func (WorkspacePermission) TableName() string {
	return "workspace_permissions"
}
