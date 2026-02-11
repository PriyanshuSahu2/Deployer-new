package models_workspace

import (
	models_permission "backend/models/permission"
	models_role "backend/models/role"
)

type WorkspacePermission struct {
	RoleID       uint                         `gorm:"index"`
	Role         models_role.Role             `gorm:"foreignKey:RoleID" json:"-"`
	PermissionID uint                         `gorm:"index"`
	Permission   models_permission.Permission `gorm:"foreignKey:PermissionID" json:"-"`
}
