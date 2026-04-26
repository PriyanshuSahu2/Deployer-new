package repositories

import (
	"backend/db"
	models_workspace "backend/models/workspace"
	"time"

	"gorm.io/gorm"
)

type WorkspaceAPIKeyRepository struct{}

func NewWorkspaceAPIKeyRepository() *WorkspaceAPIKeyRepository {
	return &WorkspaceAPIKeyRepository{}
}

func (r *WorkspaceAPIKeyRepository) ListActiveByWorkspace(tx *gorm.DB, workspaceID uint) ([]models_workspace.WorkspaceAPIKey, error) {
	var keys []models_workspace.WorkspaceAPIKey
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Where("workspace_id = ? AND revoked_at IS NULL", workspaceID).
		Order("created_at DESC").
		Find(&keys).Error

	return keys, err
}

func (r *WorkspaceAPIKeyRepository) Create(tx *gorm.DB, key *models_workspace.WorkspaceAPIKey) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(key).Error
}

func (r *WorkspaceAPIKeyRepository) RevokeByUUIDAndWorkspace(tx *gorm.DB, uuid string, workspaceID uint) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	now := time.Now()
	result := query.
		Model(&models_workspace.WorkspaceAPIKey{}).
		Where("uuid = ? AND workspace_id = ? AND revoked_at IS NULL", uuid, workspaceID).
		Update("revoked_at", &now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
