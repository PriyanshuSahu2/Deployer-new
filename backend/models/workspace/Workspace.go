package models_workspace

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
)

type Workspace struct {
	ID            uint             `gorm:"primaryKey"`
	WorkspaceName string           `gorm:"type:varchar(255)"`
	OwnerID       uint             `gorm:"index"`
	Owner         models_auth.User `gorm:"foreignKey:OwnerID"`

	CreatedByID uint
	CreatedBy   models_auth.User `gorm:"foreignKey:CreatedByID"`

	models_base.BaseModel
}
