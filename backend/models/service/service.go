package models_service

import (
	models_base "backend/models/base"
	models_environment "backend/models/environment"
	models_server "backend/models/server"
)

type Service struct {
	models_base.BaseModel

	Name          string                         `gorm:"type:varchar(120);not null;uniqueIndex:idx_env_service"`
	EnvironmentID uint                           `gorm:"index;not null;uniqueIndex:idx_env_service"`
	Environment   models_environment.Environment `gorm:"foreignKey:EnvironmentID"`
	Type          string                         `gorm:"type:varchar(50);default:web"`
	RepositoryURL string                         `gorm:"type:text"`
	Branch        string                         `gorm:"type:varchar(120)"`
	BuildCommand  string                         `gorm:"type:text"`
	StartCommand  string                         `gorm:"type:text"`
	DeployPath    string                         `gorm:"type:text"`
	ServerID      *uint                          `gorm:"index"`
	Server        *models_server.Server          `gorm:"foreignKey:ServerID"`
}
