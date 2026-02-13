package dtos_roles

type CreateRoleDTO struct {
	RoleName    string `json:"role_name" binding:"required"`
	WorkspaceID uint   `json:"workspace_id" binding:"required"`
}

type UpdateRoleDTO struct {
	UUID     string `json:"uuid" binding:"required"`
	RoleName string `json:"role_name" binding:"required"`
}

type RoleResponseDTO struct {
	UUID      string `json:"uuid"`
	RoleName  string `json:"role_name"`
	CreatedAt string `json:"created_at"`
}
