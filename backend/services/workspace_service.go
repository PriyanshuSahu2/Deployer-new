package services

import (
	"backend/db"
	models_workspace "backend/models/workspace"
)

func GetWorkspaceByUUID(uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	err := db.DB.
		Where("uuid = ?", uuid).
		First(&workspace).Error

	if err != nil {
		return nil, err
	}

	return &workspace, nil
}
