package models_project

import "time"

type SSHDeploymentConfig struct {
	ID                 uint   `gorm:"primaryKey" json:"id"`
	DeploymentConfigID uint   `json:"deployment_config_id"` // FK to DeploymentConfig
	Host               string `gorm:"type:varchar(255)" json:"host"`
	Port               string `gorm:"type:varchar(10)" json:"port"` // usually "22"
	Username           string `gorm:"type:varchar(100)" json:"username"`
	PrivateKey         string `gorm:"type:text" json:"private_key"`          // can store as string or path
	Passphrase         string `gorm:"type:text" json:"passphrase,omitempty"` // optional if key is encrypted
}

type TokenDeploymentConfig struct {
	ID                 uint   `gorm:"primaryKey" json:"id"`
	DeploymentConfigID uint   `json:"deployment_config_id"` // FK to DeploymentConfig
	Token              string `gorm:"type:text" json:"token"`
	APIURL             string `gorm:"type:varchar(255)" json:"api_url"`
	Scopes             string `gorm:"type:text" json:"scopes,omitempty"` // optional, comma-separated
}

// Base deployment config
type DeploymentConfig struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	ProjectID uint    `json:"project_id"` // FK to Project
	Project   Project `gorm:"foreignKey:ProjectID" json:"-"`

	Type      string    `gorm:"type:varchar(50)" json:"type"` // e.g., "ssh", "token"
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	SSHConfig   *SSHDeploymentConfig   `gorm:"foreignKey:DeploymentConfigID" json:"ssh_config,omitempty"`
	TokenConfig *TokenDeploymentConfig `gorm:"foreignKey:DeploymentConfigID" json:"token_config,omitempty"`
}
