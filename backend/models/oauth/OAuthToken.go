package models_oauth

import (
	"time"
)

type OAuthToken struct {
	ID           uint       `gorm:"primaryKey"`
	UserID       uint       `gorm:"index"`
	Username     string     `gorm:"type:text"`            // reference to User
	Provider     string     `gorm:"size:50;index"`        // e.g., "github", "google"
	AccessToken  string     `gorm:"type:text"`            // store securely
	TokenType    string     `gorm:"size:50"`              // e.g., "bearer"
	Scope        string     `gorm:"type:text"`            // optional (e.g., user:email, repo)
	ExpiresAt    *time.Time `json:"expires_at,omitempty"` // nullable (GitHub tokens may not expire)
	RefreshToken string     `gorm:"type:text"`            // nullable (GitHub doesn’t provide)
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
