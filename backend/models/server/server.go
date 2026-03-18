package models_server

import (
	models_base "backend/models/base"
	models_workspace "backend/models/workspace"
)

type Server struct {
	models_base.BaseModel

	Name        string                     `gorm:"type:varchar(100);not null"`
	WorkspaceID uint                       `gorm:"index;not null"`
	Workspace   models_workspace.Workspace `gorm:"foreignKey:WorkspaceID"`
	Host        string                     `gorm:"type:varchar(100);not null"`
	Port        int                        `gorm:"default:22"`
	Username    string                     `gorm:"type:varchar(100);not null"`
	AuthType    string                     `gorm:"type:varchar(50);not null"`
	PassKey     string                     `gorm:"type:text"`
	CreatedByID uint                       `gorm:"index;not null"`
}
