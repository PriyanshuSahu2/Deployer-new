package models_integration

import (
	models_base "backend/models/base"
	models_workspace "backend/models/workspace"
)

type WorkspaceGitIntegration struct {
	models_base.BaseModel

	WorkspaceID    uint                       `gorm:"index;not null"`
	Workspace      models_workspace.Workspace `gorm:"foreignKey:WorkspaceID"`
	Provider       string                     `gorm:"type:varchar(50);not null"`
	AccountName    string                     `gorm:"type:varchar(120)"`
	AccountID      string                     `gorm:"type:varchar(120)"`
	AccessToken    string                     `gorm:"type:text"`
	RefreshToken   string                     `gorm:"type:text"`
	InstallationID string                     `gorm:"type:varchar(120)"`
	IsActive       bool                       `gorm:"default:true"`
}
