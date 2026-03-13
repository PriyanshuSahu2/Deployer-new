package repositories

import (
	"backend/db"
	models_workspace "backend/models/workspace"
	"gorm.io/gorm"
)

type WorkspaceRepository struct{}

func NewWorkspaceRepository() *WorkspaceRepository {
	return &WorkspaceRepository{}
}

func (r *WorkspaceRepository) Create(tx *gorm.DB, workspace *models_workspace.Workspace) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(workspace).Error
}

func (r *WorkspaceRepository) Update(tx *gorm.DB, workspace *models_workspace.Workspace) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Save(workspace).Error
}

func (r *WorkspaceRepository) GetByUUIDAndOwner(tx *gorm.DB, uuid string, ownerID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("uuid = ? AND owner_id = ?", uuid, ownerID).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetByUUID(tx *gorm.DB, uuid string) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("uuid = ?", uuid).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetByID(tx *gorm.DB, id *uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}
	err := query.Where("id = ?", id).First(&workspace).Error
	return &workspace, err
}

func (r *WorkspaceRepository) GetUserWorkspaces(tx *gorm.DB, userID uint) ([]models_workspace.Workspace, error) {
	var workspaces []models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Joins("INNER JOIN workspace_members WM on WM.workspace_id = workspaces.id").
		Where("WM.user_id = ?", userID).
		Find(&workspaces).Error

	return workspaces, err
}

func (r *WorkspaceRepository) GetLatestOwnedWorkspace(tx *gorm.DB, userID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Where("owner_id = ?", userID).
		Order("created_at DESC").
		First(&workspace).Error

	return &workspace, err
}

func (r *WorkspaceRepository) GetFirstAccessibleWorkspace(tx *gorm.DB, userID uint) (*models_workspace.Workspace, error) {
	var workspace models_workspace.Workspace
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Joins("INNER JOIN workspace_members WM on WM.workspace_id = workspaces.id").
		Where("WM.user_id = ?", userID).
		Order("workspaces.created_at ASC").
		First(&workspace).Error

	return &workspace, err
}
