package models_auth

import (
	models_base "backend/models/base"
)

type User struct {
	models_base.BaseModel

	ID            uint   `gorm:"primaryKey" json:"id"`
	Name          string `gorm:"size:100;" json:"name"`
	Username      string `gorm:"size:100;" json:"username"`
	Email         string `gorm:"unique;not null" json:"email"`
	EmailVerified bool   `gorm:"default:false" json:"email_verified"`
	Password      string `json:"-"`
	GithubID      string `gorm:"uniqueIndex" json:"-"`
	GoogleID      string `gorm:"uniqueIndex" json:"-"`
}
