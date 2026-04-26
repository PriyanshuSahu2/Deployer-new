package models_workspace

import (
	models_auth "backend/models/auth"
	models_base "backend/models/base"
)

type Workspace struct {
	ID            uint             `gorm:"primaryKey"`
	WorkspaceName string           `gorm:"type:varchar(255)"`
	Slug          string           `gorm:"type:varchar(120);index"`
	OwnerID       uint             `gorm:"index"`
	Owner         models_auth.User `gorm:"foreignKey:OwnerID"`

	CreatedByID uint
	CreatedBy   models_auth.User `gorm:"foreignKey:CreatedByID"`

	DefaultBranch              string `gorm:"type:varchar(120);default:'main'"`
	AutoDeployDefault          bool   `gorm:"default:true"`
	DefaultEnvironmentName     string `gorm:"type:varchar(120);default:'production'"`
	DeploymentTimeoutSeconds   int    `gorm:"default:300"`
	AllowedEmailDomains        string `gorm:"type:text"`
	EnforceInviteRestrictions  bool   `gorm:"default:false"`
	RequireTwoFactor           bool   `gorm:"default:false"`
	EnablePreviewDeployments   bool   `gorm:"default:true"`
	EnableExperimentalFeatures bool   `gorm:"default:false"`

	models_base.BaseModel
}
