package dtos_workspace

type CreateWorkspaceDTO struct {
	Name string `json:"name" binding:"required"`
}

type UpdateWorkspaceDTO struct {
	UUID string `json:"uuid" binding:"required"`
	Name string `json:"name" binding:"required"`
}

type ListWorkspaceDTO struct {
	UUID      string `json:"uuid"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
