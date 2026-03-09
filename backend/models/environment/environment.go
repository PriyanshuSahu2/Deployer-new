package models_environment

import (
	models_base "backend/models/base"
	models_project "backend/models/project"
)

type Environment struct {
	models_base.BaseModel

	Name      string                 `gorm:"type:varchar(80);not null"`
	Slug      string                 `gorm:"type:varchar(80);index"`
	ProjectID uint                   `gorm:"index;not null"`
	Project   models_project.Project `gorm:"foreignKey:ProjectID"`
	CreatedBy uint                   `gorm:"index"`
}
