package dtos_workspace

type WorkspaceInviteResponseDTO struct {
	WorkspaceName string `json:"workspace_name"`
	Email         string `json:"email"`
	Role          string `json:"role"`
	RoleUUID      string `json:"role_uuid"`
	Token         string `json:"token"`
	InvitedBy     string `json:"invited_by"`
	Status        string `json:"status"`
}
