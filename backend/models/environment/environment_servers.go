package models_environment

import (
	models_base "backend/models/base"
	models_server "backend/models/servers"
)

type EnvironmentServer struct {
	models_base.BaseModel
	EnvironmentID uint                 `gorm:"index;not null"`
	ServerID      uint                 `gorm:"index;not null"`
	Server        models_server.Server `gorm:"foreignKey:ServerID"`
	DeployPath    string               `gorm:"type:text"`
}
