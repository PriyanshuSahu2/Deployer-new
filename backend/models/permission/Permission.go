package models_permission

import (
	"time"

	"gorm.io/gorm"
)

type Permission struct {
	ID          uint    `gorm:"primaryKey;autoIncrement;type:bigint"`
	Key         string  `gorm:"type:text;uniqueIndex;not null"`
	Module      *string `gorm:"type:text"`
	Description string  `gorm:"type:text"`
	IsSystem    bool    `gorm:"default:true"`
	CreatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (Permission) TableName() string {
	return "role_permissions"
}
