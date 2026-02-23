package repositories

import (
	"backend/db"
	models_workspace "backend/models/workspace"

	"gorm.io/gorm"
)

type MemberRepository struct{}

func NewMemberRepository() *MemberRepository {
	return &MemberRepository{}
}

// 🔹 Get all members of workspace
func (r *MemberRepository) GetByWorkspaceID(workspaceID uint) ([]models_workspace.WorkspaceMember, error) {
	var members []models_workspace.WorkspaceMember

	err := db.DB.
		Preload("User").
		Preload("Role").
		Preload("InvitedBy").
		Where("workspace_id = ?", workspaceID).
		Find(&members).Error

	return members, err
}

func (r *MemberRepository) Exists(tx *gorm.DB, workspaceID, userID uint) (bool, error) {
	var count int64

	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Model(&models_workspace.WorkspaceMember{}).
		Where("workspace_id = ? AND user_id = ?", workspaceID, userID).
		Count(&count).Error

	return count > 0, err
}

func (r *MemberRepository) Create(tx *gorm.DB, member models_workspace.WorkspaceMember) error {
	query := db.DB
	if tx != nil {
		query = tx
	}

	return query.Create(&member).Error
}
