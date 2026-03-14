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
