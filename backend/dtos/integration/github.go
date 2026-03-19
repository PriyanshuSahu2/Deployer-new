package dtos_integration

type GithubAuthRequestDTO struct {
	WorkspaceUUID string `json:"workspaceUuid" binding:"required"`
}

type GithubAuthCallbackDTO struct {
	Code          string `form:"code" binding:"required"`
	State         string `form:"state" binding:"required"`
}

type IntegrationResponseDTO struct {
	ID             uint   `json:"id"`
	WorkspaceID    uint   `json:"workspaceId"`
	Provider       string `json:"provider"`
	AccountName    string `json:"accountName"`
	AccountID      string `json:"accountId"`
	InstallationID string `json:"installationId,omitempty"`
	IsActive       bool   `json:"isActive"`
}

type GithubRepoDTO struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	FullName string `json:"fullName"`
	Private  bool   `json:"private"`
}

type GithubBranchDTO struct {
	Name string `json:"name"`
}
