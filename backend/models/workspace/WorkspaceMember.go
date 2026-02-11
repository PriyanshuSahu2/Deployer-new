package models_workspace

import (
	models_auth "backend/models/auth"
	models_role "backend/models/role"
	"time"

	"github.com/google/uuid"
)

type WorkspaceMember struct {
	ID          uint             `gorm:"primaryKey"`
	UUID        uuid.UUID        `gorm:"type:varchar(255)"`
	WorkspaceID uint             `gorm:"index"`
	UserId      uint             `gorm:"index"`
	User        models_auth.User `gorm:"foreignKey:UserId" json:"-"`
	RoleID      uint             `gorm:"index"`
	Role        models_role.Role `gorm:"foreignKey:RoleID" json:"-"`
	Status      string           `gorm:"type:varchar(20)"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   time.Time
	IsDeleted   bool `gorm:"default:false"`
}
