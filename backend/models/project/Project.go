package models_project

type ProjectType string

const (
	Github    ProjectType = "github"
	ZIP       ProjectType = "zip"
	Bitbucket ProjectType = "bitbucket"
	Gitlab    ProjectType = "gitlab"
)

type Project struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	UserID      uint        `json:"user_id"`
	ProjectType ProjectType `gorm:"type:enum('github','zip','bitbucket','gitlab')" json:"project_type"`
	Status      string      `gorm:"type:varchar(50)" json:"status"`
}
