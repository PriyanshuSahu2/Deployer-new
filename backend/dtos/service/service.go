package dtos_service

import (
	dtos_environment "backend/dtos/environment"
	dtos_project "backend/dtos/project"
)

type CreateServiceDTO struct {
	Name            string `json:"name" binding:"required"`
	ProjectUUID     string `json:"projectUuid" binding:"required"`
	EnvironmentUUID string `json:"environmentUuid"`

	Type        string `json:"type"`
	Framework   string `json:"framework"`
	Description string `json:"description"`

	BuildCommand  string `json:"buildCommand"`
	StartCommand  string `json:"startCommand"`
	DeployPath    string `json:"deployPath"`
	Port            int    `json:"port" binding:"required"`
	OutputDirectory string `json:"outputDirectory"`
	DockerizeType   string `json:"dockerizeType" binding:"required"`

	Domain       string `json:"domain"`
	HttpsEnabled bool   `json:"httpsEnabled"`
	CertType     string `json:"certType"`
	CustomCert   string `json:"customCert"`
	CustomKey    string `json:"customKey"`

	ServerUUID string `json:"serverId" binding:"required"`

	Git GitConfigDTO `json:"git"`

	EnvVariables []EnvVariableDTO `json:"envVariables"`
}

type UpdateServiceDTO struct {
	Name            string `json:"name" binding:"required"`
	ProjectUUID     string `json:"projectUuid" binding:"required"`
	EnvironmentUUID string `json:"environmentUuid"`

	Type        string `json:"type"`
	Framework   string `json:"framework"`
	Description string `json:"description"`

	BuildCommand  string `json:"buildCommand"`
	StartCommand  string `json:"startCommand"`
	DeployPath    string `json:"deployPath"`
	Port            int    `json:"port" binding:"required"`
	OutputDirectory string `json:"outputDirectory"`
	DockerizeType   string `json:"dockerizeType" binding:"required"`

	Domain       string `json:"domain"`
	HttpsEnabled bool   `json:"httpsEnabled"`
	CertType     string `json:"certType"`
	CustomCert   string `json:"customCert"`
	CustomKey    string `json:"customKey"`

	ServerUUID string `json:"serverId" binding:"required"`

	Git GitConfigDTO `json:"git"`

	EnvVariables []EnvVariableDTO `json:"envVariables"`
}

type ServiceCreationResponseDTO struct {
	UUID            string `json:"uuid"`
	Name            string `json:"name"`
	ProjectID       uint   `json:"projectId"`
	EnvironmentID   uint   `json:"environmentId"`
	EnvironmentUUID string `json:"environmentUuid"`

	Type        string `json:"type"`
	Framework   string `json:"framework"`
	Description string `json:"description"`

	BuildCommand  string `json:"buildCommand"`
	StartCommand  string `json:"startCommand"`
	DeployPath    string `json:"deployPath"`
	Port            int    `json:"port"`
	OutputDirectory string `json:"outputDirectory"`
	DockerizeType   string `json:"dockerizeType"`

	Domain       string `json:"domain"`
	HttpsEnabled bool   `json:"httpsEnabled"`
	CertType     string `json:"certType"`
	CustomCert   string `json:"customCert"`
	CustomKey    string `json:"customKey"`

	CreatedAt    string `json:"createdAt"`
}

type GitConfigDTO struct {
	Provider      string `json:"provider"`
	RepositoryURL string `json:"repositoryUrl"`
	Branch        string `json:"branch"`
	SubDirectory  string `json:"subDirectory"`

	AuthType string `json:"authType"`

	AutoDeploy     bool `json:"autoDeploy"`
	WebhookEnabled bool `json:"webhookEnabled"`
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
	PassKey  string `json:"passKey"`
	AuthType string `json:"authType"`
}

type ServiceDetailsResponseDTO struct {
	ServiceCreationResponseDTO                                          // Embed base service fields
	Git                        *GitConfigDTO                            `json:"git"`          // Git configuration details
	EnvVariables               []EnvVariableDTO                         `json:"envVariables"` // Environment variables slice
	Server                     *ServerConfigDTO                         `json:"server"`
	Project                    *dtos_project.ProjectResponseDTO         `json:"project"`
	Environment                *dtos_environment.ResponseEnvironmentDTO `json:"environment"`
}
