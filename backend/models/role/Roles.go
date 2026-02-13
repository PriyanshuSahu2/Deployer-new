package models_role

import (
	"time"

	models_auth "backend/models/auth"

	"github.com/google/uuid"
)

type Role struct {
	ID          uint             `gorm:"primaryKey"`
	UUID        uuid.UUID        `gorm:"type:varchar(255)"`
	RoleName    string           `gorm:"type:varchar(255)"`
	WorkspaceID uint             `gorm:"index"`
	CreatedBy   uint             `gorm:"index"`
	Creator     models_auth.User `gorm:"foreignKey:CreatedBy"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   time.Time
	IsDeleted   bool `gorm:"default:false"`
}
