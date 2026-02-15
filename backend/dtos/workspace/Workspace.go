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

type ListWorkspaceDTO struct {
	UUID      uuid.UUID `json:"uuid"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
