package dtos_workspace

import "github.com/google/uuid"

type AddMemberDTO struct {
	WorkspaceUUID string     `json:"workspace_uuid" binding:"required"`
	UserEmail     string     `json:"user_email" binding:"required,email"`
	UserUUID      *uuid.UUID `json:"user_uuid"`
	RoleUUID      *string    `json:"role_uuid" binding:"required"`
}

type AddMemberDTOInternal struct {
	WorkspaceID uint `json:"workspace_id" binding:"required"`
	UserID      uint `json:"user_id" binding:"required"`
	RoleID      uint `json:"role_id" binding:"required"`
	InvitedByID uint `json:"invited_by_id"`
}

type MemberResponseDTO struct {
	UserUUID  uuid.UUID `json:"user_uuid"`
	UserEmail string    `json:"email"`
	UserName  string    `json:"name"`
	RoleName  string    `json:"role"`
	RoleUUID  uuid.UUID `json:"role_uuid"`
	InvitedBy string    `json:"invited_by"`
}
