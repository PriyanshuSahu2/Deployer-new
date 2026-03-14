package dtos_service

type CreateServiceDTO struct {
	Name          string `json:"name" binding:"required"`
	EnvironmentID uint   `json:"environmentId" binding:"required"`

	Type        string `json:"type"`
	Framework   string `json:"framework"`
	Description string `json:"description"`

	BuildCommand string `json:"buildCommand"`
	StartCommand string `json:"startCommand"`
	DeployPath   string `json:"deployPath"`

	Server ServerConfigDTO `json:"server"`

	Git GitConfigDTO `json:"git"`

	EnvVariables []EnvVariableDTO `json:"envVariables"`
}

type ServiceCreationResponseDTO struct {
	ID            uint   `json:"id"`
	Name          string `json:"name"`
	ProjectID     uint   `json:"projectId"`
	EnvironmentID uint   `json:"environmentId"`

	Type        string `json:"type"`
	Framework   string `json:"framework"`
	Description string `json:"description"`

	BuildCommand string `json:"buildCommand"`
	StartCommand string `json:"startCommand"`
	DeployPath   string `json:"deployPath"`
	CreatedAt    string `json:"createdAt"`
}

type GitConfigDTO struct {
	Provider      string `json:"provider"`
	RepositoryURL string `json:"repositoryUrl"`
	Branch        string `json:"branch"`
	SubDirectory  string `json:"subDirectory"`

	AuthType string `json:"authType"`
}

type EnvVariableDTO struct {
	Key   string `json:"key" binding:"required"`
	Value string `json:"value"`

	IsSecret        bool `json:"isSecret"`
	IsBuildVariable bool `json:"isBuildVariable"`
}

type ServerConfigDTO struct {
	ServerID *uint `json:"serverId"`

	Name     string `json:"name"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
}
