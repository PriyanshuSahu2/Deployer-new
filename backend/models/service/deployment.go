package models_service

import (
	models_base "backend/models/base"
	"time"
)

type Deployment struct {
	models_base.BaseModel
	ServiceID uint           `gorm:"index;not null"`
	Service   Service        `gorm:"foreignKey:ServiceID"`
	Status    string         `gorm:"type:varchar(20);default:'pending'"` // 'pending', 'deploying', 'success', 'failed'
	Logs      string         `gorm:"type:text"`
	StartTime time.Time
	EndTime   *time.Time
}
