package models_base

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint      `gorm:"primaryKey"`
	UUID      uuid.UUID `gorm:"type:uuid;uniqueIndex"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index" swaggerignore:"true"`
}

func (b *BaseModel) BeforeCreate(tx *gorm.DB) (err error) {
	if b.UUID == uuid.Nil {
		b.UUID = uuid.New()
	}
	return
}
