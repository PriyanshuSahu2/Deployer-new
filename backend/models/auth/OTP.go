package models_auth

import (
	"time"
)

type OTP struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"index;not null" json:"email"`
	OTPCode   string    `gorm:"not null" json:"-"`
	Purpose   string    `gorm:"size:50;not null" json:"purpose"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"created_at"`
}
