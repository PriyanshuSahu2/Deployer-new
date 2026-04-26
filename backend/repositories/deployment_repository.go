package repositories

import (
	"backend/db"
	models_service "backend/models/service"
	"time"

	"gorm.io/gorm"
)

type DeploymentRepository struct{}

func NewDeploymentRepository() *DeploymentRepository {
	return &DeploymentRepository{}
}

func (r *DeploymentRepository) Create(tx *gorm.DB, deployment *models_service.Deployment) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Create(deployment).Error
}

func (r *DeploymentRepository) Update(tx *gorm.DB, deployment *models_service.Deployment) error {
	query := db.DB
	if tx != nil {
		query = tx
	}
	return query.Save(deployment).Error
}

func (r *DeploymentRepository) GetRecentDeploymentsByWorkspace(tx *gorm.DB, workspaceID uint, limit int) ([]models_service.Deployment, error) {
	var deployments []models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Service").
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ?", workspaceID).
		Order("deployments.created_at DESC").
		Limit(limit).
		Find(&deployments).Error

	return deployments, err
}

func (r *DeploymentRepository) GetTotalDeploymentsByWorkspace(tx *gorm.DB, workspaceID uint) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Model(&models_service.Deployment{}).
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ?", workspaceID).
		Count(&count).Error

	return count, err
}

func (r *DeploymentRepository) GetByUUID(tx *gorm.DB, uuid string) (*models_service.Deployment, error) {
	var deployment models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Where("uuid = ?", uuid).First(&deployment).Error
	return &deployment, err
}

func (r *DeploymentRepository) GetByUUIDAndWorkspace(tx *gorm.DB, uuid string, workspaceID uint) (*models_service.Deployment, error) {
	var deployment models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Service").
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("deployments.uuid = ? AND projects.workspace_id = ?", uuid, workspaceID).
		First(&deployment).Error
	return &deployment, err
}

func (r *DeploymentRepository) GetAllDeploymentsByWorkspace(tx *gorm.DB, workspaceID uint) ([]models_service.Deployment, error) {
	var deployments []models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Service").
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ?", workspaceID).
		Order("deployments.created_at DESC").
		Find(&deployments).Error

	return deployments, err
}

func (r *DeploymentRepository) CountByWorkspaceAndStatusSince(tx *gorm.DB, workspaceID uint, status string, since time.Time) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Model(&models_service.Deployment{}).
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ? AND deployments.status = ? AND deployments.created_at >= ?", workspaceID, status, since).
		Count(&count).Error

	return count, err
}

func (r *DeploymentRepository) CountByWorkspaceSince(tx *gorm.DB, workspaceID uint, since time.Time) (int64, error) {
	var count int64
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Model(&models_service.Deployment{}).
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ? AND deployments.created_at >= ?", workspaceID, since).
		Count(&count).Error

	return count, err
}

func (r *DeploymentRepository) GetLatestDeploymentByWorkspace(tx *gorm.DB, workspaceID uint) (*models_service.Deployment, error) {
	var deployment models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.
		Preload("Service").
		Joins("JOIN services ON services.id = deployments.service_id").
		Joins("JOIN projects ON projects.id = services.project_id").
		Where("projects.workspace_id = ?", workspaceID).
		Order("deployments.created_at DESC").
		First(&deployment).Error

	return &deployment, err
}

func (r *DeploymentRepository) GetLatestDeploymentByService(tx *gorm.DB, serviceID uint) (*models_service.Deployment, error) {
	var deployment models_service.Deployment
	query := db.DB
	if tx != nil {
		query = tx
	}

	err := query.Where("service_id = ?", serviceID).Order("created_at DESC").First(&deployment).Error
	if err != nil {
		return nil, err
	}
	return &deployment, nil
}
