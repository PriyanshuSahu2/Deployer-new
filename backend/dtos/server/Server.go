package dtos_server

type CreateServerDTO struct {
	Name           string `json:"name" binding:"required,min=2"`
	Description    string `json:"description"`
	ServiceType    string `json:"service_type" binding:"required"`
	Framework      string `json:"framework" binding:"required"`
	BuildCommand   string `json:"build_command" binding:"required"`
	StartCommand   string `json:"start_command" binding:"required"`
	AppPort        int    `json:"app_port" binding:"required,min=1,max=65535"`
	GitProvider    string `json:"git_provider" binding:"required"`
	Repository     string `json:"repository" binding:"required"`
	Branch         string `json:"branch" binding:"required"`
	Provider       string `json:"provider" binding:"required"`
	Region         string `json:"region" binding:"required"`
	InstanceType   string `json:"instance_type" binding:"required"`
	Strategy       string `json:"strategy" binding:"required"`
	MetricsEnabled bool   `json:"metrics_enabled"`
}

type UpdateServerDTO struct {
	UUID           string `json:"uuid"`
	Name           string `json:"name" binding:"required,min=2"`
	Description    string `json:"description"`
	ServiceType    string `json:"service_type"`
	Framework      string `json:"framework"`
	BuildCommand   string `json:"build_command"`
	StartCommand   string `json:"start_command"`
	AppPort        int    `json:"app_port"`
	GitProvider    string `json:"git_provider"`
	Repository     string `json:"repository"`
	Branch         string `json:"branch"`
	Provider       string `json:"provider"`
	Region         string `json:"region"`
	InstanceType   string `json:"instance_type"`
	Strategy       string `json:"strategy"`
	MetricsEnabled bool   `json:"metrics_enabled"`
}

type ServerResponseDTO struct {
	UUID           string `json:"uuid"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	WorkspaceID    uint   `json:"workspace_id"`
	ServiceType    string `json:"service_type"`
	Framework      string `json:"framework"`
	BuildCommand   string `json:"build_command"`
	StartCommand   string `json:"start_command"`
	AppPort        int    `json:"app_port"`
	GitProvider    string `json:"git_provider"`
	Repository     string `json:"repository"`
	Branch         string `json:"branch"`
	Provider       string `json:"provider"`
	Region         string `json:"region"`
	InstanceType   string `json:"instance_type"`
	Strategy       string `json:"strategy"`
	MetricsEnabled bool   `json:"metrics_enabled"`
	CreatedAt      string `json:"created_at"`
}
