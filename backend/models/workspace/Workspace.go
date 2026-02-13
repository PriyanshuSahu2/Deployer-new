package models_workspace

import (
	models_auth "backend/models/auth"
	"time"

	"github.com/google/uuid"
)

type Workspace struct {
	ID            uint             `gorm:"primaryKey"`
	UUID          uuid.UUID        `gorm:"type:varchar(255)"`
	WorkspaceName string           `gorm:"type:varchar(255)"`
	OwnerID       uint             `gorm:"index"`
	Owner         models_auth.User `gorm:"foreignKey:OwnerID"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     time.Time
	IsDeleted     bool `gorm:"default:false"`
}
