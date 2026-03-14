package models_service

import models_base "backend/models/base"

type ServiceGitConfig struct {
	models_base.BaseModel

	ServiceID uint    `gorm:"index;not null;unique"`
	Service   Service `gorm:"foreignKey:ServiceID"`

	Provider      string `gorm:"type:varchar(50)"`
	RepositoryURL string `gorm:"type:text;not null"`
	Branch        string `gorm:"type:varchar(120);default:main"`
	SubDirectory  string `gorm:"type:text"`

	AuthType      string `gorm:"type:varchar(30)"`
	SSHKeyID      *uint  `gorm:"index"`
	AccessTokenID *uint  `gorm:"index"`

	AutoDeploy     bool `gorm:"default:false"`
	WebhookEnabled bool `gorm:"default:false"`
}
