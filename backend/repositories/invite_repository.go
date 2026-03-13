package repositories

import (
	"backend/db"
	models_workspace "backend/models/workspace"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type InviteRepository struct{}

func NewInviteRepository() *InviteRepository {
	return &InviteRepository{}
}

func (r *InviteRepository) GetByWorkspaceID(tx *gorm.DB, workspaceID uint) ([]models_workspace.WorkspaceInvite, error) {
	var invites []models_workspace.WorkspaceInvite
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Workspace").
		Preload("Role").
		Preload("Inviter").
		Where("workspace_id = ?", workspaceID).
		Find(&invites).Error

	return invites, err
}

func (r *InviteRepository) GetByToken(tx *gorm.DB, token string) (*models_workspace.WorkspaceInvite, error) {
	var invite models_workspace.WorkspaceInvite
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Workspace").
		Preload("Role").
		Preload("Inviter").
		Where("token = ?", token).
		First(&invite).Error

	return &invite, err
}

func (r *InviteRepository) LockByTokenAndEmail(tx *gorm.DB, token, email string) (*models_workspace.WorkspaceInvite, error) {
	var invite models_workspace.WorkspaceInvite

	err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("token = ? AND email = ?", token, email).
		First(&invite).Error

	return &invite, err
}

func (r *InviteRepository) LockByToken(tx *gorm.DB, token string) (*models_workspace.WorkspaceInvite, error) {
	var invite models_workspace.WorkspaceInvite

	err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("token = ?", token).
		First(&invite).Error

	return &invite, err
}

func (r *InviteRepository) UpdateStatus(tx *gorm.DB, invite *models_workspace.WorkspaceInvite, status models_workspace.InviteStatus) error {
	invite.Status = status
	return tx.Save(invite).Error
}

func (r *InviteRepository) GetByEmail(tx *gorm.DB, email string) ([]models_workspace.WorkspaceInvite, error) {
	var invites []models_workspace.WorkspaceInvite
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Workspace").
		Preload("Role").
		Preload("Inviter").
		Where("email = ?", email).
		Find(&invites).Error

	return invites, err
}

func (r *InviteRepository) Create(tx *gorm.DB, invite *models_workspace.WorkspaceInvite) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(invite).Error
}
