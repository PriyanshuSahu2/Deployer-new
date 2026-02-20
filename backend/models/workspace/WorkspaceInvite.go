package models_workspace

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
	models_role "backend/models/role"
	"time"
)

type InviteStatus string

const (
	InvitePending  InviteStatus = "PENDING"
	InviteAccepted InviteStatus = "ACCEPTED"
	InviteDeclined InviteStatus = "DECLINED"
	InviteExpired  InviteStatus = "EXPIRED"
)

type WorkspaceInvite struct {
	ID          uint             `gorm:"primaryKey"`
	WorkspaceID uint             `gorm:"index"`
	Workspace   Workspace        `gorm:"foreignKey:WorkspaceID"`
	Email       string           `gorm:"index"`
	RoleID      uint             `gorm:"index"`
	Role        models_role.Role `gorm:"foreignKey:RoleID"`
	Token       string           `gorm:"uniqueIndex"`
	Status      InviteStatus     `gorm:"type:varchar(20);default:'PENDING'"`
	InvitedByID uint             `gorm:"index"`
	Inviter     models_auth.User `gorm:"foreignKey:InvitedByID"`
	ExpiresAt   time.Time
	models_base.BaseModel
}
