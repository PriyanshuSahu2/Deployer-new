package dtos_workspace

import (
	"time"

	"github.com/google/uuid"
)

type CreateWorkspaceDTO struct {
	Name string `json:"name" binding:"required"`
}

type UpdateWorkspaceDTO struct {
	UUID string `json:"uuid" binding:"required"`
	Name string `json:"name" binding:"required"`
}

type WorkspaceSettingsDTO struct {
	UUID                       string                       `json:"uuid"`
	Name                       string                       `json:"name"`
	Slug                       string                       `json:"slug"`
	DefaultBranch              string                       `json:"defaultBranch"`
	AutoDeployDefault          bool                         `json:"autoDeployDefault"`
	DefaultEnvironmentName     string                       `json:"defaultEnvironmentName"`
	DeploymentTimeoutSeconds   int                          `json:"deploymentTimeoutSeconds"`
	AllowedEmailDomains        []string                     `json:"allowedEmailDomains"`
	EnforceInviteRestrictions  bool                         `json:"enforceInviteRestrictions"`
	RequireTwoFactor           bool                         `json:"requireTwoFactor"`
	EnablePreviewDeployments   bool                         `json:"enablePreviewDeployments"`
	EnableExperimentalFeatures bool                         `json:"enableExperimentalFeatures"`
	OwnerUserUUID              string                       `json:"ownerUserUuid"`
	IsOwner                    bool                         `json:"isOwner"`
	CreatedAt                  time.Time                    `json:"createdAt"`
	APIKeys                    []WorkspaceAPIKeyDTO         `json:"apiKeys"`
	Members                    []WorkspaceSettingsMemberDTO `json:"members"`
}

type UpdateWorkspaceSettingsDTO struct {
	Name                       string   `json:"name" binding:"required"`
	Slug                       string   `json:"slug"`
	DefaultBranch              string   `json:"defaultBranch"`
	AutoDeployDefault          bool     `json:"autoDeployDefault"`
	DefaultEnvironmentName     string   `json:"defaultEnvironmentName"`
	DeploymentTimeoutSeconds   int      `json:"deploymentTimeoutSeconds"`
	AllowedEmailDomains        []string `json:"allowedEmailDomains"`
	EnforceInviteRestrictions  bool     `json:"enforceInviteRestrictions"`
	RequireTwoFactor           bool     `json:"requireTwoFactor"`
	EnablePreviewDeployments   bool     `json:"enablePreviewDeployments"`
	EnableExperimentalFeatures bool     `json:"enableExperimentalFeatures"`
}

type WorkspaceAPIKeyDTO struct {
	UUID       string     `json:"uuid"`
	Name       string     `json:"name"`
	Prefix     string     `json:"prefix"`
	CreatedAt  time.Time  `json:"createdAt"`
	LastUsedAt *time.Time `json:"lastUsedAt"`
}

type CreateWorkspaceAPIKeyDTO struct {
	Name string `json:"name" binding:"required"`
}

type CreatedWorkspaceAPIKeyDTO struct {
	WorkspaceAPIKeyDTO
	Key string `json:"key"`
}

type TransferOwnershipDTO struct {
	NewOwnerID string `json:"newOwnerId" binding:"required"`
}

type WorkspaceSettingsMemberDTO struct {
	UserUUID string `json:"userUuid"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type ListWorkspaceDTO struct {
	UUID      uuid.UUID `json:"uuid"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
