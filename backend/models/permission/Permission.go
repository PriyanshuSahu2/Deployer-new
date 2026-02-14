package models_permission

import (
	"time"

	"gorm.io/gorm"
)

type Permission struct {
	ID          uint   `gorm:"primaryKey"`
	Key         string `gorm:"type:varchar(100);uniqueIndex;not null"`
	Description string `gorm:"type:text"`
	IsSystem    bool   `gorm:"default:true"`
	CreatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}
