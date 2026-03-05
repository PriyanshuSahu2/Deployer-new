package dtos_roles

import "github.com/google/uuid"

type CreateRoleDTO struct {
	RoleName      string `json:"role_name" binding:"required"`
	Description   string `json:"description"`
	WorkspaceUUID string `json:"workspace_uuid" binding:"required"`
}

type UpdateRoleDTO struct {
	UUID        string `json:"uuid"`
	RoleName    string `json:"role_name" binding:"required"`
	Description string `json:"description"`
}

type RoleResponseDTO struct {
	UUID        uuid.UUID `json:"uuid"`
	RoleName    string    `json:"role_name"`
	Description string    `json:"description"`
	IsSystem    bool      `json:"is_system"`
	CreatedAt   string    `json:"created_at"`
}

type RolePermissionRowDTO struct {
	PermissionID   uint    `json:"permission_id"`
	Key            string  `json:"key"`
	Module         *string `json:"module"`
	Description    string  `json:"description"`
	RolePermission *uint   `json:"role_permission_id"`
	Allowed        bool    `json:"allowed"`
}

type RolePermissionItemDTO struct {
	PermissionID uint `json:"permission_id"`
	Allowed      bool `json:"allowed"`
}

type UpdateRolePermissionsDTO struct {
	PermissionIDs []uint                  `json:"permission_ids"`
	Permissions   []RolePermissionItemDTO `json:"permissions"`
}
