package models_role

import (
	"time"

	"github.com/google/uuid"
)

type Role struct {
	ID          uint      `gorm:"primaryKey"`
	UUID        uuid.UUID `gorm:"type:varchar(255)"`
	RoleName    string    `gorm:"type:varchar(255)"`
	WorkspaceID uint      `gorm:"index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   time.Time
	IsDeleted   bool `gorm:"default:false"`
}
