package models_workspace

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
	models_role "backend/models/role"
)

type WorkspaceMember struct {
	ID          uint             `gorm:"primaryKey"`
	WorkspaceID uint             `gorm:"index"`
	UserId      uint             `gorm:"index"`
	User        models_auth.User `gorm:"foreignKey:UserId" json:"-"`
	RoleID      uint             `gorm:"index"`
	Role        models_role.Role `gorm:"foreignKey:RoleID" json:"-"`
	Status      string           `gorm:"type:varchar(20)"`
	InvitedByID uint
	InvitedBy   models_auth.User `gorm:"foreignKey:InvitedByID" json:"-"`
	models_base.BaseModel
}
