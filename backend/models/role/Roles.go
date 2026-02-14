package models_role

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
)

type Role struct {
	ID          uint             `gorm:"primaryKey"`
	RoleName    string           `gorm:"type:varchar(255)"`
	WorkspaceID *uint            `gorm:"index"`
	CreatedByID uint             `gorm:"index"`
	CreatedBy   models_auth.User `gorm:"foreignKey:CreatedByID"`
	IsSystem    bool             `gorm:"default:false"`
	models_base.BaseModel
}
