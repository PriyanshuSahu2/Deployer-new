package models_service

import (
	models_base "backend/models/base"
	models_environment "backend/models/environment"
	models_project "backend/models/project"
	models_server "backend/models/server"
)

type Service struct {
	models_base.BaseModel
	Name          string                         `gorm:"type:varchar(120);not null;uniqueIndex:idx_env_service"`
	EnvironmentID uint                           `gorm:"index;not null;uniqueIndex:idx_env_service"`
	Environment   models_environment.Environment `gorm:"foreignKey:EnvironmentID"`
	Type          string                         `gorm:"type:varchar(50);default:web"`
	Framework     string                         `gorm:"type:varchar(50)"`
	Description   string                         `gorm:"type:text"`
	BuildCommand  string                         `gorm:"type:text"`
	StartCommand  string                         `gorm:"type:text"`
	DeployPath    string                         `gorm:"type:text"`
	Port            int                            `gorm:"type:int;default:3000"`
	OutputDirectory string                         `gorm:"type:varchar(255);default:'dist'"`
	DockerizeType   string                         `gorm:"type:varchar(20);default:'auto'"`
	ServerID      *uint                          `gorm:"index"`
	Server        *models_server.Server          `gorm:"foreignKey:ServerID"`
	ProjectID     uint                           `gorm:"index;not null;uniqueIndex:idx_env_service"`
	Project       models_project.Project         `gorm:"foreignKey:ProjectID"`

	Domain        string `gorm:"type:varchar(255)"`
	HttpsEnabled  bool   `gorm:"default:false"`
	CertType      string `gorm:"type:varchar(20);default:'none'"` // 'none', 'auto', 'custom'
	CustomCert    string `gorm:"type:text"`
	CustomKey     string `gorm:"type:text"`

	GitConfig     *ServiceGitConfig    `gorm:"foreignKey:ServiceID"`
	EnvVariables  []ServiceEnvVariable `gorm:"foreignKey:ServiceID"`
}
