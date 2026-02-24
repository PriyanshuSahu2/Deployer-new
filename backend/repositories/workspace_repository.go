package repositories

import (
	"backend/db"
	models_workspace "backend/models/workspace"
)

type WorkspaceRepository struct{}

func NewWorkspaceRepository() *WorkspaceRepository {
	return &WorkspaceRepository{}
}

func (r *WorkspaceRepository) Create(workspace *models_workspace.Workspace) error {
	return db.DB.Create(workspace).Error
}

func (r *WorkspaceRepository) Update(workspace *models_workspace.Workspace) error {
	return db.DB.Save(workspace).Error
}

func (r *WorkspaceRepository) GetByUUIDAndOwner(uuid string, ownerID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	err := db.DB.Where("uuid = ? AND owner_id = ?", uuid, ownerID).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetByUUID(uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	err := db.DB.Where("uuid = ?", uuid).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetByID(id *uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	err := db.DB.Where("id = ?", id).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetUserWorkspaces(userID uint) ([]models_workspace.Workspace, error) {
	var workspaces []models_workspace.Workspace

	err := db.DB.
		Joins("INNER JOIN workspace_members WM on WM.workspace_id = workspaces.id").
		Where("WM.user_id = ?", userID).
		Find(&workspaces).Error

	return workspaces, err
}

func (r *WorkspaceRepository) GetLatestOwnedWorkspace(userID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	err := db.DB.
		Where("owner_id = ?", userID).
		Order("created_at DESC").
		First(&workspace).Error

	return &workspace, err
}

func (r *WorkspaceRepository) GetFirstAccessibleWorkspace(userID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace

	err := db.DB.
		Joins("INNER JOIN workspace_members WM on WM.workspace_id = workspaces.id").
		Where("WM.user_id = ?", userID).
		Order("workspaces.created_at ASC").
		First(&workspace).Error

	return &workspace, err
}
