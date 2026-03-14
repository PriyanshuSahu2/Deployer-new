package models_service

import models_base "backend/models/base"

type ServiceEnvVariable struct {
	models_base.BaseModel

	ServiceID uint    `gorm:"index;not null;uniqueIndex:idx_service_env"`
	Service   Service `gorm:"foreignKey:ServiceID"`

	Key   string `gorm:"type:varchar(120);not null;uniqueIndex:idx_service_env"`
	Value string `gorm:"type:text"`

	IsSecret        bool `gorm:"default:false"`
	IsBuildVariable bool `gorm:"default:false"`
}
