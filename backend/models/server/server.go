package models_server

import (
	models_base "backend/models/base"
	models_workspace "backend/models/workspace"
)

type Server struct {
	models_base.BaseModel

	Name        string                     `gorm:"type:varchar(120);not null"`
	Description string                     `gorm:"type:text"`
	WorkspaceID uint                       `gorm:"index;not null"`
	Workspace   models_workspace.Workspace `gorm:"foreignKey:WorkspaceID"`

	// App / runtime
	ServiceType  string `gorm:"type:varchar(50);default:web"`
	Framework    string `gorm:"type:varchar(100)"`
	BuildCommand string `gorm:"type:text"`
	StartCommand string `gorm:"type:text"`
	AppPort      int    `gorm:"default:3000"`

	// Git
	GitProvider string `gorm:"type:varchar(50)"`
	Repository  string `gorm:"type:text"`
	Branch      string `gorm:"type:varchar(120);default:main"`

	// Infrastructure
	Provider     string `gorm:"type:varchar(50)"`
	Region       string `gorm:"type:varchar(80)"`
	InstanceType string `gorm:"type:varchar(120)"`

	// Deployment
	Strategy       string `gorm:"type:varchar(50);default:rolling"`
	MetricsEnabled bool   `gorm:"default:true"`

	// SSH / legacy infra fields (kept for backward compat)
	Host     string `gorm:"type:varchar(255)"`
	Port     int    `gorm:"default:22"`
	Username string `gorm:"type:varchar(120)"`
	AuthType string `gorm:"type:varchar(40)"`
	SSHKeyID *uint  `gorm:"index"`
}
