package dtos_project

type CreateProjectDTO struct {
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
	Framework   string `json:"framework"`
}

type UpdateProjectDTO struct {
	UUID        string `json:"uuid"`
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
	Framework   string `json:"framework"`
}

type ProjectResponseDTO struct {
	UUID        string `json:"uuid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Framework   string `json:"framework"`
	WorkspaceID uint   `json:"workspace_id"`
	CreatedBy   uint   `json:"created_by"`
	CreatedAt   string `json:"created_at"`
}

type ProjectCreation struct {
	UserID      uint   `json:"user_id"`
	ProjectType string `json:"project_type"`
	Status      string `json:"status"`

	ProviderType   string          `json:"provider_type"`
	ProviderConfig *GitProviderDTO `json:"provider_config,omitempty"`

	ZIPConfig *ZIPProjectDTO `json:"zip_config,omitempty"`

	ProjectConfig    *ProjectConfigDTO    `json:"project_config,omitempty"`
	DeploymentConfig *DeploymentConfigDTO `json:"deployment_config,omitempty"` // <-- Add this
}

type DeploymentConfigDTO struct {
	Type        string              `json:"type"` // "ssh" or "token"
	SSHConfig   *SSHDeploymentDTO   `json:"ssh_config,omitempty"`
	TokenConfig *TokenDeploymentDTO `json:"token_config,omitempty"`
}

type SSHDeploymentDTO struct {
	Host       string `json:"host"`
	Port       string `json:"port"`
	Username   string `json:"username"`
	PrivateKey string `json:"private_key"`
	Passphrase string `json:"passphrase,omitempty"`
}

type TokenDeploymentDTO struct {
	Token  string `json:"token"`
	APIURL string `json:"api_url"`
	Scopes string `json:"scopes,omitempty"`
}

type GitProviderDTO struct {
	RepoLink    string `json:"repo_link"`
	Branch      string `json:"branch"`
	AccessToken string `json:"access_token,omitempty"`
	SSHKey      string `json:"ssh_key,omitempty"`
}

type ZIPProjectDTO struct {
	FilePath string `json:"file_path"`
}

type ProjectConfigDTO struct {
	BuildPath     string            `json:"build_path"`
	BuildCommands []string          `json:"build_commands"`
	RunCommands   []string          `json:"run_commands"`
	Environment   map[string]string `json:"environment"`
	Port          string            `json:"port"`
	AutoDeploy    bool              `json:"auto_deploy"`
}
