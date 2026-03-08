package models_project

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
	models_workspace "backend/models/workspace"
)

type Project struct {
	models_base.BaseModel

	Name        string                     `gorm:"type:varchar(255);not null;index:idx_workspace_project"`
	Description string                     `gorm:"type:text"`
	Framework   string                     `gorm:"type:varchar(100)"`
	WorkspaceID uint                       `gorm:"index;not null"`
	Workspace   models_workspace.Workspace `gorm:"foreignKey:WorkspaceID"`
	CreatedBy   uint                       `gorm:"index;not null"`
	Creator     models_auth.User           `gorm:"foreignKey:CreatedBy"`
	IsArchived  bool                       `gorm:"default:false"`
}
