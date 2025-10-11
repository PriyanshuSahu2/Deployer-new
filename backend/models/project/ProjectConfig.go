package models_project

import "time"

type ProjectProviderConfig struct {
	ID          uint    `gorm:"primaryKey"`
	ProjectID   uint    `gorm:"index"`
	Project     Project `gorm:"foreignKey:ProjectID" json:"-"`
	RepoLink    string  `gorm:"type:varchar(255)"`
	Branch      string  `gorm:"type:varchar(50)"`
	AccessToken string  `gorm:"type:text"`
	SSHKey      string  `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type ZIPProjectConfig struct {
	ID        uint    `gorm:"primaryKey"`
	ProjectID uint    `gorm:"index"`
	Project   Project `gorm:"foreignKey:ProjectID" json:"-"`
	FilePath  string  `gorm:"type:varchar(255)"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ProjectConfig struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ProjectID       uint      `json:"project_id"`
	Project         Project   `gorm:"foreignKey:ProjectID" json:"-"`
	BuildPath       string    `gorm:"type:varchar(255)" json:"build_path"`
	BuildCommands   string    `gorm:"type:text" json:"build_commands"`
	RunCommands     string    `gorm:"type:text" json:"run_commands"`
	Environment     string    `gorm:"type:text" json:"environment"`
	Port            string    `gorm:"type:varchar(20)" json:"port"`
	AutoDeploy      bool      `gorm:"default:false" json:"auto_deploy"`
	LastDeployed    time.Time `json:"last_deployed"`
	LastBuildAt     time.Time `json:"last_build_at"`
	LastBuildStatus string    `gorm:"type:varchar(20)" json:"last_build_status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
