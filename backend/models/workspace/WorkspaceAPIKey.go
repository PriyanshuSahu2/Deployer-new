package models_workspace

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
	"time"
)

type WorkspaceAPIKey struct {
	models_base.BaseModel

	WorkspaceID uint      `gorm:"index;not null"`
	Workspace   Workspace `gorm:"foreignKey:WorkspaceID"`

	Name      string `gorm:"type:varchar(120);not null"`
	KeyHash   string `gorm:"type:varchar(128);uniqueIndex;not null"`
	KeyPrefix string `gorm:"type:varchar(16);index;not null"`

	CreatedByID uint             `gorm:"index;not null"`
	CreatedBy   models_auth.User `gorm:"foreignKey:CreatedByID"`

	LastUsedAt *time.Time
	RevokedAt  *time.Time `gorm:"index"`
}
