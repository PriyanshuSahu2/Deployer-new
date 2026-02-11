package models_permission

import "time"

type Permission struct {
	ID          uint   `gorm:"primaryKey"`
	Key         string `gorm:"type:varchar(50)"`
	Description string `gorm:"type:text"`
	CreatedAt   time.Time
}
