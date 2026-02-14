package dtos_workspace

import "github.com/google/uuid"

type AddMemberDTO struct {
	WorkspaceUUID string     `json:"workspace_uuid" binding:"required"`
	UserEmail     string     `json:"user_email" binding:"required,email"`
	UserUUID      *uuid.UUID `json:"user_uuid" binding:"required"`
	RoleUUID      *string    `json:"role_uuid" binding:"required"`
}

type AddMemberDTOInternal struct {
	WorkspaceID uint `json:"workspace_id" binding:"required"`
	UserID      uint `json:"user_id" binding:"required"`
	RoleID      uint `json:"role_id" binding:"required"`
	InvitedByID uint `json:"invited_by_id"`
}
