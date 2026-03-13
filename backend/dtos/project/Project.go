package dtos_project

import dtos_environment "backend/dtos/environment"

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
	UUID         string                                    `json:"uuid"`
	Name         string                                    `json:"name"`
	Description  string                                    `json:"description"`
	Framework    string                                    `json:"framework"`
	WorkspaceID  uint                                      `json:"workspace_id"`
	CreatedBy    uint                                      `json:"created_by"`
	CreatedAt    string                                    `json:"created_at"`
	Environments []dtos_environment.ResponseEnvironmentDTO `json:"environments"`
}
